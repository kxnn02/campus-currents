import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Megaphone, CloudOff, CalendarDays, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: broadcastCount },
    { count: suspensionCount },
    { count: eventCount },
    { count: emergencyCount },
    { count: studentCount },
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
      .eq("role", "student"),
  ]);

  // Fetch recent broadcasts with delivery stats
  const { data: recentBroadcasts } = await supabase
    .from("broadcasts")
    .select("id, title, tier, channel, sent_at, is_pinned")
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false })
    .limit(5);

  // Get delivery receipt counts per broadcast
  const broadcastIds = recentBroadcasts?.map((b) => b.id) ?? [];
  const { data: receipts } = broadcastIds.length > 0
    ? await supabase
        .from("delivery_receipts")
        .select("broadcast_id, delivered_at, read_at")
        .in("broadcast_id", broadcastIds)
    : { data: [] };

  // Aggregate delivery stats
  const statsMap: Record<string, { delivered: number; read: number }> = {};
  if (receipts) {
    for (const r of receipts) {
      if (!statsMap[r.broadcast_id]) statsMap[r.broadcast_id] = { delivered: 0, read: 0 };
      if (r.delivered_at) statsMap[r.broadcast_id].delivered++;
      if (r.read_at) statsMap[r.broadcast_id].read++;
    }
  }

  const stats = [
    {
      title: "Total Broadcasts",
      value: broadcastCount ?? 0,
      icon: Megaphone,
      description: "All time broadcasts sent",
    },
    {
      title: "Active Suspensions",
      value: suspensionCount ?? 0,
      icon: CloudOff,
      description: "Currently active suspensions",
    },
    {
      title: "Upcoming Events",
      value: eventCount ?? 0,
      icon: CalendarDays,
      description: "Active calendar events",
    },
    {
      title: "Active Emergencies",
      value: emergencyCount ?? 0,
      icon: AlertTriangle,
      description: "Unresolved emergencies",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of Campus Currents communication system.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/broadcasts" className="block">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6 text-center">
              <Megaphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-blue-900">New Broadcast</p>
              <p className="text-xs text-blue-700/70 mt-1">Send announcement to students</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/suspensions" className="block">
          <Card className="hover:border-red-300 transition-colors cursor-pointer border-red-200 bg-red-50/50">
            <CardContent className="pt-6 text-center">
              <CloudOff className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="font-semibold text-red-900">Post Suspension</p>
              <p className="text-xs text-red-700/70 mt-1">Declare class suspension</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/calendar" className="block">
          <Card className="hover:border-green-300 transition-colors cursor-pointer border-green-200 bg-green-50/50">
            <CardContent className="pt-6 text-center">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold text-green-900">New Event</p>
              <p className="text-xs text-green-700/70 mt-1">Add to school calendar</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Broadcasts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Broadcasts</CardTitle>
            <span className="text-xs text-muted-foreground">
              {studentCount ?? 0} registered students
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-center">Delivered</TableHead>
                <TableHead className="text-center">Read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBroadcasts && recentBroadcasts.length > 0 ? (
                recentBroadcasts.map((broadcast) => {
                  const bStats = statsMap[broadcast.id] || { delivered: 0, read: 0 };
                  return (
                    <TableRow key={broadcast.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {broadcast.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            broadcast.tier === "emergency"
                              ? "destructive"
                              : broadcast.tier === "important"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {broadcast.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {broadcast.sent_at
                          ? new Date(broadcast.sent_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-center">{bStats.delivered}</TableCell>
                      <TableCell className="text-center">{bStats.read}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No broadcasts sent yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
