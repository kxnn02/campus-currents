import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Get recent broadcasts with delivery stats
  const { data: broadcasts, error: broadcastError } = await supabase
    .from("broadcasts")
    .select("id, title, tier, channel, sent_at")
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false })
    .limit(20);

  if (broadcastError) {
    return <div className="text-destructive">Error loading analytics: {broadcastError.message}</div>;
  }

  // Get delivery receipts only for the displayed broadcasts
  const broadcastIds = broadcasts?.map((b) => b.id) ?? [];
  const { data: receipts } = broadcastIds.length > 0
    ? await supabase
        .from("delivery_receipts")
        .select("broadcast_id, delivered_at, read_at, acknowledged_at")
        .in("broadcast_id", broadcastIds)
    : { data: [] };

  // Aggregate stats per broadcast
  const statsMap: Record<string, { delivered: number; read: number; acknowledged: number }> = {};

  if (receipts) {
    for (const receipt of receipts) {
      if (!receipt.broadcast_id) continue;
      if (!statsMap[receipt.broadcast_id]) {
        statsMap[receipt.broadcast_id] = { delivered: 0, read: 0, acknowledged: 0 };
      }
      if (receipt.delivered_at) statsMap[receipt.broadcast_id].delivered++;
      if (receipt.read_at) statsMap[receipt.broadcast_id].read++;
      if (receipt.acknowledged_at) statsMap[receipt.broadcast_id].acknowledged++;
    }
  }

  // Get students who can receive push notifications (honest denominator)
  const { count: totalStudents } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .not("fcm_token", "is", null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Broadcast delivery and engagement metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reachable Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents ?? 0}</div>
            <CardDescription>Students with push notifications enabled</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receipts?.length ?? 0}</div>
            <CardDescription>Total delivery receipts tracked</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{broadcasts?.length ?? 0}</div>
            <CardDescription>Broadcasts shown below</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broadcast</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="text-center">Delivered</TableHead>
              <TableHead className="text-center">Read</TableHead>
              <TableHead className="text-center">Acknowledged</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {broadcasts && broadcasts.length > 0 ? (
              broadcasts.map((broadcast) => {
                const stats = statsMap[broadcast.id] || {
                  delivered: 0,
                  read: 0,
                  acknowledged: 0,
                };
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
                    <TableCell className="text-center">{stats.delivered}</TableCell>
                    <TableCell className="text-center">{stats.read}</TableCell>
                    <TableCell className="text-center">{stats.acknowledged}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No broadcast data available yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
