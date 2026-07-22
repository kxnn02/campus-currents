// @ts-nocheck — This file runs on Supabase Edge (Deno runtime), not Node.js
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";
const BATCH_SIZE = 300; // Expo max per request
const STALE_HOURS = 24;
const MIN_AGE_SECONDS = 30; // Wait 30s before checking a ticket

Deno.serve(async (_req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Mark stale tickets (older than 24h, still pending) as failed
    const { error: staleError, count: staleCount } = await supabase
      .from("push_tickets")
      .update({
        status: "failed",
        error_message: "Ticket expired: no receipt after 24 hours",
        checked_at: new Date().toISOString(),
      })
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000).toISOString())
      .select("id", { count: "exact", head: true });

    if (staleError) {
      console.error("Error marking stale tickets:", staleError);
    }

    // 2. Fetch pending tickets that are at least 30s old
    const cutoff = new Date(Date.now() - MIN_AGE_SECONDS * 1000).toISOString();
    const { data: pendingTickets, error: fetchError } = await supabase
      .from("push_tickets")
      .select("id, expo_ticket_id, broadcast_id, student_id, expo_token")
      .eq("status", "pending")
      .lt("created_at", cutoff)
      .not("expo_ticket_id", "is", null)
      .order("created_at", { ascending: true })
      .limit(1000);

    if (fetchError) {
      console.error("Error fetching pending tickets:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!pendingTickets || pendingTickets.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending tickets to check", stale_marked: staleCount ?? 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Process in batches of 300
    let processedCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;
    let invalidTokenCount = 0;

    for (let i = 0; i < pendingTickets.length; i += BATCH_SIZE) {
      const batch = pendingTickets.slice(i, i + BATCH_SIZE);
      const ticketIds = batch.map((t) => t.expo_ticket_id!);

      // Call Expo receipts API
      const res = await fetch(EXPO_RECEIPTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify({ ids: ticketIds }),
      });

      if (!res.ok) {
        console.error(`Expo receipts API returned ${res.status}: ${await res.text()}`);
        continue;
      }

      const { data: receipts } = (await res.json()) as {
        data: Record<string, { status: "ok" | "error"; message?: string; details?: { error?: string } }>;
      };

      if (!receipts) {
        console.error("No receipts data in Expo response");
        continue;
      }

      // 4. Process each receipt
      for (const ticket of batch) {
        const receipt = receipts[ticket.expo_ticket_id!];
        if (!receipt) continue; // Receipt not yet available, skip

        processedCount++;

        if (receipt.status === "ok") {
          // Mark ticket as delivered
          const { error: updateError } = await supabase
            .from("push_tickets")
            .update({ status: "delivered", checked_at: new Date().toISOString() })
            .eq("id", ticket.id);

          if (updateError) console.error("Error updating delivered ticket:", updateError);

          // Set delivered_at on the delivery_receipt
          const { error: receiptUpdateError } = await supabase
            .from("delivery_receipts")
            .update({ delivered_at: new Date().toISOString() })
            .eq("broadcast_id", ticket.broadcast_id)
            .eq("student_id", ticket.student_id);

          if (receiptUpdateError) console.error("Error updating delivery_receipt:", receiptUpdateError);

          deliveredCount++;
        } else if (receipt.details?.error === "DeviceNotRegistered") {
          // Mark ticket as invalid_token
          const { error: updateError } = await supabase
            .from("push_tickets")
            .update({
              status: "invalid_token",
              error_message: "DeviceNotRegistered",
              checked_at: new Date().toISOString(),
            })
            .eq("id", ticket.id);

          if (updateError) console.error("Error updating invalid_token ticket:", updateError);

          // Clear the stale push token from the student's profile
          const { error: tokenClearError } = await supabase
            .from("profiles")
            .update({ fcm_token: null })
            .eq("fcm_token", ticket.expo_token);

          if (tokenClearError) console.error("Error clearing fcm_token:", tokenClearError);

          invalidTokenCount++;
        } else {
          // Other error — mark as failed
          const errorMsg = receipt.message ?? receipt.details?.error ?? "Unknown error";
          const { error: updateError } = await supabase
            .from("push_tickets")
            .update({
              status: "failed",
              error_message: errorMsg,
              checked_at: new Date().toISOString(),
            })
            .eq("id", ticket.id);

          if (updateError) console.error("Error updating failed ticket:", updateError);

          failedCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Receipt check complete",
        pending_checked: pendingTickets.length,
        processed: processedCount,
        delivered: deliveredCount,
        failed: failedCount,
        invalid_tokens_cleared: invalidTokenCount,
        stale_marked: staleCount ?? 0,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-push-receipts error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
