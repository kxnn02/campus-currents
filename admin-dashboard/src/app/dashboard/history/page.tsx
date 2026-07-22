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
    case "emergency":
      return "destructive" as const;
    case "important":
      return "default" as const;
    case "routine":
      return "secondary" as const;
    default:
      return "outline" as const;
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

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [tierFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (error) {
    return <div className="text-destructive">Error loading history: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Broadcast History</h2>
        <p className="text-[#444653]">
          View all broadcasts including deleted ones.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={tierFilter} onValueChange={(val) => setTierFilter(val ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="routine">Routine</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#C4C5D5] bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FFF1F1]/50 hover:bg-[#FFF1F1]/50">
              <TableHead className="font-semibold text-[#444653]">Title</TableHead>
              <TableHead className="font-semibold text-[#444653]">Tier</TableHead>
              <TableHead className="font-semibold text-[#444653]">Channel</TableHead>
              <TableHead className="font-semibold text-[#444653]">Sent At</TableHead>
              <TableHead className="font-semibold text-[#444653]">Delivered</TableHead>
              <TableHead className="font-semibold text-[#444653]">Opened</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[#444653]">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((broadcast) => {
                const deliveredCount = broadcast.delivery_receipts?.filter(
                  (r) => r.delivered_at !== null
                ).length ?? 0;
                const readCount = broadcast.delivery_receipts?.filter(
                  (r) => r.read_at !== null
                ).length ?? 0;

                return (
                  <TableRow key={broadcast.id} className={broadcast.is_deleted ? "opacity-50" : ""}>
                    <TableCell className="font-medium text-[#141B2B]">
                      {broadcast.title}
                      {broadcast.is_deleted && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Deleted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTierColor(broadcast.tier)}>
                        {broadcast.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-[#444653]">{broadcast.channel}</TableCell>
                    <TableCell className="text-sm text-[#444653]">
                      {broadcast.sent_at
                        ? new Date(broadcast.sent_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-[#141B2B]">{deliveredCount}</TableCell>
                    <TableCell className="text-sm text-[#141B2B]">{readCount}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[#444653] py-8">
                  No broadcasts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#C4C5D5] px-4 py-3">
            <p className="text-sm text-[#444653]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="rounded-md p-1.5 hover:bg-[#FFF1F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-[#444653]" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={pageNum === page ? "page" : undefined}
                    className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                      pageNum === page
                        ? "bg-[#8D1515] text-white"
                        : "text-[#444653] hover:bg-[#FFF1F1]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="rounded-md p-1.5 hover:bg-[#FFF1F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-[#444653]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
