import { createClient } from "@/lib/supabase/server";
import { TIER_CONFIG } from "@/lib/constants";
import {
  Megaphone,
  CloudOff,
  CalendarDays,
  AlertTriangle,
  Users,
  Send,
  ExternalLink,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 24h ago for push delivery health
  const yesterday = new Date(todayStart);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString();

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

  // Push delivery health - last 24h
  const [
    { count: ticketsTotal },
    { count: ticketsDelivered },
  ] = await Promise.all([
    supabase
      .from("push_tickets")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterdayISO),
    supabase
      .from("push_tickets")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterdayISO)
      .eq("status", "delivered"),
  ]);

  const deliveryRate = (ticketsTotal ?? 0) > 0
    ? Math.round(((ticketsDelivered ?? 0) / (ticketsTotal ?? 1)) * 100)
    : 0;

  // Recent broadcasts
  const { data: recentBroadcasts } = await supabase
    .from("broadcasts")
    .select("id, title, tier, channel, sent_at, is_pinned")
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false })
    .limit(5);

  // Delivery receipts for recent broadcasts
  const broadcastIds = recentBroadcasts?.map((b) => b.id) ?? [];
  const { data: receipts } = broadcastIds.length > 0
    ? await supabase
        .from("delivery_receipts")
        .select("broadcast_id, delivered_at, read_at")
        .in("broadcast_id", broadcastIds)
    : { data: [] };

  const statsMap: Record<string, { delivered: number; read: number }> = {};
  if (receipts) {
    for (const r of receipts) {
      if (!statsMap[r.broadcast_id]) statsMap[r.broadcast_id] = { delivered: 0, read: 0 };
      if (r.delivered_at) statsMap[r.broadcast_id].delivered++;
      if (r.read_at) statsMap[r.broadcast_id].read++;
    }
  }

  // Engagement trend - last 7 days
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayQueries = Array.from({ length: 7 }, (_, idx) => {
    const i = 6 - idx;
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

  const last7Days = dayQueries.map((q, i) => ({
    label: q.label,
    readCount: dayResults[i].count ?? 0,
  }));
  const maxRead = Math.max(...last7Days.map((d) => d.readCount), 1);

  // Attention items
  const { count: openBugs } = await supabase
    .from("bug_reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const { count: unreadFeedback } = await supabase
    .from("feedback")
    .select("*", { count: "exact", head: true });

  const hasActiveEmergency = (emergencyCount ?? 0) > 0;
  const hasActiveSuspension = (suspensionCount ?? 0) > 0;

  return (
    <div className="space-y-6">

      {/* Emergency Banner */}
      {hasActiveEmergency && (
        <Link href="/dashboard/emergency" className="block">
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 transition-colors hover:bg-red-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse-dot" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                {emergencyCount} active emergency alert{(emergencyCount ?? 0) > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-600">Requires immediate attention</p>
            </div>
            <span className="text-xs font-medium text-red-700 shrink-0">Manage &rarr;</span>
          </div>
        </Link>
      )}

      {/* Status Bar */}
      <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${hasActiveEmergency ? "bg-red-500 animate-pulse-dot" : hasActiveSuspension ? "bg-amber-500" : "bg-emerald-500"}`} />
          <span className="text-xs font-medium text-zinc-700">
            {hasActiveEmergency ? "Emergency Active" : hasActiveSuspension ? "Classes Suspended" : "Normal Operations"}
          </span>
        </div>
        <div className="h-4 w-px bg-zinc-200" />
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${deliveryRate >= 80 ? "bg-emerald-500" : deliveryRate >= 50 ? "bg-amber-500" : "bg-red-500"}`} />
          <span className="text-xs text-zinc-500">
            Push: {deliveryRate}% delivery (24h)
          </span>
        </div>
        <div className="h-4 w-px bg-zinc-200" />
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-zinc-400" />
          <span className="text-xs text-zinc-500">
            {studentCount?.toLocaleString() ?? 0} reachable
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Audience</span>
            <Users className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-semibold text-zinc-900 tabular-nums">{studentCount?.toLocaleString() ?? 0}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">students with push enabled</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Today</span>
            <Send className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-semibold text-zinc-900 tabular-nums">{broadcastsTodayCount ?? 0}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">{broadcastCount ?? 0} total broadcasts</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Delivery Rate</span>
            <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className={`text-2xl font-semibold tabular-nums ${deliveryRate >= 80 ? "text-emerald-600" : deliveryRate >= 50 ? "text-amber-600" : "text-red-600"}`}>
            {deliveryRate}%
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">push success last 24h</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Events</span>
            <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-semibold text-zinc-900 tabular-nums">{eventCount ?? 0}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">upcoming active events</p>
        </div>
      </div>

      {/* Recent Broadcasts + Quick Actions side by side */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_280px]">

        {/* Recent Broadcasts */}
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">Recent Broadcasts</h2>
            <Link href="/dashboard/history" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              View all &rarr;
            </Link>
          </div>

          {recentBroadcasts && recentBroadcasts.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {recentBroadcasts.map((broadcast) => {
                const bStats = statsMap[broadcast.id] || { delivered: 0, read: 0 };
                const total = studentCount ?? 1;
                const deliveredPct = total > 0 ? Math.round((bStats.delivered / total) * 100) : 0;
                const readPct = total > 0 ? Math.round((bStats.read / total) * 100) : 0;
                const tier = TIER_CONFIG[broadcast.tier] || TIER_CONFIG.routine;

                return (
                  <div key={broadcast.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors">
                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${tier.border}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{broadcast.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {broadcast.sent_at
                          ? new Date(broadcast.sent_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "Draft"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-medium text-zinc-700 tabular-nums">{deliveredPct}%</p>
                        <p className="text-[10px] text-zinc-400">delivered</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-zinc-700 tabular-nums">{readPct}%</p>
                        <p className="text-[10px] text-zinc-400">opened</p>
                      </div>
                      <Link
                        href={`/dashboard/broadcasts/${broadcast.id}`}
                        className="rounded p-1 hover:bg-zinc-100 transition-colors"
                        title="View details"
                      >
                        <ExternalLink className="h-3 w-3 text-zinc-400" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Megaphone className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No broadcasts yet</p>
              <Link href="/dashboard/broadcasts" className="text-xs font-medium text-[#B91C1C] mt-1 inline-block hover:underline">
                Send your first broadcast
              </Link>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions + Attention */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/broadcasts"
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors"
              >
                <Megaphone className="h-4 w-4 text-[#B91C1C]" />
                New Broadcast
              </Link>
              <Link
                href="/dashboard/suspensions"
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors"
              >
                <CloudOff className="h-4 w-4 text-amber-600" />
                Post Suspension
              </Link>
              <Link
                href="/dashboard/calendar"
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors"
              >
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                New Event
              </Link>
              <Link
                href="/dashboard/emergency"
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Emergency Alert
              </Link>
            </div>
          </div>

          {/* Attention Needed */}
          {((openBugs ?? 0) > 0 || (unreadFeedback ?? 0) > 0 || hasActiveSuspension) && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Needs Attention</h2>
              <div className="space-y-2">
                {(openBugs ?? 0) > 0 && (
                  <Link href="/dashboard/bugs" className="flex items-center justify-between py-1.5 group">
                    <span className="text-xs text-zinc-600 group-hover:text-zinc-900 transition-colors">Open bug reports</span>
                    <span className="text-xs font-semibold text-red-600 tabular-nums">{openBugs}</span>
                  </Link>
                )}
                {(unreadFeedback ?? 0) > 0 && (
                  <Link href="/dashboard/feedback" className="flex items-center justify-between py-1.5 group">
                    <span className="text-xs text-zinc-600 group-hover:text-zinc-900 transition-colors">Feedback entries</span>
                    <span className="text-xs font-semibold text-zinc-700 tabular-nums">{unreadFeedback}</span>
                  </Link>
                )}
                {hasActiveSuspension && (
                  <Link href="/dashboard/suspensions" className="flex items-center justify-between py-1.5 group">
                    <span className="text-xs text-zinc-600 group-hover:text-zinc-900 transition-colors">Active suspensions</span>
                    <span className="text-xs font-semibold text-amber-600 tabular-nums">{suspensionCount}</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Trend */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Student Engagement</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Broadcasts opened per day - last 7 days
            </p>
          </div>
          <Link href="/dashboard/analytics" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
            Full analytics &rarr;
          </Link>
        </div>
        <div
          className="flex items-end gap-2 h-[100px]"
          role="img"
          aria-label={`Bar chart showing engagement over last 7 days. Total: ${last7Days.reduce((sum, d) => sum + d.readCount, 0)} opened.`}
        >
          {last7Days.map((day, i) => {
            const pct = Math.max(8, Math.round((day.readCount / maxRead) * 100));
            const isToday = i === 6;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-zinc-500 tabular-nums">{day.readCount || ""}</span>
                <div
                  className="w-full rounded-sm transition-all duration-300"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: isToday ? "#B91C1C" : "#E4E4E7",
                  }}
                />
                <span className={`text-[10px] ${isToday ? "font-semibold text-zinc-900" : "text-zinc-400"}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center gap-2">
          <Activity className="h-3 w-3 text-zinc-400" />
          <span className="text-[11px] text-zinc-500">
            {last7Days.reduce((sum, d) => sum + d.readCount, 0).toLocaleString()} total opens this week
          </span>
        </div>
      </div>
    </div>
  );
}
