"use client";

import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFDAD6] mb-4">
        <AlertTriangle className="h-7 w-7 text-[#DC2626]" />
      </div>
      <h2 className="text-lg font-semibold text-[#141B2B] mb-2">Something went wrong</h2>
      <p className="text-sm text-[#444653] max-w-md mb-6">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[#8E0002] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8E0002]/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
