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

export const YEAR_LEVELS = ["1", "2", "3", "4", "5"] as const;

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
// Uses SSC-R brand palette: Emergency #BA1A1A, Important #F89C00, Routine #5E67C2
export const TIER_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  emergency: { bg: "bg-[#BA1A1A]/10", text: "text-[#BA1A1A]", border: "bg-[#BA1A1A]", label: "URGENT" },
  important: { bg: "bg-[#F89C00]/10", text: "text-[#92400E]", border: "bg-[#F89C00]", label: "IMPORTANT" },
  routine: { bg: "bg-[#5E67C2]/10", text: "text-[#3B41A0]", border: "bg-[#5E67C2]", label: "REGULAR" },
};
