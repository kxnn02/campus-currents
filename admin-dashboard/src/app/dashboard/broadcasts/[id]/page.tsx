"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Broadcast {
  id: string;
  title: string;
  body: string;
  tier: string;
  channel: string;
  sent_at: string | null;
  is_pinned: boolean;
  target_audience: Record<string, unknown> | null;
}

export default function BroadcastDetailPage() {
  const params = useParams();
  const broadcastId = params.id as string;

  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [safeCount, setSafeCount] = useState(0);
  const [needHelpCount, setNeedHelpCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch broadcast and initial counts
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch broadcast
        const { data: broadcastData, error: broadcastError } = await supabase
          .from("broadcasts")
          .select("*")
          .eq("id", broadcastId)
          .single();

        if (broadcastError) throw broadcastError;
        setBroadcast(broadcastData);

        // Fetch total students
        const { count: studentCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student");

        setTotalStudents(studentCount ?? 0);

        // Fetch delivery counts
        await refreshCounts();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load broadcast";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [broadcastId]);

  async function refreshCounts() {
    // Delivered count
    const { count: delivered } = await supabase
      .from("delivery_receipts")
      .select("*", { count: "exact", head: true })
      .eq("broadcast_id", broadcastId)
      .not("delivered_at", "is", null);

    setDeliveredCount(delivered ?? 0);

    // Read count
    const { count: read } = await supabase
      .from("delivery_receipts")
      .select("*", { count: "exact", head: true })
      .eq("broadcast_id", broadcastId)
      .not("read_at", "is", null);

    setReadCount(read ?? 0);

    // Acknowledgment counts (for emergency tier)
    const { count: safe } = await supabase
      .from("delivery_receipts")
      .select("*", { count: "exact", head: true })
      .eq("broadcast_id", broadcastId)
      .eq("acknowledgment_type", "safe");

    setSafeCount(safe ?? 0);

    const { count: needHelp } = await supabase
      .from("delivery_receipts")
      .select("*", { count: "exact", head: true })
      .eq("broadcast_id", broadcastId)
      .eq("acknowledgment_type", "need_help");

    setNeedHelpCount(needHelp ?? 0);
  }

  // Subscribe to realtime delivery_receipts changes
  useEffect(() => {
    const channel = supabase
      .channel(`delivery_receipts:${broadcastId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_receipts",
          filter: `broadcast_id=eq.${broadcastId}`,
        },
        () => {
          // Refresh counts on any change
          refreshCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [broadcastId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading broadcast details...</div>
      </div>
    );
  }

  if (error || !broadcast) {
    return (
      <div className="text-destructive">
        {error || "Broadcast not found"}
      </div>
    );
  }

  const progressPercent = totalStudents > 0
    ? Math.round((deliveredCount / totalStudents) * 100)
    : 0;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{broadcast.title}</h2>
            <Badge variant={getTierColor(broadcast.tier)}>{broadcast.tier}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Sent {broadcast.sent_at ? new Date(broadcast.sent_at).toLocaleString() : "—"}
          </p>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-semibold text-green-600">LIVE</span>
        </div>
      </div>

      <Link href="/dashboard/broadcasts" className="text-sm text-muted-foreground hover:underline">
        ← Back to Broadcasts
      </Link>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{deliveredCount} of {totalStudents} students</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{deliveredCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opened
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readCount}</div>
          </CardContent>
        </Card>

        {broadcast.tier === "emergency" && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  I&apos;m Safe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{safeCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Need Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{needHelpCount}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
