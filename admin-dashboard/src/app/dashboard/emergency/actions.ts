"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, validateString } from "@/lib/server-utils";
import { EMERGENCY_TYPES } from "@/lib/constants";

export async function triggerEmergency(formData: FormData) {
  // Requires super_admin role for emergency triggers
  const { supabase, user, role } = await requireAdmin();

  // Additional guard: only super_admin can trigger emergencies
  if (role !== "super_admin") {
    throw new Error("Only super admins can trigger emergency alerts");
  }

  const emergencyType = validateString(formData, "emergency_type", { allowedValues: EMERGENCY_TYPES });
  const title = validateString(formData, "title", { minLength: 3, maxLength: 200 });
  const instructions = validateString(formData, "instructions", { minLength: 10, maxLength: 2000 });

  // Create the emergency broadcast
  const { data: broadcast, error: broadcastError } = await supabase
    .from("broadcasts")
    .insert({
      sender_id: user.id,
      title,
      body: instructions,
      tier: "emergency",
      channel: "security",
      is_pinned: true,
      is_deleted: false,
      target_audience: { all: true },
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (broadcastError) throw new Error(broadcastError.message);

  // Create the active emergency
  const { error } = await supabase.from("active_emergencies").insert({
    broadcast_id: broadcast.id,
    emergency_type: emergencyType,
    status: "active",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/emergency");
  revalidatePath("/dashboard");
}

export async function resolveEmergency(id: string) {
  const { supabase } = await requireAdmin();

  if (!id || typeof id !== "string") throw new Error("Invalid emergency ID");

  const { error } = await supabase
    .from("active_emergencies")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/emergency");
  revalidatePath("/dashboard");
}
