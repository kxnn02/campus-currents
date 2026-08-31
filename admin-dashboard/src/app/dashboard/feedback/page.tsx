import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageSquare, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FeedbackRow, FEATURE_LABELS, type FeedbackEntry } from "./feedback-row";

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
        <h2 className="text-2xl font-bold tracking-tight text-[zinc-900]">User Feedback</h2>
        <p className="text-[zinc-500] mt-1">
          Responses collected from the in-app feedback form. Click a row to see the full response.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[zinc-200] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-[#5E67C2]" />
            <p className="text-xs font-medium text-[zinc-500] uppercase">Responses</p>
          </div>
          <p className="text-2xl font-bold text-[zinc-900] tabular-nums">{totalResponses}</p>
        </div>
        <div className="rounded-lg border border-[zinc-200] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-[#F59E0B]" />
            <p className="text-xs font-medium text-[zinc-500] uppercase">Avg Rating</p>
          </div>
          <p className="text-2xl font-bold text-[zinc-900] tabular-nums">{avgRating} <span className="text-sm font-normal text-[zinc-500]">/ 5</span></p>
        </div>
        <div className="rounded-lg border border-[zinc-200] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="h-4 w-4 text-[emerald-600]" />
            <p className="text-xs font-medium text-[zinc-500] uppercase">Would Recommend</p>
          </div>
          <p className="text-2xl font-bold text-[emerald-600] tabular-nums">{recommendRate}%</p>
        </div>
        <div className="rounded-lg border border-[zinc-200] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsDown className="h-4 w-4 text-[[#B91C1C]]" />
            <p className="text-xs font-medium text-[zinc-500] uppercase">Top Pain Point</p>
          </div>
          <p className="text-sm font-semibold text-[zinc-900]">
            {topImprove.length > 0 ? FEATURE_LABELS[topImprove[0][0]] ?? topImprove[0][0] : "—"}
          </p>
        </div>
      </div>

      {/* Insights Row */}
      {(topLiked.length > 0 || topImprove.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topLiked.length > 0 && (
            <div className="rounded-lg border border-[zinc-200] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[zinc-900] mb-3">💚 Most Liked</h3>
              <div className="space-y-2">
                {topLiked.map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-[zinc-900]">{FEATURE_LABELS[key] ?? key}</span>
                    <span className="text-xs font-bold text-[zinc-500] bg-[zinc-100] px-2 py-0.5 rounded-full">{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {topImprove.length > 0 && (
            <div className="rounded-lg border border-[zinc-200] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[zinc-900] mb-3">🔧 Needs Work</h3>
              <div className="space-y-2">
                {topImprove.map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-[zinc-900]">{FEATURE_LABELS[key] ?? key}</span>
                    <span className="text-xs font-bold text-[zinc-500] bg-[#FEF2F2] px-2 py-0.5 rounded-full text-[red-600]">{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Table */}
      {entries.length === 0 ? (
        <div className="text-center py-16 text-[zinc-500]">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No feedback yet</p>
          <p className="text-sm mt-1">Responses will appear here once testers submit feedback from the app.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[zinc-200] bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9F9F9]">
                <TableHead className="font-semibold text-[zinc-500]">User</TableHead>
                <TableHead className="font-semibold text-[zinc-500]">Rating</TableHead>
                <TableHead className="font-semibold text-[zinc-500]">Liked</TableHead>
                <TableHead className="font-semibold text-[zinc-500]">Improve</TableHead>
                <TableHead className="font-semibold text-[zinc-500]">Recommend</TableHead>
                <TableHead className="font-semibold text-[zinc-500]">Comment</TableHead>
                <TableHead className="font-semibold text-[zinc-500]">Device</TableHead>
                <TableHead className="font-semibold text-[zinc-500]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <FeedbackRow key={entry.id} entry={entry} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
