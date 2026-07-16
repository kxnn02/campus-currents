import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { queryKeys, staleTimeConfig } from '@/lib/query';
import { Profile } from '@/types/database';

// ============================================================
// Context
// ============================================================

interface ProfileContextValue {
  /** The current user's profile, or null if not loaded/authenticated. */
  profile: Profile | null;
  /** True during the initial profile fetch. */
  isLoading: boolean;
  /** Error message if profile fetch failed. */
  error: string | null;
  /** Manually trigger a refetch (e.g., after profile edit). */
  refetch: () => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  isLoading: true,
  error: null,
  refetch: () => {},
});

// ============================================================
// Provider
// ============================================================

/**
 * Provides the authenticated user's profile to the entire app tree.
 * Place this inside your auth-gated layout so it only runs when a session exists.
 *
 * Uses TanStack Query for caching, deduplication, and background refetch.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth state to get the user ID
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery<Profile | null>({
    queryKey: queryKeys.profile.current(),
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return (data as Profile) ?? null;
    },
    enabled: !!userId,
    staleTime: staleTimeConfig.profile,
  });

  const handleRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.current() });
  }, [queryClient]);

  const value: ProfileContextValue = {
    profile: profile ?? null,
    isLoading: !userId ? false : isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load profile') : null,
    refetch: handleRefetch,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

/**
 * Access the current user's profile from any component.
 *
 * @example
 * const { profile, isLoading } = useProfile();
 */
export function useProfile(): ProfileContextValue {
  return useContext(ProfileContext);
}
