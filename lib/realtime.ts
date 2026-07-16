import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useUnreadCount } from '@/lib/feed';
import { ActiveEmergency } from '@/lib/emergency';
import type { QueryClient } from '@tanstack/react-query';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// --- Types ---

export type RealtimePayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface RealtimeSubscriptionConfig {
  table: string;
  event: 'INSERT' | 'UPDATE' | '*';
  filter?: string;
  onEvent: (payload: RealtimePayload) => void;
}

// --- Constants ---

const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const BACKOFF_MULTIPLIER = 2;
const SUSTAINED_DISCONNECT_THRESHOLD_MS = 30000;
const POLLING_INTERVAL_MS = 30000;

// --- Generic Realtime Subscription Hook ---

/**
 * Creates a Supabase Realtime channel subscription to postgres_changes events.
 * Implements reconnection with exponential backoff (1s → 2s → 4s → ... → 30s cap).
 * Returns connection status for UI display (e.g., ReconnectingBanner).
 *
 * Fallback: if disconnected for >30s, invokes onEvent periodically via polling as degraded mode.
 */
export function useRealtimeSubscription(config: RealtimeSubscriptionConfig): {
  status: ConnectionStatus;
} {
  const { table, event, filter, onEvent } = config;
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const disconnectTimestampRef = useRef<number | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEventRef = useRef(onEvent);
  const mountedRef = useRef(true);

  // Keep onEvent ref current to avoid stale closures
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const startPollingFallback = useCallback(() => {
    // Only start polling if not already polling
    if (pollingIntervalRef.current) return;

    pollingIntervalRef.current = setInterval(() => {
      // Trigger a synthetic "poll" event to let consumers know they should refetch
      onEventRef.current({
        schema: 'public',
        table,
        commit_timestamp: new Date().toISOString(),
        eventType: event === '*' ? 'INSERT' : event,
        new: {},
        old: {},
        errors: null,
      } as unknown as RealtimePayload);
    }, POLLING_INTERVAL_MS);
  }, [table, event]);

  const subscribe = useCallback(() => {
    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = `realtime-${table}-${event}-${filter ?? 'all'}-${Date.now()}`;

    const channelConfig: {
      event: 'INSERT' | 'UPDATE' | '*';
      schema: string;
      table: string;
      filter?: string;
    } = {
      event,
      schema: 'public',
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        channelConfig,
        (payload: RealtimePayload) => {
          onEventRef.current(payload);
        }
      )
      .subscribe((status: string) => {
        if (!mountedRef.current) return;

        if (status === 'SUBSCRIBED') {
          setStatus('connected');
          retryCountRef.current = 0;
          disconnectTimestampRef.current = null;
          clearPolling();
          clearRetryTimeout();
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          handleDisconnect();
        }
      });

    channelRef.current = channel;
  }, [table, event, filter, clearPolling, clearRetryTimeout]);

  const handleDisconnect = useCallback(() => {
    if (!mountedRef.current) return;

    // Record when disconnect started
    if (!disconnectTimestampRef.current) {
      disconnectTimestampRef.current = Date.now();
    }

    setStatus('reconnecting');

    // Check if we've been disconnected long enough to start polling fallback
    const disconnectDuration = Date.now() - disconnectTimestampRef.current;
    if (disconnectDuration >= SUSTAINED_DISCONNECT_THRESHOLD_MS) {
      startPollingFallback();
    }

    // Calculate backoff delay
    const backoffDelay = Math.min(
      INITIAL_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, retryCountRef.current),
      MAX_BACKOFF_MS
    );

    retryCountRef.current += 1;

    clearRetryTimeout();
    retryTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      subscribe();
    }, backoffDelay);
  }, [subscribe, startPollingFallback, clearRetryTimeout]);

  // Subscribe on mount, cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    subscribe();

    return () => {
      mountedRef.current = false;
      clearRetryTimeout();
      clearPolling();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [subscribe, clearRetryTimeout, clearPolling]);

  // Handle app state changes — reconnect when returning to foreground
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && status === 'disconnected') {
        retryCountRef.current = 0;
        subscribe();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [status, subscribe]);

  return { status };
}

// --- Broadcasts Realtime Hook ---

/**
 * Subscribes to broadcasts INSERT events via Supabase Realtime.
 * On event: invalidates feed cache and increments the unread count.
 */
export function useRealtimeBroadcasts(queryClient: QueryClient): void {
  const { increment } = useUnreadCount();
  const incrementRef = useRef(increment);

  useEffect(() => {
    incrementRef.current = increment;
  }, [increment]);

  useRealtimeSubscription({
    table: 'broadcasts',
    event: 'INSERT',
    onEvent: () => {
      // Invalidate the broadcasts feed cache so TanStack Query refetches
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      // Increment unread badge count
      incrementRef.current();
    },
  });
}

// --- Suspensions Realtime Hook ---

/**
 * Subscribes to class_suspensions INSERT and UPDATE events via Supabase Realtime.
 * On event: invalidates suspension cache so Status screen auto-updates.
 */
export function useRealtimeSuspensions(queryClient: QueryClient): void {
  useRealtimeSubscription({
    table: 'class_suspensions',
    event: '*',
    onEvent: () => {
      // Invalidate the suspensions cache so TanStack Query refetches
      queryClient.invalidateQueries({ queryKey: ['suspensions'] });
    },
  });
}

// --- Emergency Realtime Hook ---

/**
 * Subscribes to active_emergencies INSERT events via Supabase Realtime.
 * On event: calls onNewEmergency callback to trigger the Emergency Overlay.
 */
export function useRealtimeEmergency(
  onNewEmergency: (emergency: ActiveEmergency) => void
): void {
  const onNewEmergencyRef = useRef(onNewEmergency);

  useEffect(() => {
    onNewEmergencyRef.current = onNewEmergency;
  }, [onNewEmergency]);

  useRealtimeSubscription({
    table: 'active_emergencies',
    event: 'INSERT',
    onEvent: (payload) => {
      const newEmergency = payload.new as unknown as ActiveEmergency;
      if (newEmergency && newEmergency.id) {
        onNewEmergencyRef.current(newEmergency);
      }
    },
  });
}
