"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BroadcastRecord {
  id: string;
  title: string;
  tier: string;
  channel: string;
  sent_at: string | null;
  is_deleted: boolean;
  delivery_receipts: { delivered_at: string | null; read_at: string | null }[];
}

function getTierColor(tier: string) {
  switch (tier) {
    case "emergency": return "destructive" as const;
    case "important": return "default" as const;
    case "routine": return "secondary" as const;
    default: return "outline" as const;
  }
}

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchBroadcasts() {
      setLoading(true);
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("broadcasts")
        .select("id, title, tier, channel, sent_at, is_deleted, delivery_receipts(delivered_at, read_at)")
        .order("sent_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setBroadcasts((data as unknown as BroadcastRecord[]) ?? []);
      }
      setLoading(false);
    }
    fetchBroadcasts();
  }, []);

  const filtered = useMemo(() => {
    return broadcasts.filter((b) => {
      if (tierFilter !== "all" && b.tier !== tierFilter) return false;
      if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [broadcasts, tierFilter, searchQuery]);

  useEffect(() => { setPage(1); }, [tierFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (error) {
    return <div className="text-destructive">Error loading history: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Broadcast History</h2>
        <p className="text-sm text-zinc-500 mt-0.5">All broadcasts including deleted ones.</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={tierFilter} onValueChange={(val) => setTierFilter(val ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="routine">Routine</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Title</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Tier</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Channel</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Sent</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Delivered</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Opened</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">Loading...</TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((broadcast) => {
                const deliveredCount = broadcast.delivery_receipts?.filter((r) => r.delivered_at !== null).length ?? 0;
                const readCount = broadcast.delivery_receipts?.filter((r) => r.read_at !== null).length ?? 0;

                return (
                  <TableRow key={broadcast.id} className={`hover:bg-zinc-50 transition-colors ${broadcast.is_deleted ? "opacity-50" : ""}`}>
                    <TableCell className="font-medium text-zinc-900">
                      {broadcast.title}
                      {broadcast.is_deleted && (
                        <Badge variant="outline" className="ml-2 text-[10px]">Deleted</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTierColor(broadcast.tier)}>{broadcast.tier}</Badge>
                    </TableCell>
                    <TableCell className="capitalize text-zinc-500">{broadcast.channel}</TableCell>
                    <TableCell className="text-sm text-zinc-500 tabular-nums">
                      {broadcast.sent_at ? new Date(broadcast.sent_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-700 tabular-nums">{deliveredCount}</TableCell>
                    <TableCell className="text-sm text-zinc-700 tabular-nums">{readCount}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500 py-8">No broadcasts found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
            <p className="text-xs text-zinc-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="rounded-md p-1.5 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="h-4 w-4 text-zinc-500" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)} aria-label={`Page ${pageNum}`} aria-current={pageNum === page ? "page" : undefined} className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${pageNum === page ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page" className="rounded-md p-1.5 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
