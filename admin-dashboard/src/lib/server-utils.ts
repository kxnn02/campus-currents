import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current user is authenticated AND has dashboard access (admin, super_admin, or faculty).
 * Use in server actions that faculty can also perform (e.g., creating routine broadcasts).
 */
export async function requireDashboardUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, program, office")
    .eq("id", user.id)
    .single();

  if (error || !profile || !["admin", "super_admin", "faculty"].includes(profile.role)) {
    throw new Error("Unauthorized: dashboard access required");
  }

  return { supabase, user, role: profile.role as string, profile };
}

/**
 * Verifies the current user is authenticated AND has admin/super_admin role.
 * Use in server actions that faculty CANNOT perform (suspensions, emergencies, events, settings).
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
 * Logs an admin action to the audit_log table.
 * Fire-and-forget — does not throw on failure to avoid blocking the main action.
 */
export async function logAuditEvent(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  action: string;
  targetTable: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await params.supabase.from("audit_log").insert({
      user_id: params.userId,
      action: params.action,
      target_table: params.targetTable,
      target_id: params.targetId ?? null,
      metadata: params.metadata ?? {},
    });
  } catch {
    // Audit logging is best-effort — don't block the main action
    console.error("[AUDIT] Failed to log:", params.action);
  }
}

/**
 * Validates a string field from FormData.
 * Strips HTML tags to prevent XSS. Throws with a clear message if invalid.
 */
export function validateString(
  formData: FormData,
  field: string,
  options: { required?: boolean; minLength?: number; maxLength?: number; allowedValues?: readonly string[] } = {}
): string {
  let value = (formData.get(field) as string | null)?.trim() ?? "";
  const { required = true, minLength = 1, maxLength = 5000, allowedValues } = options;

  // Sanitize: strip HTML tags to prevent XSS
  value = value.replace(/<[^>]*>/g, "");

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
