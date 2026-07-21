"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { liftSuspension } from "./actions";

export function LiftSuspensionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleLift() {
    if (!confirm("Are you sure you want to lift this suspension?")) return;
    setLoading(true);
    try {
      await liftSuspension(id);
      toast.success("Suspension lifted");
    } catch (error) {
      toast.error("Failed to lift suspension");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLift}
      disabled={loading}
    >
      {loading ? "Lifting..." : "Lift"}
    </Button>
  );
}
