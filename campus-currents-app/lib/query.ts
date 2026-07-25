import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configured for offline-first mobile usage
 * optimized for slow/unreliable mobile data connections (common in PH).
 * - retry: 3 attempts for slow connections
 * - retryDelay: exponential backoff capped at 15s
 * - networkMode: offlineFirst serves cached data immediately
 * - gcTime: 30 minutes — keep cached data longer for offline access
 * - refetchOnReconnect: true — freshen data when connection restores
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15000),
      networkMode: 'offlineFirst',
      gcTime: 1800_000, // 30 minutes — keep data cached even when inactive
      refetchOnReconnect: true,
      refetchOnWindowFocus: false, // Don't refetch on every app foreground (saves data)
    },
    mutations: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      networkMode: 'offlineFirst',
    },
  },
});

/**
 * Query key factory for consistent cache key management.
 * Each key is a const tuple for type safety and easy invalidation.
 */
export const queryKeys = {
  broadcasts: {
    feed: (page: number) => ['broadcasts', 'feed', page] as const,
    detail: (id: string) => ['broadcasts', 'detail', id] as const,
    pinned: () => ['broadcasts', 'pinned'] as const,
  },
  suspensions: {
    today: () => ['suspensions', 'today'] as const,
    active: () => ['suspensions', 'active'] as const,
  },
  calendar: {
    month: (year: number, month: number) => ['calendar', year, month] as const,
    event: (id: string) => ['calendar', 'event', id] as const,
  },
  profile: {
    current: () => ['profile', 'current'] as const,
  },
  emergency: {
    active: () => ['emergency', 'active'] as const,
  },
};

/**
 * Stale time configuration per data category (in milliseconds).
 * Controls how long cached data is considered fresh before background refetch.
 * Tuned for slow mobile data in PH — longer stale times reduce unnecessary requests.
 */
export const staleTimeConfig = {
  broadcasts: 180_000,     // 3 minutes (was 60s) — feed doesn't change that often
  suspensions: 120_000,    // 2 minutes (was 30s) — status updates aren't second-by-second
  calendarEvents: 600_000, // 10 minutes (was 5min) — calendar is relatively static
  profile: 900_000,        // 15 minutes (was 10min) — profile rarely changes
};
