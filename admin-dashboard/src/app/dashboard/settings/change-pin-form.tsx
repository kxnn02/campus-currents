"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePin } from "./actions";

export function ChangePinForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await changePin(formData);
      toast.success("PIN updated successfully");
      // Clear the form
      const form = document.getElementById("pin-form") as HTMLFormElement;
      form?.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update PIN"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="pin-form" action={handleSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="current_pin">Current PIN</Label>
        <Input
          id="current_pin"
          name="current_pin"
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new_pin">New PIN (4-6 digits)</Label>
        <Input
          id="new_pin"
          name="new_pin"
          type="password"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{4,6}"
          placeholder="••••••"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm_pin">Confirm New PIN</Label>
        <Input
          id="confirm_pin"
          name="confirm_pin"
          type="password"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{4,6}"
          placeholder="••••••"
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update PIN"}
      </Button>
    </form>
  );
}
