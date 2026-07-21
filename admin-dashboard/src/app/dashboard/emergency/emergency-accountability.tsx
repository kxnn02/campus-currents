"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ------- Types -------

interface NeedHelpStudent {
  id: string;
  first_name: string;
  last_name: string;
  program: string;
  year_level: number | null;
  section: string | null;
  phone_number: string | null;
}

interface Counters {
  reached: number;
  safe: number;
  needHelp: number;
  noResponse: number;
  notReached: number;
}

interface EmergencyAccountabilityProps {
  broadcastId: string;
  totalStudentsWithTokens: number;
  initialCounters: Counters;
  initialNeedHelpStudents: NeedHelpStudent[];
  startedAt: string;
}

// ------- Component -------

export function EmergencyAccountability({
  broadcastId,
  totalStudentsWithTokens,
  initialCounters,
  initialNeedHelpStudents,
  startedAt,
}: EmergencyAccountabilityProps) {
  const [counters, setCounters] = useState<Counters>(initialCounters);
  const [needHelpStudents, setNeedHelpStudents] = useState<NeedHelpStudent[]>(
    initialNeedHelpStudents
  );
  const [elapsed, setElapsed] = useState("");
  const supabaseRef = useRef(createClient());

  // ------- Elapsed Timer -------
  useEffect(() => {
    function tick() {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      const min = Math.floor(diffSec / 60);
      const sec = diffSec % 60;
      setElapsed(`${min}m ${sec.toString().padStart(2, "0")}s`);
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  // ------- Refetch logic -------
  const refetch = useCallback(async () => {
    const supabase = supabaseRef.current;

    // Fetch all delivery receipts for this broadcast
    const { data: receipts } = await supabase
      .from("delivery_receipts")
      .select("id, student_id, broadcast_id, delivered_at, acknowledged_at, acknowledgment_type")
      .eq("broadcast_id", broadcastId);

    if (receipts) {
      const reached = receipts.filter((r) => r.delivered_at !== null).length;
      const safe = receipts.filter((r) => r.acknowledgment_type === "safe").length;
      const needHelp = receipts.filter((r) => r.acknowledgment_type === "need_help").length;
      const noResponse = reached - safe - needHelp;
      const notReached = receipts.filter((r) => r.delivered_at === null).length;

      setCounters({ reached, safe, needHelp, noResponse, notReached });
    }

    // Fetch need help students
    const { data: helpStudents } = await supabase
      .from("delivery_receipts")
      .select(
        "student_id, profiles!student_id(id, first_name, last_name, program, year_level, section, phone_number)"
      )
      .eq("broadcast_id", broadcastId)
      .eq("acknowledgment_type", "need_help");

    if (helpStudents) {
      const students: NeedHelpStudent[] = helpStudents
        .map((row: Record<string, unknown>) => row.profiles)
        .filter(Boolean) as NeedHelpStudent[];
      setNeedHelpStudents(students);
    }
  }, [broadcastId]);

  // ------- Realtime Subscription -------
  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`accountability-${broadcastId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_receipts",
          filter: `broadcast_id=eq.${broadcastId}`,
        },
        () => {
          // On any change to delivery_receipts for this broadcast, refetch counters
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [broadcastId, refetch]);

  // ------- Progress -------
  const progressDenominator = counters.reached || 1;
  const progressPercent = Math.round(
    ((counters.safe + counters.needHelp) / progressDenominator) * 100
  );

  return (
    <Card className="border-destructive/30 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            📊 Accountability Tracker
          </CardTitle>
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            ⏱ Alert active for {elapsed}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {totalStudentsWithTokens} students with app installed
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <CounterCard emoji="📬" label="Reached" value={counters.reached} />
          <CounterCard emoji="✅" label="Safe" value={counters.safe} color="green" />
          <CounterCard emoji="🆘" label="Need Help" value={counters.needHelp} color="red" />
          <CounterCard emoji="⏳" label="No Response" value={counters.noResponse} color="yellow" />
          <CounterCard emoji="📵" label="Not Reached" value={counters.notReached} color="gray" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Response progress (Safe + Need Help) / Reached</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Need Help Table */}
        {needHelpStudents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              🆘 Students who Need Help ({needHelpStudents.length})
            </h4>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {needHelpStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.first_name} {student.last_name}
                      </TableCell>
                      <TableCell>{student.program || "—"}</TableCell>
                      <TableCell>{student.year_level ?? "—"}</TableCell>
                      <TableCell>{student.section || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {student.phone_number || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ------- Sub-component -------

function CounterCard({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: number;
  color?: "green" | "red" | "yellow" | "gray";
}) {
  const colorClasses: Record<string, string> = {
    green: "text-green-700",
    red: "text-destructive",
    yellow: "text-yellow-600",
    gray: "text-muted-foreground",
  };
  const valueColor = color ? colorClasses[color] : "text-foreground";

  return (
    <div className="flex flex-col items-center rounded-lg border bg-card p-3 text-center">
      <span className="text-lg">{emoji}</span>
      <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
