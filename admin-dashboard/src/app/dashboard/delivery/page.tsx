import { createClient } from "@/lib/supabase/server";
import { Users, ShieldCheck, AlertTriangle } from "lucide-react";

export default async function DeliveryMonitorPage() {
  const supabase = await createClient();

  const { data: latestBroadcast } = await supabase
    .from("broadcasts")
    .select("id, title, tier, sent_at")
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false })
    .limit(1)
    .single();

  const { count: totalStudents } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .not("fcm_token", "is", null);

  let deliveredCount = 0;
  let readCount = 0;
  let safeCount = 0;
  let helpCount = 0;

  if (latestBroadcast) {
    const { count: delivered } = await supabase
      .from("delivery_receipts")
      .select("*", { count: "exact", head: true })
      .eq("broadcast_id", latestBroadcast.id)
      .not("delivered_at", "is", null);

    const { count: read } = await supabase
      .from("delivery_receipts")
      .select("*", { count: "exact", head: true })
      .eq("broadcast_id", latestBroadcast.id)
      .not("read_at", "is", null);

    const { count: safe } = await supabase
      .from("delivery_receipts")
      .select("*", { count: "exact", head: true })
      .eq("broadcast_id", latestBroadcast.id)
      .eq("acknowledgment_type", "safe");

    const { count: help } = await supabase
      .from("delivery_receipts")
      .select("*", { count: "exact", head: true })
      .eq("broadcast_id", latestBroadcast.id)
      .eq("acknowledgment_type", "need_help");

    deliveredCount = delivered ?? 0;
    readCount = read ?? 0;
    safeCount = safe ?? 0;
    helpCount = help ?? 0;
  }

  const total = totalStudents ?? 1;
  const deliveryPct = total > 0 ? Math.round((deliveredCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Delivery Monitor</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Real-time broadcast delivery and accountability tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-xs font-medium text-emerald-700">Live</span>
        </div>
      </div>

      {/* Latest Broadcast Delivery */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              {latestBroadcast?.title || "No recent broadcast"}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {latestBroadcast?.sent_at
                ? `Sent ${new Date(latestBroadcast.sent_at).toLocaleString()}`
                : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold text-zinc-900 tabular-nums">{deliveredCount}/{total}</p>
            <p className="text-xs text-zinc-500">reachable via push</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-[#B91C1C] transition-all duration-500"
            style={{ width: `${deliveryPct}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-zinc-100 pt-4">
          <div className="text-center">
            <p className="text-xs text-zinc-500">Delivered</p>
            <p className="text-lg font-semibold text-zinc-900 tabular-nums">{deliveredCount}</p>
          </div>
          <div className="text-center border-x border-zinc-100">
            <p className="text-xs text-zinc-500">Opened</p>
            <p className="text-lg font-semibold text-zinc-900 tabular-nums">{readCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Pending</p>
            <p className="text-lg font-semibold text-zinc-900 tabular-nums">{(total - deliveredCount)}</p>
          </div>
        </div>
      </div>

      {/* Accountability */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Accountability Summary
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">Marked Safe</span>
                <span className="text-sm font-semibold text-zinc-900 tabular-nums">{safeCount}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${total > 0 ? Math.round((safeCount / total) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">Need Help</span>
                <span className="text-sm font-semibold text-red-600 tabular-nums">{helpCount}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: `${total > 0 ? Math.round((helpCount / total) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">No Response</span>
                <span className="text-sm font-semibold text-zinc-900 tabular-nums">{(total - safeCount - helpCount)}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${total > 0 ? Math.round(((total - safeCount - helpCount) / total) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
