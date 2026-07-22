// @ts-nocheck — This file runs on Supabase Edge (Deno runtime), not Node.js
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface BroadcastRecord {
  id: string;
  sender_id: string;
  tier: string;
  channel: string;
  title: string;
  body: string;
  target_audience: {
    all?: boolean;
    programs?: string[];
    year_levels?: number[];
    levels?: string[];
  } | null;
  is_pinned: boolean;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: BroadcastRecord;
  schema: "public";
  old_record: null | BroadcastRecord;
}

interface StudentProfile {
  id: string;
  fcm_token: string;
  program: string | null;
  year_level: number | null;
  level: string | null;
  notification_preferences: Record<string, { muted?: boolean }> | null;
}

interface ExpoTicketResponse {
  data: Array<{
    id?: string;
    status: "ok" | "error";
    message?: string;
    details?: { error?: string };
  }>;
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req: Request) => {
  try {
    // --- Webhook secret validation ---
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const requestSecret = req.headers.get("x-webhook-secret");

    if (!webhookSecret || requestSecret !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload: WebhookPayload = await req.json();
    const broadcast = payload.record;

    // Only process INSERT events
    if (payload.type !== "INSERT") {
      return new Response(JSON.stringify({ message: "Ignored non-INSERT event" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query to get student push tokens — include level and notification_preferences
    const { data: students, error: studentsError } = await supabase
      .from("profiles")
      .select("id, fcm_token, program, year_level, level, notification_preferences")
      .eq("role", "student")
      .not("fcm_token", "is", null);

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      return new Response(JSON.stringify({ error: studentsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!students || students.length === 0) {
      return new Response(JSON.stringify({ message: "No students with push tokens" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Filter students by target_audience (including levels)
    const targetAudience = broadcast.target_audience;
    let matchingStudents = (students as StudentProfile[]).filter((student) => {
      if (!targetAudience || targetAudience.all === true) return true;

      const hasPrograms = Array.isArray(targetAudience.programs) && targetAudience.programs.length > 0;
      const hasYearLevels = Array.isArray(targetAudience.year_levels) && targetAudience.year_levels.length > 0;
      const hasLevels = Array.isArray(targetAudience.levels) && targetAudience.levels.length > 0;

      if (!hasPrograms && !hasYearLevels && !hasLevels) return true;

      // Level filtering: if target_audience specifies levels, student must match
      if (hasLevels) {
        if (!student.level || !targetAudience.levels!.includes(student.level)) {
          return false;
        }
      }

      // Program filtering
      if (hasPrograms) {
        if (!student.program || !targetAudience.programs!.includes(student.program)) {
          return false;
        }
      }

      // Year level filtering
      if (hasYearLevels) {
        if (!student.year_level || !targetAudience.year_levels!.includes(student.year_level)) {
          return false;
        }
      }

      return true;
    });

    // Filter by notification preferences (routine tier only)
    // Students can mute specific channels; skip them for routine broadcasts
    if (broadcast.tier === "routine") {
      matchingStudents = matchingStudents.filter((student) => {
        const prefs = student.notification_preferences;
        if (!prefs || typeof prefs !== "object") return true;

        const channelPref = prefs[broadcast.channel];
        if (channelPref && channelPref.muted === true) {
          return false; // Student muted this channel for routine
        }
        return true;
      });
    }

    if (matchingStudents.length === 0) {
      return new Response(JSON.stringify({ message: "No matching students for audience" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine notification channel for Android
    const androidChannelId =
      broadcast.tier === "emergency"
        ? "emergency"
        : broadcast.tier === "important"
          ? "important"
          : "routine";

    // Build Expo push messages
    const messages = matchingStudents.map((student) => ({
      to: student.fcm_token,
      sound: "default",
      title: broadcast.title,
      body: broadcast.body,
      channelId: androidChannelId,
      priority: broadcast.tier === "emergency" ? "high" : "default",
      data: {
        broadcast_id: broadcast.id,
        tier: broadcast.tier,
        channel: broadcast.channel,
      },
    }));

    // Create delivery_receipts with delivered_at = NULL (honest delivery tracking)
    const receipts = matchingStudents.map((student) => ({
      broadcast_id: broadcast.id,
      student_id: student.id,
      delivery_method: "push",
      delivered_at: null,
    }));

    const { error: receiptError } = await supabase
      .from("delivery_receipts")
      .upsert(receipts, { onConflict: "broadcast_id,student_id", ignoreDuplicates: true });

    if (receiptError) {
      console.error("Error creating delivery receipts:", receiptError);
    }

    // Send in batches of 100 (Expo limit) and collect ticket IDs
    const BATCH_SIZE = 100;
    const allTicketRows: Array<{
      broadcast_id: string;
      student_id: string;
      expo_ticket_id: string | null;
      expo_token: string;
      status: string;
      error_message: string | null;
    }> = [];

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      const batchStudents = matchingStudents.slice(i, i + BATCH_SIZE);

      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(batch),
      });

      const resData: ExpoTicketResponse = await res.json();

      // Parse ticket IDs from Expo response and map to students
      if (resData.data && Array.isArray(resData.data)) {
        for (let j = 0; j < resData.data.length; j++) {
          const ticket = resData.data[j];
          const student = batchStudents[j];
          if (!student) continue;

          allTicketRows.push({
            broadcast_id: broadcast.id,
            student_id: student.id,
            expo_ticket_id: ticket.status === "ok" ? (ticket.id ?? null) : null,
            expo_token: student.fcm_token,
            status: ticket.status === "ok" ? "pending" : "failed",
            error_message:
              ticket.status === "error" ? (ticket.message ?? ticket.details?.error ?? "Unknown error") : null,
          });
        }
      }
    }

    // Insert push_tickets
    if (allTicketRows.length > 0) {
      const { error: ticketError } = await supabase.from("push_tickets").insert(allTicketRows);

      if (ticketError) {
        console.error("Error inserting push_tickets:", ticketError);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Push sent to ${matchingStudents.length} students`,
        tickets_created: allTicketRows.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
