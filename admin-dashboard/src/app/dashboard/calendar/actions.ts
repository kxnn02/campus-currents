"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, validateString, validateDate, parseAudience } from "@/lib/server-utils";
import { EVENT_CATEGORIES } from "@/lib/constants";

export async function createEvent(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = validateString(formData, "title", { maxLength: 200 });
  const description = validateString(formData, "description", { required: false, maxLength: 5000 });
  const category = validateString(formData, "category", { allowedValues: EVENT_CATEGORIES });
  const startDate = validateDate(formData, "start_date");
  const endDate = validateDate(formData, "end_date", false);
  const isAllDay = formData.get("is_all_day") === "true";
  const location = validateString(formData, "location", { required: false, maxLength: 200 });
  const organizerName = validateString(formData, "organizer_name", { required: false, maxLength: 100 });
  const targetAudience = parseAudience(formData);
  const notifyStudents = formData.get("notify_students") === "true";

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
  const poster = formData.get("poster") as File | null;
  if (poster && poster.size > 0 && eventData?.id) {
    if (poster.size > 5 * 1024 * 1024) throw new Error("Poster file must be under 5MB");
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
      // Upload failed gracefully — event is still created
    }
  }

  // Send a notification broadcast if "Notify students" was checked
  if (notifyStudents && eventData?.id) {
    const eventDate = new Date(startDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const locationText = location ? ` at ${location}` : "";
    const bodyText = description
      ? `${description.slice(0, 200)}${description.length > 200 ? "..." : ""}`
      : `A new event has been scheduled for ${eventDate}${locationText}. Check your calendar for details.`;

    const { error: broadcastError } = await supabase.from("broadcasts").insert({
      sender_id: user.id,
      title: `📅 ${title}`,
      body: bodyText,
      tier: "routine",
      channel: "event",
      is_pinned: false,
      is_deleted: false,
      target_audience: targetAudience,
      linked_event_id: eventData.id,
      sent_at: new Date().toISOString(),
    });

    if (broadcastError) {
      console.error("Failed to send event notification:", broadcastError.message);
    }
  }

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
}

export async function updateEvent(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  if (!id || typeof id !== "string") throw new Error("Invalid event ID");

  const title = validateString(formData, "title", { maxLength: 200 });
  const description = validateString(formData, "description", { required: false, maxLength: 5000 });
  const category = validateString(formData, "category", { allowedValues: EVENT_CATEGORIES });
  const startDate = validateDate(formData, "start_date");
  const endDate = validateDate(formData, "end_date", false);
  const isAllDay = formData.get("is_all_day") === "true";
  const location = validateString(formData, "location", { required: false, maxLength: 200 });
  const organizerName = validateString(formData, "organizer_name", { required: false, maxLength: 100 });
  const targetAudience = parseAudience(formData);

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

  // Upload new poster if provided
  const poster = formData.get("poster") as File | null;
  if (poster && poster.size > 0) {
    if (poster.size > 5 * 1024 * 1024) throw new Error("Poster file must be under 5MB");
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
      // Upload failed gracefully
    }
  }

  revalidatePath("/dashboard/calendar");
}

export async function deleteEvent(id: string) {
  const { supabase } = await requireAdmin();

  if (!id || typeof id !== "string") throw new Error("Invalid event ID");

  const { error } = await supabase
    .from("calendar_events")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/calendar");
}
