import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { syncPendingReceipts } from '@/lib/receipts';
import { queryClient } from '@/lib/query';

// --- Safe NetInfo import ---
let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  // NetInfo not available (Expo Go) — connectivity sync will be disabled
}

// --- Types ---

export interface ConnectivitySyncState {
  /** Whether we are currently offline and serving cached/stale data */
  isServingStaleData: boolean;
  /** Whether a "Connection timed out" message should be displayed */
  showTimeoutToast: boolean;
  /** Dismiss the timeout toast */
  dismissTimeoutToast: () => void;
}

// --- Constants ---

const CONNECTION_TIMEOUT_MS = 10_000; // 10 seconds

// --- Hook ---

/**
 * useConnectivitySync — Manages offline receipt syncing and connectivity restore logic.
 *
 * Responsibilities:
 * 1. On offline → online transition: syncs pending receipts, invalidates stale queries.
 * 2. On app foreground (AppState → "active"): syncs pending receipts.
 * 3. Tracks "Connection timed out" state for 10s network timeouts.
 * 4. Tracks whether the app is serving stale/cached data while offline.
 *
 * Usage: Call this hook once in the root layout (or a wrapper provider).
 */
export function useConnectivitySync(): ConnectivitySyncState {
  const wasOfflineRef = useRef(false);
  const [isServingStaleData, setIsServingStaleData] = useState(false);
  const [showTimeoutToast, setShowTimeoutToast] = useState(false);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissTimeoutToast = useCallback(() => {
    setShowTimeoutToast(false);
  }, []);

  // --- NetInfo: offline → online transition ---
  useEffect(() => {
    if (!NetInfo) return; // Skip if native module unavailable (Expo Go)

    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const isOnline = (state.isConnected ?? true) && (state.isInternetReachable ?? true);

      if (!isOnline) {
        // We just went offline — mark as serving stale data
        wasOfflineRef.current = true;
        setIsServingStaleData(true);

        // Start timeout timer: if offline for 10s, show timeout toast
        if (!timeoutTimerRef.current) {
          timeoutTimerRef.current = setTimeout(() => {
            setShowTimeoutToast(true);
            timeoutTimerRef.current = null;
          }, CONNECTION_TIMEOUT_MS);
        }
      } else if (wasOfflineRef.current) {
        // Transitioning from offline → online
        wasOfflineRef.current = false;
        setIsServingStaleData(false);
        setShowTimeoutToast(false);

        // Clear timeout timer if reconnected before 10s
        if (timeoutTimerRef.current) {
          clearTimeout(timeoutTimerRef.current);
          timeoutTimerRef.current = null;
        }

        // Sync pending receipts that accumulated while offline
        syncPendingReceipts().catch(() => {
          // Silently fail — will retry on next trigger
        });

        // Invalidate stale queries so visible screens refetch fresh data
        queryClient.invalidateQueries().catch(() => {
          // Silently fail — queries will refetch on next access
        });
      }
    });

    return () => {
      unsubscribe();
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
    };
  }, []);

  // --- AppState: sync pending receipts on foreground ---
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground — sync any queued receipts
        syncPendingReceipts().catch(() => {
          // Silently fail — will retry on next trigger
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    isServingStaleData,
    showTimeoutToast,
    dismissTimeoutToast,
  };
}
