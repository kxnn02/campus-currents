import React, { createContext, useCallback, useContext, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys, staleTimeConfig } from '@/lib/query';
import { Broadcast, Profile, Program } from '@/types/database';

/**
 * Broadcast extended with sender profile info for detail views.
 */
export interface BroadcastWithSender extends Broadcast {
  sender: { first_name: string; last_name: string };
}

/**
 * Determines whether a broadcast's target_audience includes the given student profile.
 *
 * Rules:
 * - `{"all": true}` → show to everyone
 * - Unrecognized structure (no `programs` or `year_levels` fields) → fail-open (show it)
 * - Both `programs` and `year_levels` present → AND logic (both must match)
 * - Only `programs` → student's program must be in the array
 * - Only `year_levels` → student's year_level must be in the array
 */
export function matchesTargetAudience(
  targetAudience: Record<string, unknown>,
  profile: { program: Program | null; year_level: number | null }
): boolean {
  // Rule 1: {"all": true} → show to everyone
  if (targetAudience.all === true) return true;

  // Rule 2: Unrecognized structure → fail-open (show it)
  const hasPrograms = Array.isArray(targetAudience.programs);
  const hasYearLevels = Array.isArray(targetAudience.year_levels);
  if (!hasPrograms && !hasYearLevels) return true;

  // Evaluate individual matches
  const programMatch = !hasPrograms ||
    (targetAudience.programs as string[]).includes(profile.program ?? '');
  // year_levels may be stored as strings (from FormData) or numbers — normalize both sides
  const yearMatch = !hasYearLevels ||
    (targetAudience.year_levels as (string | number)[]).map(String).includes(String(profile.year_level ?? 0));

  // Rule 3: Both present → AND logic
  if (hasPrograms && hasYearLevels) return programMatch && yearMatch;

  // Rule 4: Only programs
  if (hasPrograms) return programMatch;

  // Rule 5: Only year_levels
  return yearMatch;
}

/**
 * Formats a timestamp into a human-readable relative time string.
 *
 * Buckets:
 * - <60s → "{N}s ago"
 * - 60s to <60min → "{N}m ago"
 * - 1h to <24h → "{N}h ago"
 * - 24h to <48h → "Yesterday"
 * - ≥48h → "MMM D" format (e.g., "Jul 14")
 */
export function formatRelativeTime(sentAt: string): string {
  const now = Date.now();
  const sent = new Date(sentAt).getTime();
  const diffMs = now - sent;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffHr < 48) return 'Yesterday';

  // Beyond 48h: "MMM D" format
  const date = new Date(sentAt);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

const PAGE_SIZE = 20;

/**
 * Fetches paginated broadcast feed using the server-side `get_broadcasts_for_student` RPC.
 * The RPC handles audience filtering in SQL, ensuring each page returns exactly `page_size`
 * matching broadcasts (no sparse pages from client-side filtering).
 */
export function useBroadcastFeed(profile: Profile | null) {
  return useInfiniteQuery({
    queryKey: ['broadcasts', 'feed'],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * PAGE_SIZE;

      const { data, error } = await supabase.rpc('get_broadcasts_for_student', {
        p_program: profile?.program ?? '',
        p_level: profile?.level ?? '',
        p_year_level: profile?.year_level ?? 0,
        p_page_size: PAGE_SIZE,
        p_offset: offset,
      });

      if (error) throw error;

      const broadcasts = (data ?? []) as Broadcast[];

      return {
        broadcasts,
        nextPage: broadcasts.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: staleTimeConfig.broadcasts,
    enabled: !!profile,
  });
}

/**
 * Fetches a single broadcast by ID, joined with the sender's profile (first_name, last_name).
 * Returns BroadcastWithSender shape.
 */
export function useBroadcastDetail(broadcastId: string) {
  return useQuery<BroadcastWithSender>({
    queryKey: queryKeys.broadcasts.detail(broadcastId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broadcasts')
        .select('*, sender:profiles!sender_id(first_name, last_name)')
        .eq('id', broadcastId)
        .single();

      if (error) throw error;

      // Supabase returns sender as an object when using !sender_id join
      const { sender, ...broadcast } = data as any;
      return {
        ...broadcast,
        sender: {
          first_name: sender?.first_name ?? '',
          last_name: sender?.last_name ?? '',
        },
      } as BroadcastWithSender;
    },
    staleTime: staleTimeConfig.broadcasts,
    enabled: !!broadcastId && broadcastId.length > 0,
  });
}

// --- Unread Count Context ---

interface UnreadCountContextValue {
  count: number;
  displayCount: string;
  increment: () => void;
  reset: () => void;
}

const UnreadCountContext = createContext<UnreadCountContextValue | null>(null);

/**
 * Provider that tracks unread broadcast arrivals since last feed navigation.
 * Wrap this around the app's navigation tree.
 */
export function UnreadCountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  const displayCount = count > 9 ? '9+' : String(count);

  const value: UnreadCountContextValue = {
    count,
    displayCount,
    increment,
    reset,
  };

  return React.createElement(UnreadCountContext.Provider, { value }, children);
}

/**
 * Hook to access the unread broadcast count.
 * - `count`: raw number of unread broadcasts since last feed navigation
 * - `displayCount`: capped display string ("9+" for counts > 9)
 * - `increment()`: call when a new broadcast arrives
 * - `reset()`: call when user navigates to the feed tab
 *
 * Returns a no-op fallback if UnreadCountProvider is not mounted.
 */
export function useUnreadCount(): UnreadCountContextValue {
  const context = useContext(UnreadCountContext);
  if (!context) {
    // Fallback when provider is not mounted — prevents crash during initial renders
    return { count: 0, displayCount: '0', increment: () => {}, reset: () => {} };
  }
  return context;
}
