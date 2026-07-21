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

  const { data: broadcasts, error } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false });

  if (error) {
    return <div className="text-destructive">Error loading broadcasts: {error.message}</div>;
  }

  function getTierStyle(tier: string) {
    switch (tier) {
      case "emergency":
        return "bg-[#BA1A1A]/10 text-[#BA1A1A] border-[#BA1A1A]/20 hover:bg-[#BA1A1A]/15";
      case "important":
        return "bg-[#F89C00]/10 text-[#92400E] border-[#F89C00]/20 hover:bg-[#F89C00]/15";
      case "routine":
        return "bg-[#5E67C2]/10 text-[#3B41A0] border-[#5E67C2]/20 hover:bg-[#5E67C2]/15";
      default:
        return "bg-[#F0DDD9] text-[#5B403D] border-[#E4BEBA]";
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
          <p className="text-[#5B403D] mt-1">
            Manage announcements and notifications sent to students.
          </p>
        </div>
        <NewBroadcastDialog />
      </div>

      <div className="rounded-xl border border-[#F0DDD9] bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FDF5F3] hover:bg-[#FDF5F3] border-b border-[#F0DDD9]">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Title</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Tier</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Channel</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Audience</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Sent At</TableHead>
              <TableHead className="w-[100px] text-[11px] font-bold uppercase tracking-wider text-[#5B403D]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {broadcasts && broadcasts.length > 0 ? (
              broadcasts.map((broadcast) => (
                <TableRow key={broadcast.id} className="group border-b border-[#F0DDD9] warm-table-row">
                  <TableCell className="font-medium py-3.5">
                    <Link
                      href={`/dashboard/broadcasts/${broadcast.id}`}
                      className="text-[#1A1C1C] hover:text-[#AF101A] transition-colors font-medium"
                    >
                      {broadcast.title}
                    </Link>
                    {broadcast.is_pinned && (
                      <Badge variant="outline" className="ml-2 text-[10px] border-[#E4BEBA] text-[#5B403D]">
                        📌 Pinned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge className={`${getTierStyle(broadcast.tier)} text-[10px] font-bold uppercase tracking-wide border`}>
                      {broadcast.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-sm text-[#1A1C1C] py-3.5">{broadcast.channel}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-[#5B403D] py-3.5">
                    {formatAudience(broadcast.target_audience)}
                  </TableCell>
                  <TableCell className="text-sm text-[#5B403D] tabular-nums py-3.5">
                    {broadcast.sent_at
                      ? new Date(broadcast.sent_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <BroadcastActions broadcast={broadcast} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-14">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[#FDF5F3] flex items-center justify-center">
                      <Megaphone className="h-5 w-5 text-[#E4BEBA]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1C1C]">No broadcasts yet</p>
                      <p className="text-xs text-[#5B403D] mt-1">Create your first broadcast to reach students.</p>
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
