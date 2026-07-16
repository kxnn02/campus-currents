import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, CloudOff, CalendarDays, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: broadcastCount },
    { count: suspensionCount },
    { count: eventCount },
    { count: emergencyCount },
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
  ]);

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
    </div>
  );
}
