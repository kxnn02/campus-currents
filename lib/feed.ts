import { Broadcast, Program } from '@/types/database';

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
  const yearMatch = !hasYearLevels ||
    (targetAudience.year_levels as number[]).includes(profile.year_level ?? 0);

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
