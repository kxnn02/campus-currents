"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, validateString, validateDate } from "@/lib/server-utils";
import { SUSPENSION_SOURCES, SUSPENSION_REASONS, SUSPENSION_SCOPES, SUSPENSION_DURATIONS } from "@/lib/constants";
import {
  scopeToTargetAudience,
  generateSuspensionBody,
  generateSuspensionTitle,
  type SuspensionScope,
} from "@/lib/suspension-utils";

export async function createSuspension(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const suspensionDate = validateDate(formData, "suspension_date");
  const source = validateString(formData, "source", { allowedValues: SUSPENSION_SOURCES });
  const reason = validateString(formData, "reason", { allowedValues: SUSPENSION_REASONS });
  const scope = validateString(formData, "scope", { allowedValues: SUSPENSION_SCOPES }) as SuspensionScope;
  const duration = validateString(formData, "duration", { allowedValues: SUSPENSION_DURATIONS, required: false }) || "full_day";
  const customMessage = formData.get("custom_message") as string | null;

  let scopeDetail: { programs?: string[] } | null = null;
  if (scope === "specific_programs") {
    const programs = formData.getAll("programs") as string[];
    if (programs.length === 0) throw new Error("Select at least one program for specific scope");
    scopeDetail = { programs };
  }

  // Map scope to target_audience with levels array for Edge Function filtering
  const targetAudience = scopeToTargetAudience(scope, scopeDetail);

  // Generate human-readable broadcast body (or use custom message if provided)
  const body = generateSuspensionBody({
    source,
    reason,
    scope,
    scopeDetail,
    duration,
    suspensionDate,
    customMessage: customMessage ?? undefined,
  });

  const title = generateSuspensionTitle(suspensionDate);

  // Create broadcast for the suspension
  const { data: broadcast, error: broadcastError } = await supabase
    .from("broadcasts")
    .insert({
      sender_id: user.id,
      title,
      body,
      tier: "important",
      channel: "suspension",
      is_pinned: true,
      is_deleted: false,
      target_audience: targetAudience,
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (broadcastError) throw new Error(broadcastError.message);

  // Create the suspension record
  const { error } = await supabase.from("class_suspensions").insert({
    declared_by: user.id,
    source,
    reason,
    scope,
    scope_detail: scopeDetail,
    duration,
    suspension_date: suspensionDate,
    status: "active",
    broadcast_id: broadcast.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/suspensions");
  revalidatePath("/dashboard");
}

export async function liftSuspension(id: string) {
  const { supabase } = await requireAdmin();

  if (!id || typeof id !== "string") throw new Error("Invalid suspension ID");

  const { error } = await supabase
    .from("class_suspensions")
    .update({ status: "lifted" })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/suspensions");
  revalidatePath("/dashboard");
}
