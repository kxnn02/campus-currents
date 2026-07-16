"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function triggerEmergency(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const emergencyType = formData.get("emergency_type") as string;
  const title = formData.get("title") as string;
  const instructions = formData.get("instructions") as string;

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
}

export async function resolveEmergency(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("active_emergencies")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/emergency");
}
