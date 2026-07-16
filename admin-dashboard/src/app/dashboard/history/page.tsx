"use client";

import { useEffect, useState } from "react";
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

export default function HistoryPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filtered = broadcasts.filter((b) => {
    if (tierFilter !== "all" && b.tier !== tierFilter) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (error) {
    return <div className="text-destructive">Error loading history: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Broadcast History</h2>
        <p className="text-muted-foreground">
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Read</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length > 0 ? (
              filtered.map((broadcast) => {
                const deliveredCount = broadcast.delivery_receipts?.filter(
                  (r) => r.delivered_at !== null
                ).length ?? 0;
                const readCount = broadcast.delivery_receipts?.filter(
                  (r) => r.read_at !== null
                ).length ?? 0;

                return (
                  <TableRow key={broadcast.id} className={broadcast.is_deleted ? "opacity-50" : ""}>
                    <TableCell className="font-medium">
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
                    <TableCell className="capitalize">{broadcast.channel}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {broadcast.sent_at
                        ? new Date(broadcast.sent_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{deliveredCount}</TableCell>
                    <TableCell className="text-sm">{readCount}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No broadcasts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
