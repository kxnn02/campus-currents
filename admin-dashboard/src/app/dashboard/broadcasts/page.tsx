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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Broadcasts</h2>
          <p className="text-muted-foreground">
            Manage announcements and notifications sent to students.
          </p>
        </div>
        <NewBroadcastDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {broadcasts && broadcasts.length > 0 ? (
              broadcasts.map((broadcast) => (
                <TableRow key={broadcast.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/broadcasts/${broadcast.id}`}
                      className="hover:underline text-primary"
                    >
                      {broadcast.title}
                    </Link>
                    {broadcast.is_pinned && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Pinned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTierColor(broadcast.tier)}>
                      {broadcast.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{broadcast.channel}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
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
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No broadcasts yet. Create your first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
