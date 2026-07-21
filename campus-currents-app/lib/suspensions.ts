import { useQuery } from '@tanstack/react-query';

import {
  ClassSuspension,
  Level,
  Program,
  SuspensionDuration,
  SuspensionReason,
  SuspensionSource,
} from '@/types/database';
import { queryKeys, staleTimeConfig } from '@/lib/query';
import { supabase } from '@/lib/supabase';

/**
 * Determines whether a class suspension applies to a given student based on scope matching.
 *
 * Scopes:
 * - `all_levels` → applies to everyone
 * - `college_only` → only college-level students
 * - `grade_school_only` → only grade school students
 * - `junior_high_only` → only junior high students
 * - `senior_high_only` → only senior high students
 * - `k12_only` → grade_school, junior_high, or senior_high
 * - `law_only` → only law students
 * - `specific_programs` → only students whose program is in scope_detail.programs
 * - Unrecognized scope → fail-open (return true)
 */
export function suspensionAppliesToStudent(
  suspension: ClassSuspension,
  profile: { level: Level | null; program: Program | null }
): boolean {
  switch (suspension.scope) {
    case 'all_levels':
      return true;
    case 'college_only':
      return profile.level === 'college';
    case 'grade_school_only':
      return profile.level === 'grade_school';
    case 'junior_high_only':
      return profile.level === 'junior_high';
    case 'senior_high_only':
      return profile.level === 'senior_high';
    case 'k12_only':
      return ['grade_school', 'junior_high', 'senior_high'].includes(profile.level ?? '');
    case 'law_only':
      return profile.level === 'law';
    case 'specific_programs': {
      const programs = (suspension.scope_detail as { programs?: string[] })?.programs ?? [];
      return programs.includes(profile.program ?? '');
    }
    default:
      return true; // fail-open
  }
}

/**
 * Maps a suspension source enum value to a human-readable string.
 */
export function formatSuspensionSource(source: SuspensionSource): string {
  const sourceMap: Record<SuspensionSource, string> = {
    manila_lgu: 'Manila LGU',
    pagasa: 'PAGASA',
    deped: 'DepEd',
    school_admin: 'School Admin',
  };
  return sourceMap[source] ?? source;
}

/**
 * Maps a suspension reason enum value to a human-readable string.
 */
export function formatSuspensionReason(reason: SuspensionReason): string {
  const reasonMap: Record<SuspensionReason, string> = {
    weather_flooding: 'Flooding',
    weather_typhoon: 'Typhoon',
    lgu_order: 'LGU Order',
    facilities: 'Facilities Issue',
    security: 'Security Concern',
    other: 'Other',
  };
  return reasonMap[reason] ?? reason;
}

/**
 * Maps a suspension duration enum value to a human-readable string.
 */
export function formatSuspensionDuration(duration: SuspensionDuration): string {
  const durationMap: Record<SuspensionDuration, string> = {
    full_day: 'Full day',
    am_only: 'AM only',
    pm_only: 'PM only',
  };
  return durationMap[duration] ?? duration;
}

/**
 * Derives a student's educational level from their program.
 *
 * This avoids requiring a separate "level" dropdown in the profile form —
 * the level is inferred from the selected program since SSC-R programs
 * map cleanly to levels.
 */
export function deriveLevelFromProgram(program: Program): Level {
  switch (program) {
    case 'BSIT':
    case 'BSBA':
    case 'BSA':
    case 'BSED':
    case 'BEED':
    case 'AB_PSYCH':
    case 'AB_COMM':
    case 'OTHER':
      return 'college';
    case 'JD':
      return 'law';
    case 'ETEEAP':
      return 'eteeap';
    case 'STEM':
    case 'ABM':
    case 'HUMSS':
    case 'GAS':
    case 'TVL':
      return 'senior_high';
    default:
      return 'college'; // safe default for SSC-R Manila
  }
}


/**
 * Returns today's date string in Asia/Manila timezone formatted as YYYY-MM-DD.
 */
function getTodayManila(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

/** Result shape returned by useActiveSuspensions */
export interface ActiveSuspensionsResult {
  todaySuspensions: ClassSuspension[];
  upcomingSuspensions: ClassSuspension[];
}

/**
 * Fetches all active class suspensions from today onwards that apply to the given student profile.
 *
 * - Queries `class_suspensions` where `suspension_date >= today (Asia/Manila)` AND `status = 'active'`
 * - Applies client-side filtering via `suspensionAppliesToStudent` using the student's level and program
 * - Derives level from program via `deriveLevelFromProgram` when profile.level is null
 * - Partitions results into `todaySuspensions` (date == today) and `upcomingSuspensions` (date > today)
 *
 * Uses staleTime of 30 seconds per configuration.
 */
export function useActiveSuspensions(
  profile: { level: Level | null; program: Program | null },
  options?: { enabled?: boolean }
) {
  const level = profile.level ?? (profile.program ? deriveLevelFromProgram(profile.program) : null);
  const enabled = options?.enabled ?? true;

  return useQuery<ActiveSuspensionsResult>({
    queryKey: queryKeys.suspensions.active(),
    queryFn: async () => {
      const today = getTodayManila();

      const { data, error } = await supabase
        .from('class_suspensions')
        .select('*')
        .gte('suspension_date', today)
        .eq('status', 'active')
        .order('suspension_date', { ascending: true });

      if (error) throw error;

      const applicable = (data as ClassSuspension[]).filter((suspension) =>
        suspensionAppliesToStudent(suspension, { level, program: profile.program })
      );

      const todaySuspensions = applicable.filter((s) => s.suspension_date === today);
      const upcomingSuspensions = applicable.filter((s) => s.suspension_date > today);

      return { todaySuspensions, upcomingSuspensions };
    },
    staleTime: staleTimeConfig.suspensions,
    enabled,
  });
}

/**
 * @deprecated Use `useActiveSuspensions` instead. Kept for backward compatibility.
 */
export function useTodaySuspensions(
  profile: { level: Level | null; program: Program | null },
  options?: { enabled?: boolean }
) {
  const level = profile.level ?? (profile.program ? deriveLevelFromProgram(profile.program) : null);
  const enabled = options?.enabled ?? true;

  return useQuery<ClassSuspension[]>({
    queryKey: queryKeys.suspensions.today(),
    queryFn: async () => {
      const today = getTodayManila();

      const { data, error } = await supabase
        .from('class_suspensions')
        .select('*')
        .eq('suspension_date', today)
        .eq('status', 'active');

      if (error) throw error;

      return (data as ClassSuspension[]).filter((suspension) =>
        suspensionAppliesToStudent(suspension, { level, program: profile.program })
      );
    },
    staleTime: staleTimeConfig.suspensions,
    enabled,
  });
}
