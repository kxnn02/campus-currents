"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface FeedbackEntry {
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

export const FEATURE_LABELS: Record<string, string> = {
  feed: "📋 Feed",
  status: "🏫 Status",
  calendar: "📅 Calendar",
  emergency: "🚨 Emergency",
  push: "🔔 Push",
  login: "🔑 Login",
  design: "🎨 Design",
  speed: "⚡ Speed",
};

export function FeedbackRow({ entry }: { entry: FeedbackEntry }) {
  const [open, setOpen] = useState(false);

  const name =
    [entry.profiles?.first_name, entry.profiles?.last_name].filter(Boolean).join(" ") ||
    entry.profiles?.email ||
    "—";
  const stars = "★".repeat(entry.rating) + "☆".repeat(5 - entry.rating);
  const device = entry.device_info?.model
    ? `${entry.device_info.brand ?? ""} ${entry.device_info.model}`.trim()
    : "—";
  const shortDate = new Date(entry.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const fullDate = new Date(entry.created_at).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <>
      <TableRow
        onClick={() => setOpen(true)}
        className="cursor-pointer hover:bg-[#F9F9F9] transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-label={`View full feedback from ${name}`}
      >
        <TableCell>
          <div>
            <p className="text-sm font-medium text-[zinc-900]">{name}</p>
            <p className="text-[10px] text-[zinc-500]">{entry.profiles?.program || "Guest"}</p>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-amber-500 text-sm">{stars}</span>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1 max-w-[140px]">
            {entry.liked_features?.map((f) => (
              <span key={f} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                {FEATURE_LABELS[f] ?? f}
              </span>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1 max-w-[140px]">
            {entry.improvement_areas?.map((f) => (
              <span key={f} className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                {FEATURE_LABELS[f] ?? f}
              </span>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <span
            className={`text-xs font-semibold ${
              entry.would_recommend === "yes"
                ? "text-green-600"
                : entry.would_recommend === "no"
                ? "text-red-600"
                : "text-amber-600"
            }`}
          >
            {entry.would_recommend ?? "—"}
          </span>
        </TableCell>
        <TableCell>
          <p className="text-xs text-[zinc-900] max-w-[200px] truncate">{entry.comment || "—"}</p>
        </TableCell>
        <TableCell>
          <p className="text-[10px] text-[zinc-500]">{device}</p>
        </TableCell>
        <TableCell>
          <p className="text-xs text-[zinc-500]">{shortDate}</p>
        </TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>
              {entry.profiles?.program || "Guest"} · {fullDate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-amber-500 text-lg">{stars}</span>
              <span className="text-[zinc-500] tabular-nums">{entry.rating} / 5</span>
              <span
                className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                  entry.would_recommend === "yes"
                    ? "bg-green-50 text-green-700"
                    : entry.would_recommend === "no"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {entry.would_recommend === "yes"
                  ? "Would recommend"
                  : entry.would_recommend === "no"
                  ? "Would not recommend"
                  : entry.would_recommend === "maybe"
                  ? "Might recommend"
                  : "No recommendation"}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-[zinc-500] uppercase mb-1.5">Comment</p>
              <p className="text-[zinc-900] whitespace-pre-wrap break-words leading-relaxed">
                {entry.comment?.trim() || "No comment provided."}
              </p>
            </div>

            {entry.liked_features?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[zinc-500] uppercase mb-1.5">Liked</p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.liked_features.map((f) => (
                    <span key={f} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                      {FEATURE_LABELS[f] ?? f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entry.improvement_areas?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[zinc-500] uppercase mb-1.5">Wants improved</p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.improvement_areas.map((f) => (
                    <span key={f} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">
                      {FEATURE_LABELS[f] ?? f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-[zinc-200]">
              <div>
                <p className="text-xs font-semibold text-[zinc-500] uppercase mb-1">Device</p>
                <p className="text-[zinc-900]">{device}</p>
                {entry.device_info?.os && (
                  <p className="text-xs text-[zinc-500]">
                    {entry.device_info.os} {entry.device_info.osVersion ?? ""}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-[zinc-500] uppercase mb-1">App version</p>
                <p className="text-[zinc-900]">{entry.app_version || "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[zinc-500] uppercase mb-1">Email</p>
              <p className="text-[zinc-900] break-all">{entry.profiles?.email || "—"}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
