// Single source of truth for programs offered at SSC-R
export const PROGRAMS = [
  "BSIT",
  "BSBA",
  "BSA",
  "BSED",
  "BEED",
  "AB_PSYCH",
  "AB_COMM",
  "JD",
  "ETEEAP",
  "STEM",
  "ABM",
  "HUMSS",
  "GAS",
  "TVL",
  "OTHER",
] as const;

export const YEAR_LEVELS = ["1", "2", "3", "4"] as const;

export const BROADCAST_TIERS = ["routine", "important", "emergency"] as const;

export const BROADCAST_CHANNELS = ["general", "academic", "event", "suspension", "security"] as const;

export const EMERGENCY_TYPES = ["active_threat", "fire", "earthquake", "flooding"] as const;

export const SUSPENSION_SOURCES = ["manila_lgu", "pagasa", "deped", "school_admin"] as const;

export const SUSPENSION_REASONS = [
  "weather_flooding",
  "weather_typhoon",
  "lgu_order",
  "facilities",
  "security",
  "other",
] as const;

export const SUSPENSION_SCOPES = [
  "all_levels",
  "grade_school_only",
  "k12_only",
  "junior_high_only",
  "senior_high_only",
  "college_only",
  "law_only",
  "specific_programs",
] as const;

export const SUSPENSION_DURATIONS = ["full_day", "am_only", "pm_only"] as const;

export const EVENT_CATEGORIES = [
  "academic",
  "school_event",
  "org_activity",
  "administrative",
  "holiday",
  "sports",
  "seminar",
] as const;

// Tier visual config — shared between dashboard, broadcasts, history pages
export const TIER_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  emergency: { bg: "bg-[#FFDAD6]", text: "text-[#93000A]", border: "bg-[#DC2626]", label: "URGENT" },
  important: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", border: "bg-[#F59E0B]", label: "IMPORTANT" },
  routine: { bg: "bg-[#DDE1FF]", text: "text-[#173BAB]", border: "bg-[#00288E]", label: "REGULAR" },
};
