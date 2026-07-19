"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, validateString, validateDate } from "@/lib/server-utils";
import { SUSPENSION_SOURCES, SUSPENSION_REASONS, SUSPENSION_SCOPES, SUSPENSION_DURATIONS } from "@/lib/constants";

export async function createSuspension(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const suspensionDate = validateDate(formData, "suspension_date");
  const source = validateString(formData, "source", { allowedValues: SUSPENSION_SOURCES });
  const reason = validateString(formData, "reason", { allowedValues: SUSPENSION_REASONS });
  const scope = validateString(formData, "scope", { allowedValues: SUSPENSION_SCOPES });
  const duration = validateString(formData, "duration", { allowedValues: SUSPENSION_DURATIONS, required: false }) || "full_day";

  let scopeDetail: Record<string, unknown> | null = null;
  if (scope === "specific_programs") {
    const programs = formData.getAll("programs") as string[];
    if (programs.length === 0) throw new Error("Select at least one program for specific scope");
    scopeDetail = { programs };
  }

  // Create broadcast for the suspension
  const { data: broadcast, error: broadcastError } = await supabase
    .from("broadcasts")
    .insert({
      sender_id: user.id,
      title: `Class Suspension - ${suspensionDate}`,
      body: `Classes suspended due to ${reason.replace(/_/g, " ")}. Duration: ${duration.replace(/_/g, " ")}. Source: ${source.replace(/_/g, " ")}.`,
      tier: "important",
      channel: "suspension",
      is_pinned: true,
      is_deleted: false,
      target_audience: { all: true },
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
