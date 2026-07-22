"use server";

import { revalidatePath } from "next/cache";
import { compare } from "bcryptjs";
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
  const pin = validateString(formData, "pin", { minLength: 4, maxLength: 6 });

  // Fetch admin's pin_hash from profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("pin_hash")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.pin_hash) {
    throw new Error("PIN not configured for this account");
  }

  // Validate PIN against stored hash
  const pinValid = await compare(pin, profile.pin_hash);
  if (!pinValid) {
    throw new Error("Invalid PIN");
  }

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
  const { supabase, user } = await requireAdmin();

  if (!id || typeof id !== "string") throw new Error("Invalid emergency ID");

  // Fetch the emergency — only allow resolving active ones
  const { data: emergency, error: fetchError } = await supabase
    .from("active_emergencies")
    .select("emergency_type, broadcast_id, status")
    .eq("id", id)
    .single();

  if (fetchError || !emergency) throw new Error("Emergency not found");
  if (emergency.status !== "active") throw new Error("Emergency is already resolved");

  // Update the emergency status
  const { error } = await supabase
    .from("active_emergencies")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Send an "ALL CLEAR" broadcast so all students get a push notification
  const typeLabel = formatEmergencyTypeLabel(emergency.emergency_type);
  const { error: broadcastError } = await supabase.from("broadcasts").insert({
    sender_id: user.id,
    title: `✅ ALL CLEAR — ${typeLabel} Resolved`,
    body: `The ${typeLabel.toLowerCase()} emergency has been resolved. It is now safe to resume normal activities. Thank you for your cooperation.`,
    tier: "important",
    sub_priority: "urgent",
    channel: "security",
    is_pinned: false,
    is_deleted: false,
    target_audience: { all: true },
    sent_at: new Date().toISOString(),
  });

  if (broadcastError) {
    console.error("Failed to send ALL CLEAR broadcast:", broadcastError.message);
    // Don't throw — the emergency is already resolved, the broadcast is supplementary
  }

  revalidatePath("/dashboard/emergency");
  revalidatePath("/dashboard");
}

export async function resolveAsFalseAlarm(id: string) {
  const { supabase, user } = await requireAdmin();

  if (!id || typeof id !== "string") throw new Error("Invalid emergency ID");

  // Fetch the emergency — only allow resolving active ones
  const { data: emergency, error: fetchError } = await supabase
    .from("active_emergencies")
    .select("emergency_type, broadcast_id, status")
    .eq("id", id)
    .single();

  if (fetchError || !emergency) throw new Error("Emergency not found");
  if (emergency.status !== "active") throw new Error("Emergency is already resolved");

  // Update the emergency status
  const { error } = await supabase
    .from("active_emergencies")
    .update({
      status: "false_alarm",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Send a "FALSE ALARM" broadcast so all students get a push notification
  const typeLabel = formatEmergencyTypeLabel(emergency.emergency_type);
  const { error: broadcastError } = await supabase.from("broadcasts").insert({
    sender_id: user.id,
    title: `⚠️ ALERT CANCELLED — ${typeLabel} Was a False Alarm`,
    body: `The previous ${typeLabel.toLowerCase()} alert has been cancelled. This was a false alarm. You may resume normal activities. We apologize for any inconvenience.`,
    tier: "important",
    sub_priority: "urgent",
    channel: "security",
    is_pinned: false,
    is_deleted: false,
    target_audience: { all: true },
    sent_at: new Date().toISOString(),
  });

  if (broadcastError) {
    console.error("Failed to send false alarm broadcast:", broadcastError.message);
  }

  revalidatePath("/dashboard/emergency");
  revalidatePath("/dashboard");
}

// Helper to format emergency type for human-readable messages
function formatEmergencyTypeLabel(type: string): string {
  switch (type) {
    case "active_threat":
      return "Active Threat";
    case "fire":
      return "Fire";
    case "earthquake":
      return "Earthquake";
    case "flooding":
      return "Flooding";
    default:
      return "Emergency";
  }
}
