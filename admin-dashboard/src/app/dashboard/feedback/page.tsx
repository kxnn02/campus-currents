import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageSquare, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FeedbackEntry {
  id: string;
  rating: number;
  liked_features: string[];
  improvement_areas: string[];
  comment: string | null;
  would_recommend: "yes" | "no" | "maybe" | null;
  device_info: { brand?: string; model?: string; os?: string; osVersion?: string | number };
  app_version: string | null;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null; program: string | null; email: string };
}

const FEATURE_LABELS: Record<string, string> = {
  feed: "📋 Feed",
  status: "🏫 Status",
  calendar: "📅 Calendar",
  emergency: "🚨 Emergency",
  push: "🔔 Push",
  login: "🔑 Login",
  design: "🎨 Design",
  speed: "⚡ Speed",
};

export default async function FeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all feedback with profile info
  const { data: feedback, error } = await supabase
    .from("feedback")
    .select("*, profiles(first_name, last_name, program, email)")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-500">Error loading feedback: {error.message}</div>;
  }

  const entries = (feedback ?? []) as unknown as FeedbackEntry[];

  // Compute stats
  const totalResponses = entries.length;
  const avgRating = totalResponses > 0
    ? (entries.reduce((sum, e) => sum + e.rating, 0) / totalResponses).toFixed(1)
    : "0.0";
  const recommendYes = entries.filter((e) => e.would_recommend === "yes").length;
  const recommendRate = totalResponses > 0
    ? Math.round((recommendYes / totalResponses) * 100)
    : 0;

  // Most liked features
  const likedCounts: Record<string, number> = {};
  entries.forEach((e) => e.liked_features?.forEach((f) => { likedCounts[f] = (likedCounts[f] ?? 0) + 1; }));
  const topLiked = Object.entries(likedCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Most improvement areas
  const improveCounts: Record<string, number> = {};
  entries.forEach((e) => e.improvement_areas?.forEach((f) => { improveCounts[f] = (improveCounts[f] ?? 0) + 1; }));
  const topImprove = Object.entries(improveCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">User Feedback</h2>
        <p className="text-[#5B403D] mt-1">
          Responses collected from the in-app feedback form.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-[#5E67C2]" />
            <p className="text-xs font-medium text-[#5B403D] uppercase">Responses</p>
          </div>
          <p className="text-2xl font-bold text-[#1A1C1C] tabular-nums">{totalResponses}</p>
        </div>
        <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-[#F59E0B]" />
            <p className="text-xs font-medium text-[#5B403D] uppercase">Avg Rating</p>
          </div>
          <p className="text-2xl font-bold text-[#1A1C1C] tabular-nums">{avgRating} <span className="text-sm font-normal text-[#5B403D]">/ 5</span></p>
        </div>
        <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="h-4 w-4 text-[#16A34A]" />
            <p className="text-xs font-medium text-[#5B403D] uppercase">Would Recommend</p>
          </div>
          <p className="text-2xl font-bold text-[#16A34A] tabular-nums">{recommendRate}%</p>
        </div>
        <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsDown className="h-4 w-4 text-[#AF101A]" />
            <p className="text-xs font-medium text-[#5B403D] uppercase">Top Pain Point</p>
          </div>
          <p className="text-sm font-semibold text-[#1A1C1C]">
            {topImprove.length > 0 ? FEATURE_LABELS[topImprove[0][0]] ?? topImprove[0][0] : "—"}
          </p>
        </div>
      </div>

      {/* Insights Row */}
      {(topLiked.length > 0 || topImprove.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topLiked.length > 0 && (
            <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1A1C1C] mb-3">💚 Most Liked</h3>
              <div className="space-y-2">
                {topLiked.map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-[#1A1C1C]">{FEATURE_LABELS[key] ?? key}</span>
                    <span className="text-xs font-bold text-[#5B403D] bg-[#F0DDD9] px-2 py-0.5 rounded-full">{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {topImprove.length > 0 && (
            <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1A1C1C] mb-3">🔧 Needs Work</h3>
              <div className="space-y-2">
                {topImprove.map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-[#1A1C1C]">{FEATURE_LABELS[key] ?? key}</span>
                    <span className="text-xs font-bold text-[#5B403D] bg-[#FEF2F2] px-2 py-0.5 rounded-full text-[#DC2626]">{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Table */}
      {entries.length === 0 ? (
        <div className="text-center py-16 text-[#5B403D]">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No feedback yet</p>
          <p className="text-sm mt-1">Responses will appear here once testers submit feedback from the app.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E4BEBA] bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9F9F9]">
                <TableHead className="font-semibold text-[#5B403D]">User</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Rating</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Liked</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Improve</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Recommend</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Comment</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Device</TableHead>
                <TableHead className="font-semibold text-[#5B403D]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const name = [entry.profiles?.first_name, entry.profiles?.last_name].filter(Boolean).join(" ") || entry.profiles?.email || "—";
                const stars = "★".repeat(entry.rating) + "☆".repeat(5 - entry.rating);
                const device = entry.device_info?.model
                  ? `${entry.device_info.brand ?? ""} ${entry.device_info.model}`
                  : "—";
                const date = new Date(entry.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-[#1A1C1C]">{name}</p>
                        <p className="text-[10px] text-[#5B403D]">{entry.profiles?.program || "Guest"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-amber-500 text-sm">{stars}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {entry.liked_features?.map((f) => (
                          <span key={f} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{FEATURE_LABELS[f] ?? f}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {entry.improvement_areas?.map((f) => (
                          <span key={f} className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{FEATURE_LABELS[f] ?? f}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold ${
                        entry.would_recommend === "yes" ? "text-green-600" :
                        entry.would_recommend === "no" ? "text-red-600" : "text-amber-600"
                      }`}>
                        {entry.would_recommend ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-[#1A1C1C] max-w-[200px] truncate" title={entry.comment ?? ""}>
                        {entry.comment || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[10px] text-[#5B403D]">{device}</p>
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
