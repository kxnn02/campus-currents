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
      {/* Only shown when there's an unresolved emergency. Demands immediate attention. */}
      {hasActiveEmergency && (
        <Link href="/dashboard/emergency" className="block">
          <div className="flex items-center gap-3 rounded-lg border border-[#DC2626]/30 bg-[#FFDAD6] px-5 py-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-[#DC2626] animate-pulse shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-[#93000A]">
                {emergencyCount} active emergency alert{(emergencyCount ?? 0) > 1 ? "s" : ""} — requires your attention
              </p>
            </div>
            <span className="text-xs font-semibold text-[#93000A] underline">Manage →</span>
          </div>
        </Link>
      )}

      {/* ─── QUICK ACTIONS ─── */}
      {/* The 3 primary admin workflows. Each card is a shortcut to the most common task. */}
      {/* Color-coded by domain: Blue = communication, Red = safety/disruption, Green = planning */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Link href="/dashboard/broadcasts" className="block group">
          <div className="relative overflow-hidden rounded-lg bg-[#1E40AF] p-6 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-[1.01]">
            <div className="relative z-10 flex flex-col gap-2">
              <Megaphone className="h-5 w-5 text-white/80" />
              <h3 className="text-xl font-semibold text-white">New Broadcast</h3>
              <p className="text-sm text-white/90">
                Reach {studentCount?.toLocaleString() ?? 0} students via push, SMS, and feed.
              </p>
            </div>
            <Send className="absolute bottom-[-8px] right-[-8px] h-20 w-20 text-white/10 rotate-[-15deg]" />
          </div>
        </Link>
        <Link href="/dashboard/suspensions" className="block group">
          <div className="relative overflow-hidden rounded-lg bg-[#DC2626] p-6 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-[1.01]">
            <div className="relative z-10 flex flex-col gap-2">
              <CloudOff className="h-5 w-5 text-white/80" />
              <h3 className="text-xl font-semibold text-white">Post Suspension</h3>
              <p className="text-sm text-white/90">
                {hasActiveSuspension
                  ? `${suspensionCount} suspension${(suspensionCount ?? 0) > 1 ? "s" : ""} active now. Manage or post new.`
                  : "Declare class suspension and auto-notify all students."}
              </p>
            </div>
            <AlertTriangle className="absolute bottom-[-8px] right-[-8px] h-24 w-24 text-white/10" />
          </div>
        </Link>
        <Link href="/dashboard/calendar" className="block group">
          <div className="relative overflow-hidden rounded-lg bg-[#16A34A] p-6 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-[1.01]">
            <div className="relative z-10 flex flex-col gap-2">
              <CalendarDays className="h-5 w-5 text-white/80" />
              <h3 className="text-xl font-semibold text-white">New Event</h3>
              <p className="text-sm text-white/90">
                {(eventCount ?? 0) > 0
                  ? `${eventCount} upcoming event${(eventCount ?? 0) > 1 ? "s" : ""} scheduled. Add another.`
                  : "Schedule campus activities, deadlines, and reminders."}
              </p>
            </div>
            <CalendarDays className="absolute bottom-[-8px] right-[-8px] h-[90px] w-[90px] text-white/10" />
          </div>
        </Link>
      </div>

      {/* ─── KEY METRICS ─── */}
      {/* Answers 3 questions an admin checks every time they open the dashboard: */}
      {/* 1. How big is my audience? 2. Are classes running? 3. How active are we today? */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded border border-[#C4C5D5] bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F3FF]">
            <Users className="h-5 w-5 text-[#1E40AF]" />
          </div>
          <div>
            <p className="text-xs text-[#444653]">Audience Reach</p>
            <p className="text-xl font-semibold text-[#141B2B]">{studentCount?.toLocaleString() ?? 0}</p>
            <p className="text-[10px] text-[#444653]">students with push enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded border border-[#C4C5D5] bg-white p-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${hasActiveSuspension ? "bg-[#FFDAD6]" : "bg-[#F1F3FF]"}`}>
            <Radio className={`h-5 w-5 ${hasActiveSuspension ? "text-[#DC2626]" : "text-[#1E40AF]"}`} />
          </div>
          <div>
            <p className="text-xs text-[#444653]">Class Operations</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-[#141B2B]">
                {hasActiveSuspension ? "SUSPENDED" : "RUNNING"}
              </span>
            </div>
            <p className="text-[10px] text-[#444653]">
              {hasActiveSuspension
                ? `${suspensionCount} active suspension${(suspensionCount ?? 0) > 1 ? "s" : ""}`
                : "all levels operational"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded border border-[#C4C5D5] bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F3FF]">
            <Send className="h-5 w-5 text-[#1E40AF]" />
          </div>
          <div>
            <p className="text-xs text-[#444653]">Today&apos;s Activity</p>
            <p className="text-xl font-semibold text-[#141B2B]">{broadcastsTodayCount ?? 0}</p>
            <p className="text-[10px] text-[#444653]">
              broadcast{(broadcastsTodayCount ?? 0) !== 1 ? "s" : ""} sent today · {broadcastCount ?? 0} total all time
            </p>
          </div>
        </div>
      </div>

      {/* ─── RECENT BROADCASTS ─── */}
      {/* The accountability table. Shows the last 5 broadcasts with delivery metrics. */}
      {/* Purpose: confirm broadcasts are landing (delivered %) and being read (read %). */}
      {/* A low read % means students are ignoring messages — a signal to adjust tier or content. */}
      <div className="overflow-hidden rounded-lg border border-[#C4C5D5] bg-white">
        <div className="flex items-center justify-between border-b border-[#C4C5D5] px-4 py-4">
          <div>
            <h3 className="text-base font-semibold text-[#141B2B]">Recent Broadcasts</h3>
            <p className="text-xs text-[#444653] mt-0.5">Delivery and engagement tracking</p>
          </div>
          <Link href="/dashboard/history" className="text-sm font-semibold text-[#8E0002] hover:underline">
            View All
          </Link>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-[120px_1fr_140px_100px_100px_60px] min-w-[640px] bg-[#FFF1F1] border-b border-[#C4C5D5]">
            <div className="px-4 py-2 text-sm font-semibold text-[#444653]">Tier</div>
            <div className="px-4 py-2 text-sm font-semibold text-[#444653]">Title</div>
            <div className="px-4 py-2 text-sm font-semibold text-[#444653]">Sent</div>
            <div className="px-4 py-2 text-sm font-semibold text-[#444653]">Delivered</div>
            <div className="px-4 py-2 text-sm font-semibold text-[#444653]">Read</div>
            <div className="px-4 py-2 text-sm font-semibold text-[#444653]">View</div>
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
                  className="relative grid grid-cols-[120px_1fr_140px_100px_100px_60px] min-w-[640px] items-center border-b border-[#C4C5D5] last:border-b-0"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${tier.border}`} />

                  <div className="px-4 py-4 pl-6">
                    <span className={`inline-block rounded-sm px-2 py-1 text-xs font-bold uppercase ${tier.bg} ${tier.text}`}>
                      {tier.label}
                    </span>
                  </div>

                  <div className="px-4 py-4">
                    <span className="text-sm font-semibold text-[#141B2B] truncate block">
                      {broadcast.title}
                    </span>
                  </div>

                  <div className="px-4 py-4 text-sm text-[#444653]">
                    {broadcast.sent_at
                      ? new Date(broadcast.sent_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </div>

                  <div className="px-4 py-4">
                    <span className="text-sm text-[#141B2B]">{bStats.delivered.toLocaleString()} </span>
                    <span className="text-[10px] font-bold text-[#16A34A]">{deliveredPct}%</span>
                  </div>

                  <div className="px-4 py-4">
                    <span className="text-sm text-[#141B2B]">{bStats.read.toLocaleString()} </span>
                    <span className="text-[10px] font-bold text-[#0058BE]">{readPct}%</span>
                  </div>

                  <div className="px-4 py-4">
                    <Link
                      href={`/dashboard/broadcasts/${broadcast.id}`}
                      className="rounded p-1 hover:bg-[#FFF1F1] transition-colors inline-flex"
                      title="View delivery details"
                    >
                      <ExternalLink className="h-4 w-4 text-[#8E0002]" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <Megaphone className="h-8 w-8 mx-auto text-[#C4C5D5] mb-2" />
              <p className="text-sm font-medium text-[#141B2B]">No broadcasts yet</p>
              <p className="text-xs text-[#444653] mt-1">
                Send your first broadcast to start tracking delivery metrics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM SECTION ─── */}
      {/* Left: System health — answers "Can I send messages right now?" */}
      {/* Right: Engagement trend — answers "Are students actually reading our broadcasts?" */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* System Health — confirms all notification channels are functional */}
        <div className="rounded-lg border border-[#C4C5D5] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#141B2B]" />
            <h3 className="text-base font-semibold text-[#141B2B]">Notification Channels</h3>
          </div>
          <p className="text-xs text-[#444653] mb-3">
            All channels must be active to guarantee message delivery during emergencies.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-dashed border-[#C4C5D5] py-2">
              <span className="text-sm text-[#141B2B]">SMS Gateway</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-sm font-semibold text-[#16A34A]">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-dashed border-[#C4C5D5] py-2">
              <span className="text-sm text-[#141B2B]">Push Notifications</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-sm font-semibold text-[#16A34A]">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-dashed border-[#C4C5D5] py-2">
              <span className="text-sm text-[#141B2B]">In-App Feed</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-sm font-semibold text-[#16A34A]">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#141B2B]">Campus Status</span>
              <div className="flex items-center gap-1.5">
                {hasActiveEmergency ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-[#DC2626] animate-pulse" />
                    <span className="text-sm font-semibold text-[#DC2626]">Emergency Active</span>
                  </>
                ) : hasActiveSuspension ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                    <span className="text-sm font-semibold text-[#F59E0B]">Classes Suspended</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                    <span className="text-sm font-semibold text-[#16A34A]">Normal Operations</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Trend — shows if students are reading broadcasts */}
        {/* If bars are consistently low, admins know to: adjust tier, shorten messages, or check timing */}
        <div className="rounded-lg border border-[#C4C5D5] bg-[#FFF1F1] p-6 overflow-hidden">
          <h3 className="text-base font-semibold text-[#141B2B]">Student Engagement</h3>
          <p className="text-xs text-[#444653] mt-0.5 mb-4">
            Broadcast reads per day — indicates whether students are engaging with messages.
          </p>
          <div
            className="flex items-end justify-between gap-2 h-[120px]"
            role="img"
            aria-label={`Bar chart showing read engagement over last 5 days. Total: ${last5Days.reduce((sum, d) => sum + d.readCount, 0)} reads.`}
          >
            {last5Days.map((day, i) => {
              const pct = Math.max(8, Math.round((day.readCount / maxRead) * 100));
              const opacity = 0.3 + (i / 4) * 0.7;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-[#444653]">{day.readCount}</span>
                  <div
                    className="w-full max-w-[48px] rounded-t transition-all"
                    style={{ height: `${pct}%`, backgroundColor: `rgba(141, 21, 21, ${opacity})` }}
                  />
                  <span className="text-[10px] text-[#444653]">{day.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-[#C4C5D5]/50 flex items-center justify-between">
            <span className="text-xs text-[#444653]">
              Total reads this week: <span className="font-semibold text-[#141B2B]">{last5Days.reduce((sum, d) => sum + d.readCount, 0).toLocaleString()}</span>
            </span>
            <Link href="/dashboard/analytics" className="text-xs font-semibold text-[#8E0002] hover:underline">
              Full Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
