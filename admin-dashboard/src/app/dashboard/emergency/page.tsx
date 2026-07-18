import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { TriggerEmergencyDialog } from "./trigger-emergency-dialog";
import { ResolveEmergencyButton } from "./resolve-emergency-button";

export default async function EmergencyPage() {
  const supabase = await createClient();

  const { data: activeEmergencies, error } = await supabase
    .from("active_emergencies")
    .select("*, broadcasts(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const { data: resolvedEmergencies } = await supabase
    .from("active_emergencies")
    .select("*, broadcasts(*)")
    .eq("status", "resolved")
    .order("resolved_at", { ascending: false })
    .limit(10);

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
                    <CardDescription className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-md">
                        {emergency.emergency_type?.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs">
                        Started {new Date(emergency.created_at).toLocaleString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">ACTIVE</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{emergency.broadcasts?.body}</p>
                <ResolveEmergencyButton id={emergency.id} />
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

      {/* Resolved Emergencies */}
      {resolvedEmergencies && resolvedEmergencies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Resolved Emergencies</h3>
          <div className="space-y-3">
            {resolvedEmergencies.map((emergency) => (
              <Card key={emergency.id} className="shadow-sm">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <CardTitle className="text-base">
                        {emergency.broadcasts?.title || "Emergency"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {emergency.emergency_type?.replace(/_/g, " ")} · Resolved{" "}
                        {emergency.resolved_at
                          ? new Date(emergency.resolved_at).toLocaleString()
                          : "—"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Resolved</Badge>
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
