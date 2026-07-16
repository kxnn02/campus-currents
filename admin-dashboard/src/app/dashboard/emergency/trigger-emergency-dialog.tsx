"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { triggerEmergency } from "./actions";

export function TriggerEmergencyDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await triggerEmergency(formData);
      toast.success("Emergency alert triggered — all students notified");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to trigger emergency");
      console.error("Failed to trigger emergency:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>
        <AlertTriangle className="mr-2 h-4 w-4" />
        Trigger Emergency
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-destructive">Trigger Emergency Alert</DialogTitle>
          <DialogDescription>
            This will send an emergency broadcast to ALL students immediately.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Emergency Type</Label>
            <Select name="emergency_type" defaultValue="active_threat">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active_threat">Active Threat</SelectItem>
                <SelectItem value="fire">Fire</SelectItem>
                <SelectItem value="earthquake">Earthquake</SelectItem>
                <SelectItem value="flooding">Flooding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency-title">Title</Label>
            <Input
              id="emergency-title"
              name="title"
              placeholder="e.g., EARTHQUAKE ALERT"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              name="instructions"
              placeholder="Instructions for students..."
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Triggering..." : "Trigger Emergency"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
