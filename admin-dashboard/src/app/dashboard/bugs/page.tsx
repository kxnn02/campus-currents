import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bug, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BugStatusActions } from "./bug-status-actions";

interface BugReport {
  id: string;
  title: string;
  description: string;
  steps_to_reproduce: string | null;
  screen: string | null;
  severity: "critical" | "major" | "minor";
  status: "open" | "acknowledged" | "fixed";
  device_info: { brand?: string; model?: string; os?: string; osVersion?: string | number };
  app_version: string | null;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null; email: string; program: string | null };
}

const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "text-red-600", bg: "bg-red-50", icon: "🔴" },
  major: { label: "Major", color: "text-amber-600", bg: "bg-amber-50", icon: "🟠" },
  minor: { label: "Minor", color: "text-green-600", bg: "bg-green-50", icon: "🟢" },
};

const STATUS_CONFIG = {
  open: { label: "Open", color: "text-red-600", bg: "bg-red-50" },
  acknowledged: { label: "Acknowledged", color: "text-amber-600", bg: "bg-amber-50" },
  fixed: { label: "Fixed", color: "text-green-600", bg: "bg-green-50" },
};

export default async function BugsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bugs, error } = await supabase
    .from("bug_reports")
    .select("*, profiles(first_name, last_name, email, program)")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-500">Error loading bug reports: {error.message}</div>;
  }

  const entries = (bugs ?? []) as unknown as BugReport[];

  // Stats
  const openCount = entries.filter((b) => b.status === "open").length;
  const criticalCount = entries.filter((b) => b.severity === "critical" && b.status !== "fixed").length;
  const fixedCount = entries.filter((b) => b.status === "fixed").length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Bug Reports</h2>
        <p className="text-[#5B403D] mt-1">
          Issues reported by testers from the mobile app.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="h-4 w-4 text-[#AF101A]" />
            <p className="text-xs font-medium text-[#5B403D] uppercase">Total</p>
          </div>
          <p className="text-2xl font-bold text-[#1A1C1C] tabular-nums">{entries.length}</p>
        </div>
        <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[#DC2626]" />
            <p className="text-xs font-medium text-[#5B403D] uppercase">Open</p>
          </div>
          <p className="text-2xl font-bold text-[#DC2626] tabular-nums">{openCount}</p>
        </div>
        <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
            <p className="text-xs font-medium text-[#5B403D] uppercase">Critical Unfixed</p>
          </div>
          <p className="text-2xl font-bold text-[#F59E0B] tabular-nums">{criticalCount}</p>
        </div>
        <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-[#16A34A]" />
            <p className="text-xs font-medium text-[#5B403D] uppercase">Fixed</p>
          </div>
          <p className="text-2xl font-bold text-[#16A34A] tabular-nums">{fixedCount}</p>
        </div>
      </div>

      {/* Bug Reports Table */}
      {entries.length === 0 ? (
        <div className="text-center py-16 text-[#5B403D]">
          <Bug className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No bug reports yet</p>
          <p className="text-sm mt-1">Bug reports will appear here once testers submit them from the app.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E4BEBA] bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9F9F9]">
                <TableHead className="font-semibold text-[#5B403D]">Severity</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Bug</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Screen</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Reporter</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Device</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Status</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((bug) => {
                const sev = SEVERITY_CONFIG[bug.severity];
                const stat = STATUS_CONFIG[bug.status];
                const name = [bug.profiles?.first_name, bug.profiles?.last_name].filter(Boolean).join(" ") || bug.profiles?.email || "—";
                const device = bug.device_info?.model
                  ? `${bug.device_info.brand ?? ""} ${bug.device_info.model}`
                  : "—";
                const date = new Date(bug.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <TableRow key={bug.id} className={bug.severity === "critical" && bug.status === "open" ? "bg-red-50/50" : ""}>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${sev.bg} ${sev.color}`}>
                        {sev.icon} {sev.label}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="text-sm font-medium text-[#1A1C1C] truncate">{bug.title}</p>
                      <p className="text-xs text-[#5B403D] mt-0.5 line-clamp-2">{bug.description}</p>
                      {bug.steps_to_reproduce && (
                        <p className="text-[10px] text-[#5B403D]/70 mt-1 italic">Has repro steps</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#5B403D]">{bug.screen ?? "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-medium text-[#1A1C1C]">{name}</p>
                        <p className="text-[10px] text-[#5B403D]">{bug.profiles?.program || "Guest"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-[10px] text-[#5B403D]">{device}</p>
                      <p className="text-[10px] text-[#5B403D]/60">v{bug.app_version ?? "?"}</p>
                    </TableCell>
                    <TableCell>
                      <BugStatusActions bugId={bug.id} currentStatus={bug.status} />
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-[#5B403D]">{date}</p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
