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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Emergency Management</h2>
          <p className="text-muted-foreground">
            Trigger and manage campus emergencies.
          </p>
        </div>
        <TriggerEmergencyDialog />
      </div>

      {/* Active Emergencies */}
      {activeEmergencies && activeEmergencies.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Emergencies
          </h3>
          {activeEmergencies.map((emergency) => (
            <Card key={emergency.id} className="border-destructive">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {emergency.broadcasts?.title || "Emergency"}
                    </CardTitle>
                    <CardDescription>
                      Type: {emergency.emergency_type?.replace(/_/g, " ")} | Started:{" "}
                      {new Date(emergency.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">ACTIVE</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{emergency.broadcasts?.body}</p>
                <ResolveEmergencyButton id={emergency.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>No active emergencies. The campus is safe.</p>
          </CardContent>
        </Card>
      )}

      {/* Resolved Emergencies */}
      {resolvedEmergencies && resolvedEmergencies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Resolved Emergencies</h3>
          {resolvedEmergencies.map((emergency) => (
            <Card key={emergency.id} className="opacity-70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {emergency.broadcasts?.title || "Emergency"}
                    </CardTitle>
                    <CardDescription>
                      Type: {emergency.emergency_type?.replace(/_/g, " ")} | Resolved:{" "}
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
      )}
    </div>
  );
}
