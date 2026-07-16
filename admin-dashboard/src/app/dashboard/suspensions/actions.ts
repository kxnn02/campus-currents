"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSuspension(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const suspensionDate = formData.get("suspension_date") as string;
  const source = formData.get("source") as string;
  const reason = formData.get("reason") as string;
  const scope = formData.get("scope") as string;
  const duration = formData.get("duration") as string;

  let scopeDetail: Record<string, unknown> | null = null;
  if (scope === "specific_programs") {
    const programs = formData.getAll("programs") as string[];
    scopeDetail = { programs };
  }

  // Create broadcast for the suspension
  const { data: broadcast, error: broadcastError } = await supabase
    .from("broadcasts")
    .insert({
      sender_id: user.id,
      title: `Class Suspension - ${suspensionDate}`,
      body: `Classes suspended due to ${reason.replace("_", " ")}. Duration: ${duration.replace("_", " ")}. Source: ${source.replace("_", " ")}.`,
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
}

export async function liftSuspension(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("class_suspensions")
    .update({ status: "lifted" })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/suspensions");
}
