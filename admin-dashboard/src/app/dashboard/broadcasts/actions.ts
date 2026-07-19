"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, validateString, parseAudience } from "@/lib/server-utils";
import { BROADCAST_TIERS, BROADCAST_CHANNELS } from "@/lib/constants";

export async function createBroadcast(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = validateString(formData, "title", { maxLength: 200 });
  const body = validateString(formData, "body", { maxLength: 5000 });
  const tier = validateString(formData, "tier", { allowedValues: BROADCAST_TIERS });
  const channel = validateString(formData, "channel", { allowedValues: BROADCAST_CHANNELS });
  const isPinned = formData.get("is_pinned") === "true";
  const targetAudience = parseAudience(formData);

  const { error } = await supabase.from("broadcasts").insert({
    sender_id: user.id,
    title,
    body,
    tier,
    channel,
    is_pinned: isPinned,
    is_deleted: false,
    target_audience: targetAudience,
    sent_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/broadcasts");
  revalidatePath("/dashboard");
}

export async function updateBroadcast(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  if (!id || typeof id !== "string") throw new Error("Invalid broadcast ID");

  const title = validateString(formData, "title", { maxLength: 200 });
  const body = validateString(formData, "body", { maxLength: 5000 });
  const tier = validateString(formData, "tier", { allowedValues: BROADCAST_TIERS });
  const channel = validateString(formData, "channel", { allowedValues: BROADCAST_CHANNELS });
  const isPinned = formData.get("is_pinned") === "true";
  const targetAudience = parseAudience(formData);

  const { error } = await supabase
    .from("broadcasts")
    .update({
      title,
      body,
      tier,
      channel,
      is_pinned: isPinned,
      target_audience: targetAudience,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/broadcasts");
  revalidatePath("/dashboard");
}

export async function deleteBroadcast(id: string) {
  const { supabase } = await requireAdmin();

  if (!id || typeof id !== "string") throw new Error("Invalid broadcast ID");

  const { error } = await supabase
    .from("broadcasts")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/broadcasts");
  revalidatePath("/dashboard");
}
