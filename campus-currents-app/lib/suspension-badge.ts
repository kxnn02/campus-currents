import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Lightweight hook to check if there's any active suspension today or upcoming.
 * Used by the tab bar to show a badge on the Status tab.
 * Does NOT filter by student's program/level — just indicates "something is active."
 */
export function useSuspensionBadge() {
  const { data } = useQuery({
    queryKey: ['suspension-badge'],
    queryFn: async () => {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
      const { count, error } = await supabase
        .from('class_suspensions')
        .select('*', { count: 'exact', head: true })
        .gte('suspension_date', today)
        .eq('status', 'active');

      if (error) return false;
      return (count ?? 0) > 0;
    },
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Re-check every minute
  });

  return { hasSuspension: data ?? false };
}
