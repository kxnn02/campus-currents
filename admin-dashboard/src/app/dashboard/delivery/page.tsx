import { createClient } from "@/lib/supabase/server";
import { Users, ShieldCheck, AlertTriangle } from "lucide-react";

export default async function DeliveryMonitorPage() {
  const supabase = await createClient();

  // Get the most recent broadcast
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
    .eq("role", "student");

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
  const readPct = total > 0 ? Math.round((readCount / total) * 100) : 0;
  const safePct = total > 0 ? Math.round((safeCount / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Delivery Monitor</h2>
          <p className="text-[#444653] mt-1">
            Real-time broadcast delivery and accountability tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#16A34A]/10 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="text-sm font-semibold text-[#16A34A]">Live Feed</span>
        </div>
      </div>

      {/* Real-time Delivery Status */}
      <section className="rounded-lg border border-[#C4C5D5] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#141B2B]">
              {latestBroadcast?.title || "No recent broadcast"}
            </h3>
            <p className="text-xs text-[#444653] mt-0.5">
              {latestBroadcast?.sent_at
                ? `Sent ${new Date(latestBroadcast.sent_at).toLocaleString()}`
                : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#141B2B]">{deliveredCount.toLocaleString()}/{total.toLocaleString()}</p>
            <p className="text-xs text-[#444653]">students reached</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-4 w-full rounded-full bg-[#C4C5D5]/30 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8E0002] to-[#DC2626] transition-all duration-500"
            style={{ width: `${deliveryPct}%` }}
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 border-t border-[#C4C5D5]/50 pt-4">
          <div className="text-center">
            <p className="text-xs text-[#444653]">Delivered</p>
            <p className="text-xl font-bold text-[#141B2B]">{deliveredCount.toLocaleString()}</p>
          </div>
          <div className="text-center border-x border-[#C4C5D5]/50">
            <p className="text-xs text-[#444653]">Read</p>
            <p className="text-xl font-bold text-[#141B2B]">{readCount.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#444653]">Pending</p>
            <p className="text-xl font-bold text-[#141B2B]">{(total - deliveredCount).toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* Accountability Summary */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#444653]">
          Accountability Summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 rounded-lg border border-[#C4C5D5] bg-white p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#16A34A]/10">
              <ShieldCheck className="h-6 w-6 text-[#16A34A]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#141B2B]">Marked Safe</span>
                <span className="text-sm font-bold text-[#141B2B]">{safeCount.toLocaleString()}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#C4C5D5]/30 overflow-hidden">
                <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${safePct}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-[#C4C5D5] bg-white p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DC2626]/10">
              <AlertTriangle className="h-6 w-6 text-[#DC2626]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#141B2B]">Need Help</span>
                <span className="text-sm font-bold text-[#DC2626]">{helpCount}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#C4C5D5]/30 overflow-hidden">
                <div className="h-full rounded-full bg-[#DC2626]" style={{ width: `${total > 0 ? Math.round((helpCount / total) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-[#C4C5D5] bg-white p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F59E0B]/10">
              <Users className="h-6 w-6 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#141B2B]">No Response</span>
                <span className="text-sm font-bold text-[#141B2B]">{(total - safeCount - helpCount).toLocaleString()}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#C4C5D5]/30 overflow-hidden">
                <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${total > 0 ? Math.round(((total - safeCount - helpCount) / total) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
