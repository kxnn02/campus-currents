"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resolveEmergency, resolveAsFalseAlarm } from "./actions";

export function ResolveEmergencyButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleResolve() {
    if (!confirm("Are you sure this emergency has been resolved?")) return;
    setLoading(true);
    try {
      await resolveEmergency(id);
      toast.success("Emergency resolved — ALL CLEAR sent");
    } catch (error) {
      toast.error("Failed to resolve emergency");
    } finally {
      setLoading(false);
    }
  }

  async function handleFalseAlarm() {
    if (!confirm("Mark this as a false alarm? Students will be notified that the alert was cancelled.")) return;
    setLoading(true);
    try {
      await resolveAsFalseAlarm(id);
      toast.success("Emergency cancelled — False alarm notification sent");
    } catch (error) {
      toast.error("Failed to mark as false alarm");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleResolve} disabled={loading} variant="outline">
        {loading ? "Processing..." : "Mark as Resolved"}
      </Button>
      <Button onClick={handleFalseAlarm} disabled={loading} variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
        {loading ? "Processing..." : "False Alarm"}
      </Button>
    </div>
  );
}
