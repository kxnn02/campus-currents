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
import { Megaphone } from "lucide-react";

export default async function BroadcastsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const role = profile?.role ?? "admin";

  // Faculty sees only their own broadcasts; admins see all
  let query = supabase
    .from("broadcasts")
    .select("*")
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false });

  if (role === "faculty") {
    query = query.eq("sender_id", user!.id);
  }

  const { data: broadcasts, error } = await query;

  if (error) {
    return <div className="text-destructive">Error loading broadcasts: {error.message}</div>;
  }

  function getTierStyle(tier: string) {
    switch (tier) {
      case "emergency":
        return "bg-red-50 text-red-700 border-red-200";
      case "important":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "routine":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
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
          <h2 className="text-lg font-semibold text-zinc-900">Broadcasts</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage announcements and notifications sent to students.
          </p>
        </div>
        <NewBroadcastDialog role={role} />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50 border-b border-zinc-200">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Title</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Tier</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Channel</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Audience</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Sent At</TableHead>
              <TableHead className="w-[100px] text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {broadcasts && broadcasts.length > 0 ? (
              broadcasts.map((broadcast) => (
                <TableRow key={broadcast.id} className="group border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <TableCell className="font-medium py-3">
                    <Link
                      href={`/dashboard/broadcasts/${broadcast.id}`}
                      className="text-zinc-900 hover:text-[#B91C1C] transition-colors font-medium"
                    >
                      {broadcast.title}
                    </Link>
                    {broadcast.is_pinned && (
                      <Badge variant="outline" className="ml-2 text-[10px] border-zinc-300 text-zinc-500">
                        Pinned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge className={`${getTierStyle(broadcast.tier)} text-[10px] font-semibold uppercase tracking-wide border`}>
                      {broadcast.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-sm text-zinc-700 py-3">{broadcast.channel}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-zinc-500 py-3">
                    {formatAudience(broadcast.target_audience)}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500 tabular-nums py-3">
                    {broadcast.sent_at
                      ? new Date(broadcast.sent_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="py-3">
                    <BroadcastActions broadcast={broadcast} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-14">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                      <Megaphone className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">No broadcasts yet</p>
                      <p className="text-xs text-zinc-500 mt-1">Create your first broadcast to reach students.</p>
                    </div>
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
