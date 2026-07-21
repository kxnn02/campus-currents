/**
 * Suspension utility functions for audience targeting and message generation.
 *
 * These are pure functions with no side effects — suitable for unit testing.
 */

// --- Types ---

export type SuspensionScope =
  | "all_levels"
  | "grade_school_only"
  | "k12_only"
  | "junior_high_only"
  | "senior_high_only"
  | "college_only"
  | "law_only"
  | "specific_programs";

export type Level = "grade_school" | "junior_high" | "senior_high" | "college" | "law" | "eteeap";

export type TargetAudience =
  | { all: true }
  | { levels: Level[] }
  | { programs: string[] };

// --- Scope → Target Audience ---

/**
 * Maps a suspension scope (and optional scope detail) to a target_audience object
 * that the push Edge Function can use for level-based filtering.
 */
export function scopeToTargetAudience(
  scope: SuspensionScope,
  scopeDetail: { programs?: string[] } | null
): TargetAudience {
  switch (scope) {
    case "all_levels":
      return { all: true };
    case "grade_school_only":
      return { levels: ["grade_school"] };
    case "junior_high_only":
      return { levels: ["junior_high"] };
    case "senior_high_only":
      return { levels: ["senior_high"] };
    case "k12_only":
      return { levels: ["grade_school", "junior_high", "senior_high"] };
    case "college_only":
      return { levels: ["college"] };
    case "law_only":
      return { levels: ["law"] };
    case "specific_programs": {
      const programs = scopeDetail?.programs ?? [];
      return { programs };
    }
    default:
      return { all: true };
  }
}

// --- Natural Language Scope ---

/**
 * Formats the scope enum value into a human-readable phrase
 * suitable for inclusion in broadcast messages.
 */
export function formatScopeNatural(scope: SuspensionScope, scopeDetail: { programs?: string[] } | null): string {
  switch (scope) {
    case "all_levels":
      return "all levels";
    case "grade_school_only":
      return "Grade School";
    case "junior_high_only":
      return "Junior High School";
    case "senior_high_only":
      return "Senior High School";
    case "k12_only":
      return "K-12 (Grade School, Junior High, and Senior High)";
    case "college_only":
      return "College";
    case "law_only":
      return "Law";
    case "specific_programs": {
      const programs = scopeDetail?.programs ?? [];
      if (programs.length === 0) return "specific programs";
      if (programs.length <= 3) return programs.join(", ");
      return `${programs.slice(0, 3).join(", ")} and ${programs.length - 3} more`;
    }
    default:
      return "all levels";
  }
}

// --- Source Display Names ---

const SOURCE_NAMES: Record<string, string> = {
  manila_lgu: "Manila LGU",
  pagasa: "PAGASA",
  deped: "DepEd",
  school_admin: "School Administration",
};

// --- Reason Display Names ---

const REASON_NAMES: Record<string, string> = {
  weather_flooding: "flooding",
  weather_typhoon: "typhoon signal",
  lgu_order: "local government order",
  facilities: "facilities issue",
  security: "security concern",
  other: "administrative decision",
};

// --- Duration Display Names ---

const DURATION_NAMES: Record<string, string> = {
  full_day: "the entire day",
  am_only: "morning classes (AM only)",
  pm_only: "afternoon classes (PM only)",
};

// --- Friendly Date ---

/**
 * Formats a date string (YYYY-MM-DD) into a friendly display format.
 * e.g. "July 21, 2026"
 */
export function formatFriendlyDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// --- Push Notification Title ---

/**
 * Generates the push notification title for a suspension broadcast.
 */
export function generateSuspensionTitle(suspensionDate: string): string {
  return `🔴 Class Suspension — ${formatFriendlyDate(suspensionDate)}`;
}

// --- Broadcast Body Generation ---

export interface SuspensionBodyParams {
  source: string;
  reason: string;
  scope: SuspensionScope;
  scopeDetail: { programs?: string[] } | null;
  duration: string;
  suspensionDate: string;
  customMessage?: string;
}

/**
 * Generates a human-readable broadcast body for a suspension announcement.
 *
 * If a customMessage is provided and non-empty, it is used as-is.
 * Otherwise, a structured template is generated based on the source,
 * with scope, reason, and duration stated in natural language.
 */
export function generateSuspensionBody(params: SuspensionBodyParams): string {
  const { source, reason, scope, scopeDetail, duration, suspensionDate, customMessage } = params;

  // If custom message is provided, use it directly
  if (customMessage && customMessage.trim().length > 0) {
    return customMessage.trim();
  }

  const friendlyDate = formatFriendlyDate(suspensionDate);
  const scopeText = formatScopeNatural(scope, scopeDetail);
  const reasonText = REASON_NAMES[reason] ?? reason.replace(/_/g, " ");
  const durationText = DURATION_NAMES[duration] ?? duration.replace(/_/g, " ");
  const sourceName = SOURCE_NAMES[source] ?? source.replace(/_/g, " ");

  // Generate template based on source
  switch (source) {
    case "manila_lgu":
      return (
        `The Manila Local Government has declared the suspension of classes ` +
        `for ${scopeText} on ${friendlyDate} due to ${reasonText}.\n\n` +
        `Duration: ${durationText}.\n\n` +
        `Stay safe and monitor official channels for updates.`
      );

    case "pagasa":
      return (
        `PAGASA has issued an advisory resulting in the suspension of classes ` +
        `for ${scopeText} on ${friendlyDate} due to ${reasonText}.\n\n` +
        `Duration: ${durationText}.\n\n` +
        `Please stay indoors and follow safety precautions.`
      );

    case "deped":
      return (
        `Per DepEd directive, classes are suspended ` +
        `for ${scopeText} on ${friendlyDate} due to ${reasonText}.\n\n` +
        `Duration: ${durationText}.\n\n` +
        `Await further announcements from the school administration.`
      );

    case "school_admin":
      return (
        `The School Administration has suspended classes ` +
        `for ${scopeText} on ${friendlyDate} due to ${reasonText}.\n\n` +
        `Duration: ${durationText}.\n\n` +
        `Please check back for updates regarding resumption of classes.`
      );

    default:
      return (
        `Classes have been suspended for ${scopeText} on ${friendlyDate} ` +
        `due to ${reasonText}. Duration: ${durationText}.\n\n` +
        `Source: ${sourceName}.`
      );
  }
}
