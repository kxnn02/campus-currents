"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resolveEmergency } from "./actions";

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
      console.error("Failed to resolve emergency:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleResolve} disabled={loading} variant="outline">
      {loading ? "Resolving..." : "Mark as Resolved"}
    </Button>
  );
}
