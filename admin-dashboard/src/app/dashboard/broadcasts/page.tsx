import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BroadcastActions } from "./broadcast-actions";
import { NewBroadcastDialog } from "./new-broadcast-dialog";

export default async function BroadcastsPage() {
  const supabase = await createClient();

  const { data: broadcasts, error } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false });

  if (error) {
    return <div className="text-destructive">Error loading broadcasts: {error.message}</div>;
  }

  function getTierColor(tier: string) {
    switch (tier) {
      case "emergency":
        return "destructive";
      case "important":
        return "default";
      case "routine":
        return "secondary";
      default:
        return "outline";
    }
  }

  function formatAudience(target: Record<string, unknown> | null) {
    if (!target) return "All Students";
    if (target.all) return "All Students";
    const parts: string[] = [];
    if (target.programs && Array.isArray(target.programs)) {
      parts.push(`Programs: ${(target.programs as string[]).join(", ")}`);
    }
    if (target.year_levels && Array.isArray(target.year_levels)) {
      parts.push(`Years: ${(target.year_levels as string[]).join(", ")}`);
    }
    return parts.length > 0 ? parts.join(" | ") : "All Students";
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Broadcasts</h2>
          <p className="text-[#444653] mt-1">
            Manage announcements and notifications sent to students.
          </p>
        </div>
        <NewBroadcastDialog />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Tier</TableHead>
              <TableHead className="font-semibold">Channel</TableHead>
              <TableHead className="font-semibold">Audience</TableHead>
              <TableHead className="font-semibold">Sent At</TableHead>
              <TableHead className="w-[100px] font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {broadcasts && broadcasts.length > 0 ? (
              broadcasts.map((broadcast) => (
                <TableRow key={broadcast.id} className="group">
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/broadcasts/${broadcast.id}`}
                      className="hover:underline text-primary group-hover:text-primary/80 transition-colors"
                    >
                      {broadcast.title}
                    </Link>
                    {broadcast.is_pinned && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        📌 Pinned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTierColor(broadcast.tier)}>
                      {broadcast.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{broadcast.channel}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {formatAudience(broadcast.target_audience)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {broadcast.sent_at
                      ? new Date(broadcast.sent_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <BroadcastActions broadcast={broadcast} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg">📢</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">No broadcasts yet</p>
                    <p className="text-xs text-muted-foreground">Create your first broadcast to reach students.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
