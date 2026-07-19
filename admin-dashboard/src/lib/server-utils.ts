import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current user is authenticated AND has admin/super_admin role.
 * Throws if not. Use in every server action.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Unauthorized: admin access required");
  }

  return { supabase, user, role: profile.role };
}

/**
 * Validates a string field from FormData.
 * Throws with a clear message if invalid.
 */
export function validateString(
  formData: FormData,
  field: string,
  options: { required?: boolean; minLength?: number; maxLength?: number; allowedValues?: readonly string[] } = {}
): string {
  const value = (formData.get(field) as string | null)?.trim() ?? "";
  const { required = true, minLength = 1, maxLength = 5000, allowedValues } = options;

  if (required && !value) {
    throw new Error(`${field} is required`);
  }

  if (value && value.length < minLength) {
    throw new Error(`${field} must be at least ${minLength} characters`);
  }

  if (value.length > maxLength) {
    throw new Error(`${field} must be less than ${maxLength} characters`);
  }

  if (allowedValues && value && !allowedValues.includes(value)) {
    throw new Error(`${field} has an invalid value: "${value}"`);
  }

  return value;
}

/**
 * Validates a date string field from FormData.
 */
export function validateDate(formData: FormData, field: string, required = true): string {
  const value = (formData.get(field) as string | null)?.trim() ?? "";

  if (required && !value) {
    throw new Error(`${field} is required`);
  }

  if (value && isNaN(Date.parse(value))) {
    throw new Error(`${field} is not a valid date`);
  }

  return value;
}

/**
 * Parses audience targeting from FormData with validation.
 */
export function parseAudience(formData: FormData): Record<string, unknown> {
  const audienceType = (formData.get("audience_type") as string) || "all";

  if (audienceType === "by_program") {
    const programs = formData.getAll("programs") as string[];
    if (programs.length === 0) throw new Error("Select at least one program");
    return { programs };
  }

  if (audienceType === "by_year") {
    const years = (formData.getAll("years") as string[]).map(Number).filter((n) => n >= 1 && n <= 5);
    if (years.length === 0) throw new Error("Select at least one year level");
    return { year_levels: years };
  }

  if (audienceType === "by_program_year") {
    const programs = formData.getAll("programs") as string[];
    const years = (formData.getAll("years") as string[]).map(Number).filter((n) => n >= 1 && n <= 5);
    if (programs.length === 0) throw new Error("Select at least one program");
    if (years.length === 0) throw new Error("Select at least one year level");
    return { programs, year_levels: years };
  }

  return { all: true };
}
