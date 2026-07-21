import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, User, Clock, ShieldCheck } from "lucide-react";
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
    .select("*, broadcasts(*, sender:profiles!sender_id(first_name, last_name))")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Fetch resolved and false_alarm emergencies
  const { data: pastEmergencies } = await supabase
    .from("active_emergencies")
    .select("*, broadcasts(*, sender:profiles!sender_id(first_name, last_name))")
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

  const hasActive = activeEmergencies && activeEmergencies.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Emergency Management</h2>
          <p className="text-[#5B403D] mt-1">
            Trigger and manage campus-wide emergency alerts.
          </p>
        </div>
        <TriggerEmergencyDialog />
      </div>

      {/* Active Emergencies */}
      {hasActive ? (
        <div className="space-y-4">
          {/* Dramatic section header when emergency is active */}
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#BA1A1A] to-[#AF101A] px-5 py-3.5 shadow-lg shadow-[#BA1A1A]/20 emergency-glow">
            <AlertTriangle className="h-5 w-5 text-white emergency-pulse" />
            <h3 className="text-base font-bold text-white">
              {activeEmergencies.length} Active Emergenc{activeEmergencies.length > 1 ? "ies" : "y"}
            </h3>
            <Badge className="ml-auto bg-white/20 text-white border-white/30 hover:bg-white/30 emergency-pulse text-xs font-bold">
              LIVE
            </Badge>
          </div>

          {activeEmergencies.map((emergency) => (
            <Card key={emergency.id} className="border-2 border-[#BA1A1A]/30 bg-gradient-to-br from-white to-[#FFF8F7] shadow-md shadow-[#BA1A1A]/[0.06] overflow-hidden">
              {/* Red top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-[#BA1A1A] to-[#AF101A]" />
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-lg text-[#1A1C1C]">
                      {emergency.broadcasts?.title || "Emergency"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#BA1A1A]/10 text-[#BA1A1A] px-2.5 py-1 rounded-md uppercase tracking-wide">
                        {emergency.emergency_type?.replace(/_/g, " ")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-[#5B403D]">
                        <User className="h-3 w-3" />
                        {[emergency.broadcasts?.sender?.first_name, emergency.broadcasts?.sender?.last_name].filter(Boolean).join(" ") || "Unknown"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-[#5B403D]">
                        <Clock className="h-3 w-3" />
                        Started: {formatRelativeTime(emergency.created_at)}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className="bg-[#BA1A1A] text-white border-[#BA1A1A] hover:bg-[#BA1A1A] emergency-pulse font-bold shadow-md shadow-[#BA1A1A]/30">
                    ACTIVE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[#5B403D] leading-relaxed">{emergency.broadcasts?.body}</p>
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
        /* Calm state when no emergencies — reassuring, professional */
        <Card className="border border-[#F0DDD9] shadow-sm">
          <CardContent className="py-14 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A]/10 mb-4">
              <ShieldCheck className="h-7 w-7 text-[#16A34A]" />
            </div>
            <p className="text-base font-semibold text-[#1A1C1C]">Campus is safe</p>
            <p className="text-sm text-[#5B403D] mt-1.5 max-w-sm mx-auto">
              No active emergencies at this time. Use the button above to trigger an alert if needed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Past Emergencies */}
      {pastEmergencies && pastEmergencies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-[#1A1C1C]">Recent Past Emergencies</h3>
          <div className="space-y-3">
            {pastEmergencies.map((emergency) => (
              <Card key={emergency.id} className="border border-[#F0DDD9] shadow-sm">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-[#1A1C1C]">
                        {emergency.broadcasts?.title || "Emergency"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap text-xs text-[#5B403D]">
                        <span className="capitalize">{emergency.emergency_type?.replace(/_/g, " ")}</span>
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {[emergency.broadcasts?.sender?.first_name, emergency.broadcasts?.sender?.last_name].filter(Boolean).join(" ") || "Unknown"}
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
                      <Badge className="bg-[#F89C00]/10 text-[#F89C00] border-[#F89C00]/20 hover:bg-[#F89C00]/15 font-semibold">
                        False Alarm
                      </Badge>
                    ) : (
                      <Badge className="bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 hover:bg-[#16A34A]/15 font-semibold">
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
