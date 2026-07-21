import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, User, Clock } from "lucide-react";
import { TriggerEmergencyDialog } from "./trigger-emergency-dialog";
import { ResolveEmergencyButton } from "./resolve-emergency-button";
import { EmergencyAccountability } from "./emergency-accountability";

function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function EmergencyPage() {
  const supabase = await createClient();

  // Fetch active emergencies with broadcast and sender profile
  const { data: activeEmergencies, error } = await supabase
    .from("active_emergencies")
    .select("*, broadcasts(*, sender:profiles!sender_id(full_name))")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Fetch resolved and false_alarm emergencies
  const { data: pastEmergencies } = await supabase
    .from("active_emergencies")
    .select("*, broadcasts(*, sender:profiles!sender_id(full_name))")
    .in("status", ["resolved", "false_alarm"])
    .order("resolved_at", { ascending: false })
    .limit(10);

  // Accountability data for each active emergency
  const accountabilityMap: Record<string, {
    counters: { reached: number; safe: number; needHelp: number; noResponse: number; notReached: number };
    needHelpStudents: Array<{ id: string; first_name: string; last_name: string; program: string; year_level: number | null; section: string | null; phone_number: string | null }>;
    totalStudentsWithTokens: number;
  }> = {};

  if (activeEmergencies && activeEmergencies.length > 0) {
    // Count students with push tokens (denominator)
    const { count: tokenCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("fcm_token", "is", null)
      .eq("role", "student");

    const totalStudentsWithTokens = tokenCount ?? 0;

    for (const emergency of activeEmergencies) {
      const broadcastId = emergency.broadcast_id;

      // Fetch delivery receipts for this broadcast
      const { data: receipts } = await supabase
        .from("delivery_receipts")
        .select("id, student_id, delivered_at, acknowledged_at, acknowledgment_type")
        .eq("broadcast_id", broadcastId);

      const allReceipts = receipts ?? [];
      const reached = allReceipts.filter((r) => r.delivered_at !== null).length;
      const safe = allReceipts.filter((r) => r.acknowledgment_type === "safe").length;
      const needHelp = allReceipts.filter((r) => r.acknowledgment_type === "need_help").length;
      const noResponse = reached - safe - needHelp;
      const notReached = allReceipts.filter((r) => r.delivered_at === null).length;

      // Fetch need_help student profiles
      const { data: helpStudents } = await supabase
        .from("delivery_receipts")
        .select(
          "student_id, profiles!student_id(id, first_name, last_name, program, year_level, section, phone_number)"
        )
        .eq("broadcast_id", broadcastId)
        .eq("acknowledgment_type", "need_help");

      const needHelpStudents = (helpStudents ?? [])
        .map((row: Record<string, unknown>) => row.profiles)
        .filter(Boolean) as { id: string; first_name: string; last_name: string; program: string; year_level: number | null; section: string | null; phone_number: string | null; }[];

      accountabilityMap[broadcastId] = {
        counters: { reached, safe, needHelp, noResponse, notReached },
        needHelpStudents,
        totalStudentsWithTokens,
      };
    }
  }

  if (error) {
    return <div className="text-destructive">Error loading emergencies: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Emergency Management</h2>
          <p className="text-[#444653] mt-1">
            Trigger and manage campus-wide emergency alerts.
          </p>
        </div>
        <TriggerEmergencyDialog />
      </div>

      {/* Active Emergencies */}
      {activeEmergencies && activeEmergencies.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            Active Emergencies
          </h3>
          {activeEmergencies.map((emergency) => (
            <Card key={emergency.id} className="border-destructive/50 bg-destructive/[0.03] shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {emergency.broadcasts?.title || "Emergency"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-md">
                        {emergency.emergency_type?.replace(/_/g, " ")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        Triggered by: {emergency.broadcasts?.sender?.full_name || "Unknown"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Started: {formatRelativeTime(emergency.created_at)}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">ACTIVE</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{emergency.broadcasts?.body}</p>
                <ResolveEmergencyButton id={emergency.id} />
                {accountabilityMap[emergency.broadcast_id] && (
                  <EmergencyAccountability
                    broadcastId={emergency.broadcast_id}
                    totalStudentsWithTokens={accountabilityMap[emergency.broadcast_id].totalStudentsWithTokens}
                    initialCounters={accountabilityMap[emergency.broadcast_id].counters}
                    initialNeedHelpStudents={accountabilityMap[emergency.broadcast_id].needHelpStudents}
                    startedAt={emergency.created_at}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 mb-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-foreground">Campus is safe</p>
            <p className="text-xs text-muted-foreground mt-1">No active emergencies at this time.</p>
          </CardContent>
        </Card>
      )}

      {/* Past Emergencies (Resolved + False Alarm) */}
      {pastEmergencies && pastEmergencies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Past Emergencies</h3>
          <div className="space-y-3">
            {pastEmergencies.map((emergency) => (
              <Card key={emergency.id} className="shadow-sm">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {emergency.broadcasts?.title || "Emergency"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap text-xs">
                        <span>{emergency.emergency_type?.replace(/_/g, " ")}</span>
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {emergency.broadcasts?.sender?.full_name || "Unknown"}
                        </span>
                        <span>·</span>
                        <span>
                          {emergency.status === "resolved" ? "Resolved" : "Cancelled"}{" "}
                          {emergency.resolved_at
                            ? formatRelativeTime(emergency.resolved_at)
                            : "—"}
                        </span>
                      </CardDescription>
                    </div>
                    {emergency.status === "false_alarm" ? (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                        False Alarm
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
