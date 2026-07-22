"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBugStatus } from "./actions";

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "text-red-600" },
  { value: "acknowledged", label: "Acknowledged", color: "text-amber-600" },
  { value: "fixed", label: "Fixed", color: "text-green-600" },
];

export function BugStatusActions({ bugId, currentStatus }: { bugId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: string | null) {
    if (!newStatus || newStatus === currentStatus) return;
    setLoading(true);
    try {
      await updateBugStatus(bugId, newStatus);
      toast.success(`Bug marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleStatusChange} disabled={loading}>
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span className={opt.color}>{opt.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
