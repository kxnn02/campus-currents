import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configured for offline-first mobile usage.
 * - retry: 2 attempts before failing
 * - retryDelay: exponential backoff capped at 10s
 * - networkMode: offlineFirst serves cached data immediately
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
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
 */
export const staleTimeConfig = {
  broadcasts: 60_000,      // 60 seconds
  suspensions: 30_000,     // 30 seconds
  calendarEvents: 300_000, // 5 minutes
  profile: 600_000,        // 10 minutes
};
