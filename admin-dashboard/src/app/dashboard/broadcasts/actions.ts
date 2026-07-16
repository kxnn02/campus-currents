"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBroadcast(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const tier = formData.get("tier") as string;
  const channel = formData.get("channel") as string;
  const isPinned = formData.get("is_pinned") === "true";
  const audienceType = formData.get("audience_type") as string;

  let targetAudience: Record<string, unknown> = { all: true };

  if (audienceType === "by_program") {
    const programs = formData.getAll("programs") as string[];
    targetAudience = { programs };
  } else if (audienceType === "by_year") {
    const years = (formData.getAll("years") as string[]).map(Number);
    targetAudience = { year_levels: years };
  } else if (audienceType === "by_program_year") {
    const programs = formData.getAll("programs") as string[];
    const years = (formData.getAll("years") as string[]).map(Number);
    targetAudience = { programs, year_levels: years };
  }

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
}

export async function updateBroadcast(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const tier = formData.get("tier") as string;
  const channel = formData.get("channel") as string;
  const isPinned = formData.get("is_pinned") === "true";
  const audienceType = formData.get("audience_type") as string;

  let targetAudience: Record<string, unknown> = { all: true };

  if (audienceType === "by_program") {
    const programs = formData.getAll("programs") as string[];
    targetAudience = { programs };
  } else if (audienceType === "by_year") {
    const years = (formData.getAll("years") as string[]).map(Number);
    targetAudience = { year_levels: years };
  } else if (audienceType === "by_program_year") {
    const programs = formData.getAll("programs") as string[];
    const years = (formData.getAll("years") as string[]).map(Number);
    targetAudience = { programs, year_levels: years };
  }

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
}

export async function deleteBroadcast(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("broadcasts")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/broadcasts");
}
