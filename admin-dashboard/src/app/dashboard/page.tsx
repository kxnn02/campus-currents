import { createClient } from "@/lib/supabase/server";
import { TIER_CONFIG } from "@/lib/constants";
import {
  Megaphone,
  CloudOff,
  CalendarDays,
  AlertTriangle,
  Users,
  Radio,
  Send,
  Shield,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: broadcastCount },
    { count: suspensionCount },
    { count: eventCount },
    { count: emergencyCount },
    { count: studentCount },
    { count: broadcastsTodayCount },
  ] = await Promise.all([
    supabase
      .from("broadcasts")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false),
    supabase
      .from("class_suspensions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("calendar_events")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false)
      .eq("status", "active"),
    supabase
      .from("active_emergencies")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .not("fcm_token", "is", null),
    supabase
      .from("broadcasts")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false)
      .gte("sent_at", todayStart.toISOString()),
  ]);

  // Fetch recent broadcasts — the 5 most recent, which are what admins need to monitor
  const { data: recentBroadcasts } = await supabase
    .from("broadcasts")
    .select("id, title, tier, channel, sent_at, is_pinned")
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false })
    .limit(5);

  // Get delivery receipts for those broadcasts to show reach/engagement
  const broadcastIds = recentBroadcasts?.map((b) => b.id) ?? [];
  const { data: receipts } = broadcastIds.length > 0
    ? await supabase
        .from("delivery_receipts")
        .select("broadcast_id, delivered_at, read_at")
        .in("broadcast_id", broadcastIds)
    : { data: [] };

  // Aggregate: for each broadcast, how many delivered and how many read
  const statsMap: Record<string, { delivered: number; read: number }> = {};
  if (receipts) {
    for (const r of receipts) {
      if (!statsMap[r.broadcast_id]) statsMap[r.broadcast_id] = { delivered: 0, read: 0 };
      if (r.delivered_at) statsMap[r.broadcast_id].delivered++;
      if (r.read_at) statsMap[r.broadcast_id].read++;
    }
  }

  // Read engagement over last 5 days — shows whether students are actually reading what we send
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayQueries = Array.from({ length: 5 }, (_, idx) => {
    const i = 4 - idx;
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);
    return { d, nextD, label: dayLabels[d.getDay()] };
  });

  const dayResults = await Promise.all(
    dayQueries.map(({ d, nextD }) =>
      supabase
        .from("delivery_receipts")
        .select("*", { count: "exact", head: true })
        .gte("read_at", d.toISOString())
        .lt("read_at", nextD.toISOString())
    )
  );

  const last5Days = dayQueries.map((q, i) => ({
    label: q.label,
    readCount: dayResults[i].count ?? 0,
  }));
  const maxRead = Math.max(...last5Days.map((d) => d.readCount), 1);

  // Determine if there's something the admin should pay attention to
  const hasActiveEmergency = (emergencyCount ?? 0) > 0;
  const hasActiveSuspension = (suspensionCount ?? 0) > 0;

  return (
    <div className="space-y-6">

      {/* ─── EMERGENCY BANNER ─── */}
      {hasActiveEmergency && (
        <Link href="/dashboard/emergency" className="block">
          <div className="emergency-glow flex items-center gap-3 rounded-xl border-2 border-[#BA1A1A]/40 bg-gradient-to-r from-[#BA1A1A]/[0.08] to-[#FFDAD6] px-5 py-4 transition-all duration-200 hover:border-[#BA1A1A]/60">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#BA1A1A]/10">
              <AlertTriangle className="h-5 w-5 text-[#BA1A1A] emergency-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#BA1A1A]">
                {emergencyCount} active emergency alert{(emergencyCount ?? 0) > 1 ? "s" : ""} — requires your attention
              </p>
              <p className="text-xs text-[#5B403D] mt-0.5">Click to manage emergency response</p>
            </div>
            <span className="text-xs font-bold text-[#BA1A1A] bg-[#BA1A1A]/10 px-3 py-1.5 rounded-md">Manage →</span>
          </div>
        </Link>
      )}

      {/* ─── QUICK ACTIONS ─── */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Link href="/dashboard/broadcasts" className="block group">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#AF101A] to-[#8B0D15] p-6 shadow-lg shadow-[#AF101A]/15 transition-all duration-200 group-hover:shadow-xl group-hover:shadow-[#AF101A]/20 group-hover:scale-[1.02] active:scale-[0.98]">
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                <Megaphone className="h-[18px] w-[18px] text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mt-1">New Broadcast</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Reach {studentCount?.toLocaleString() ?? 0} students via push, SMS, and feed.
              </p>
            </div>
            <Send className="absolute bottom-[-12px] right-[-12px] h-24 w-24 text-white/[0.07] rotate-[-15deg]" />
          </div>
        </Link>
        <Link href="/dashboard/suspensions" className="block group">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F89C00] to-[#E08900] p-6 shadow-lg shadow-[#F89C00]/15 transition-all duration-200 group-hover:shadow-xl group-hover:shadow-[#F89C00]/20 group-hover:scale-[1.02] active:scale-[0.98]">
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <CloudOff className="h-[18px] w-[18px] text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mt-1">Post Suspension</h3>
              <p className="text-sm text-white/85 leading-relaxed">
                {hasActiveSuspension
                  ? `${suspensionCount} suspension${(suspensionCount ?? 0) > 1 ? "s" : ""} active now. Manage or post new.`
                  : "Declare class suspension and auto-notify all students."}
              </p>
            </div>
            <CloudOff className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-white/[0.08]" />
          </div>
        </Link>
        <Link href="/dashboard/calendar" className="block group">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#16A34A] to-[#128A3E] p-6 shadow-lg shadow-[#16A34A]/15 transition-all duration-200 group-hover:shadow-xl group-hover:shadow-[#16A34A]/20 group-hover:scale-[1.02] active:scale-[0.98]">
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <CalendarDays className="h-[18px] w-[18px] text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mt-1">New Event</h3>
              <p className="text-sm text-white/85 leading-relaxed">
                {(eventCount ?? 0) > 0
                  ? `${eventCount} upcoming event${(eventCount ?? 0) > 1 ? "s" : ""} scheduled. Add another.`
                  : "Schedule campus activities, deadlines, and reminders."}
              </p>
            </div>
            <CalendarDays className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-white/[0.08]" />
          </div>
        </Link>
      </div>

      {/* ─── KEY METRICS ─── */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-[#F0DDD9] bg-white p-5 card-hover">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#AF101A]/[0.08]">
            <Users className="h-5 w-5 text-[#AF101A]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#5B403D]">Audience Reach</p>
            <p className="text-2xl font-bold text-[#1A1C1C] tabular-nums">{studentCount?.toLocaleString() ?? 0}</p>
            <p className="text-[11px] text-[#5B403D]">students with push enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#F0DDD9] bg-white p-5 card-hover">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${hasActiveSuspension ? "bg-[#F89C00]/10" : "bg-[#16A34A]/10"}`}>
            <Radio className={`h-5 w-5 ${hasActiveSuspension ? "text-[#F89C00]" : "text-[#16A34A]"}`} />
          </div>
          <div>
            <p className="text-xs font-medium text-[#5B403D]">Class Operations</p>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${hasActiveSuspension ? "text-[#F89C00]" : "text-[#16A34A]"}`}>
                {hasActiveSuspension ? "SUSPENDED" : "RUNNING"}
              </span>
            </div>
            <p className="text-[11px] text-[#5B403D]">
              {hasActiveSuspension
                ? `${suspensionCount} active suspension${(suspensionCount ?? 0) > 1 ? "s" : ""}`
                : "all levels operational"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#F0DDD9] bg-white p-5 card-hover">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5E67C2]/10">
            <Send className="h-5 w-5 text-[#5E67C2]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#5B403D]">Today&apos;s Activity</p>
            <p className="text-2xl font-bold text-[#1A1C1C] tabular-nums">{broadcastsTodayCount ?? 0}</p>
            <p className="text-[11px] text-[#5B403D]">
              broadcast{(broadcastsTodayCount ?? 0) !== 1 ? "s" : ""} sent today · {broadcastCount ?? 0} total
            </p>
          </div>
        </div>
      </div>

      {/* ─── RECENT BROADCASTS ─── */}
      <div className="overflow-hidden rounded-xl border border-[#F0DDD9] bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-[#1A1C1C]">Recent Broadcasts</h3>
            <p className="text-xs text-[#5B403D] mt-0.5">Delivery and engagement tracking</p>
          </div>
          <Link href="/dashboard/history" className="text-xs font-bold text-[#AF101A] hover:text-[#8B0D15] transition-colors px-3 py-1.5 rounded-md hover:bg-[#AF101A]/[0.06]">
            View All →
          </Link>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-[100px_1fr_130px_90px_90px_50px] min-w-[640px] border-y border-[#F0DDD9] bg-[#FDF5F3]">
            <div className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Tier</div>
            <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Title</div>
            <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Sent</div>
            <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Delivered</div>
            <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Opened</div>
            <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#5B403D]"></div>
          </div>

          {recentBroadcasts && recentBroadcasts.length > 0 ? (
            recentBroadcasts.map((broadcast) => {
              const bStats = statsMap[broadcast.id] || { delivered: 0, read: 0 };
              const total = studentCount ?? 1;
              const deliveredPct = total > 0 ? Math.round((bStats.delivered / total) * 100) : 0;
              const readPct = total > 0 ? Math.round((bStats.read / total) * 100) : 0;
              const tier = TIER_CONFIG[broadcast.tier] || TIER_CONFIG.routine;

              return (
                <div
                  key={broadcast.id}
                  className="relative grid grid-cols-[100px_1fr_130px_90px_90px_50px] min-w-[640px] items-center border-b border-[#F0DDD9] last:border-b-0 warm-table-row"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${tier.border} rounded-r`} />

                  <div className="px-5 py-3.5">
                    <span className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tier.bg} ${tier.text}`}>
                      {tier.label}
                    </span>
                  </div>

                  <div className="px-4 py-3.5">
                    <span className="text-sm font-medium text-[#1A1C1C] truncate block">
                      {broadcast.title}
                    </span>
                  </div>

                  <div className="px-4 py-3.5 text-xs text-[#5B403D] tabular-nums">
                    {broadcast.sent_at
                      ? new Date(broadcast.sent_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </div>

                  <div className="px-4 py-3.5 tabular-nums">
                    <span className="text-sm font-medium text-[#1A1C1C]">{bStats.delivered.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-[#16A34A] ml-1">{deliveredPct}%</span>
                  </div>

                  <div className="px-4 py-3.5 tabular-nums">
                    <span className="text-sm font-medium text-[#1A1C1C]">{bStats.read.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-[#5E67C2] ml-1">{readPct}%</span>
                  </div>

                  <div className="px-4 py-3.5">
                    <Link
                      href={`/dashboard/broadcasts/${broadcast.id}`}
                      className="rounded-md p-1.5 hover:bg-[#FFF1ED] transition-colors inline-flex"
                      title="View delivery details"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#AF101A]" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-14 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF5F3] mb-3">
                <Megaphone className="h-5 w-5 text-[#E4BEBA]" />
              </div>
              <p className="text-sm font-medium text-[#1A1C1C]">No broadcasts yet</p>
              <p className="text-xs text-[#5B403D] mt-1">
                Send your first broadcast to start tracking delivery metrics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM SECTION ─── */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        {/* System Health */}
        <div className="rounded-xl border border-[#F0DDD9] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1C1C]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1C1C]">Notification Channels</h3>
              <p className="text-[11px] text-[#5B403D]">All must be active for emergency delivery</p>
            </div>
          </div>
          <div className="space-y-0">
            <div className="flex items-center justify-between border-b border-[#F0DDD9] py-3">
              <span className="text-sm text-[#1A1C1C]">SMS Gateway</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-xs font-semibold text-[#16A34A]">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#F0DDD9] py-3">
              <span className="text-sm text-[#1A1C1C]">Push Notifications</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-xs font-semibold text-[#16A34A]">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#F0DDD9] py-3">
              <span className="text-sm text-[#1A1C1C]">In-App Feed</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-xs font-semibold text-[#16A34A]">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-[#1A1C1C]">Campus Status</span>
              <div className="flex items-center gap-1.5">
                {hasActiveEmergency ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-[#BA1A1A] emergency-pulse" />
                    <span className="text-xs font-bold text-[#BA1A1A]">Emergency Active</span>
                  </>
                ) : hasActiveSuspension ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-[#F89C00]" />
                    <span className="text-xs font-bold text-[#F89C00]">Classes Suspended</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                    <span className="text-xs font-semibold text-[#16A34A]">Normal Operations</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Trend */}
        <div className="rounded-xl border border-[#F0DDD9] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-[#1A1C1C]">Student Engagement</h3>
            <p className="text-[11px] text-[#5B403D] mt-0.5">
              Broadcasts opened per day — indicates student responsiveness
            </p>
          </div>
          <div
            className="flex items-end justify-between gap-3 h-[130px]"
            role="img"
            aria-label={`Bar chart showing opened engagement over last 5 days. Total: ${last5Days.reduce((sum, d) => sum + d.readCount, 0)} opened.`}
          >
            {last5Days.map((day, i) => {
              const pct = Math.max(10, Math.round((day.readCount / maxRead) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#5B403D] tabular-nums">{day.readCount}</span>
                  <div
                    className="w-full max-w-[44px] rounded-t-md transition-all duration-300"
                    style={{
                      height: `${pct}%`,
                      backgroundColor: i === 4 ? "#AF101A" : "#E4BEBA",
                    }}
                  />
                  <span className="text-[10px] font-medium text-[#5B403D]">{day.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0DDD9] flex items-center justify-between">
            <span className="text-xs text-[#5B403D]">
              Total opened this week: <span className="font-bold text-[#1A1C1C] tabular-nums">{last5Days.reduce((sum, d) => sum + d.readCount, 0).toLocaleString()}</span>
            </span>
            <Link href="/dashboard/analytics" className="text-xs font-bold text-[#AF101A] hover:text-[#8B0D15] transition-colors">
              Full Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
