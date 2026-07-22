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

  const { data: broadcast, error } = await supabase.from("broadcasts").insert({
    sender_id: user.id,
    title,
    body,
    tier,
    channel,
    is_pinned: isPinned,
    is_deleted: false,
    target_audience: targetAudience,
    sent_at: new Date().toISOString(),
  }).select("id").single();

  if (error) throw new Error(error.message);

  // Upload image if provided
  const image = formData.get("image") as File | null;
  if (image && image.size > 0 && broadcast?.id) {
    if (image.size > 2 * 1024 * 1024) throw new Error("Image must be under 2MB");

    try {
      const ext = image.name.split(".").pop() ?? "jpg";
      const filePath = `${broadcast.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("broadcast-images")
        .upload(filePath, image, { upsert: true });

      if (!uploadError) {
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from("broadcast-images")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          await supabase
            .from("broadcasts")
            .update({ image_url: urlData.publicUrl })
            .eq("id", broadcast.id);
        }
      }
    } catch {
      // Upload failed gracefully — broadcast is still sent
    }
  }

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
