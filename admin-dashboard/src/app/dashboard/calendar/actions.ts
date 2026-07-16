"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const isAllDay = formData.get("is_all_day") === "true";
  const location = formData.get("location") as string;
  const organizerName = formData.get("organizer_name") as string;
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

  const { data: eventData, error } = await supabase.from("calendar_events").insert({
    title,
    description: description || null,
    category,
    start_date: startDate,
    end_date: endDate || startDate,
    is_all_day: isAllDay,
    location: location || null,
    organizer_name: organizerName || null,
    target_audience: targetAudience,
    status: "active",
    is_deleted: false,
    created_by: user.id,
  }).select("id").single();

  if (error) throw new Error(error.message);

  // Upload event poster if provided
  // NOTE: The "event-posters" storage bucket must be created in the Supabase dashboard
  const poster = formData.get("poster") as File | null;
  if (poster && poster.size > 0 && eventData?.id) {
    try {
      const filePath = `${eventData.id}/${poster.name}`;
      const { error: uploadError } = await supabase.storage
        .from("event-posters")
        .upload(filePath, poster);

      if (!uploadError) {
        await supabase
          .from("calendar_events")
          .update({ attachment_url: filePath })
          .eq("id", eventData.id);
      }
    } catch {
      // Upload failed gracefully — event is still created without the poster
      console.error("Failed to upload event poster");
    }
  }

  revalidatePath("/dashboard/calendar");
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const isAllDay = formData.get("is_all_day") === "true";
  const location = formData.get("location") as string;
  const organizerName = formData.get("organizer_name") as string;
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
    .from("calendar_events")
    .update({
      title,
      description: description || null,
      category,
      start_date: startDate,
      end_date: endDate || startDate,
      is_all_day: isAllDay,
      location: location || null,
      organizer_name: organizerName || null,
      target_audience: targetAudience,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Upload new event poster if provided
  // NOTE: The "event-posters" storage bucket must be created in the Supabase dashboard
  const poster = formData.get("poster") as File | null;
  if (poster && poster.size > 0) {
    try {
      const filePath = `${id}/${poster.name}`;
      const { error: uploadError } = await supabase.storage
        .from("event-posters")
        .upload(filePath, poster, { upsert: true });

      if (!uploadError) {
        await supabase
          .from("calendar_events")
          .update({ attachment_url: filePath })
          .eq("id", id);
      }
    } catch {
      // Upload failed gracefully — event is still updated without the poster
      console.error("Failed to upload event poster");
    }
  }

  revalidatePath("/dashboard/calendar");
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("calendar_events")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/calendar");
}
