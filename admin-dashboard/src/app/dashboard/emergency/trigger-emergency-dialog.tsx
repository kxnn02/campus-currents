"use client";

import { useState, useRef } from "react";
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
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [pin, setPin] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canConfirm = countdown <= 0 && showPinConfirm;

  // Start/stop countdown when pin confirm shows/hides
  function startCountdown() {
    setCountdown(5);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopCountdown() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(5);
  }

  async function handleSubmit(formData: FormData) {
    // Show PIN confirmation step
    setPendingFormData(formData);
    setShowPinConfirm(true);
    setPin("");
    startCountdown();
  }

  async function handleConfirmEmergency() {
    if (!pendingFormData || pin.length < 4) return;
    setLoading(true);
    try {
      // Append PIN to the FormData before sending
      pendingFormData.set("pin", pin);
      await triggerEmergency(pendingFormData);
      toast.success("Emergency alert triggered — all students notified");
      setOpen(false);
      setShowPinConfirm(false);
      setPendingFormData(null);
      setPin("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to trigger emergency";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setShowPinConfirm(false);
    setPendingFormData(null);
    setPin("");
    stopCountdown();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger render={<Button variant="destructive" />}>
        <AlertTriangle className="mr-2 h-4 w-4" />
        Trigger Emergency
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {!showPinConfirm ? (
          <>
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
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive">
                  Continue
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Confirm Emergency Alert
              </DialogTitle>
              <DialogDescription>
                You are about to send an EMERGENCY ALERT. This will override silent mode on ALL student devices.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
                <p className="font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  This action cannot be undone immediately.
                </p>
                <p className="mt-2 text-destructive/80">All students will receive a full-screen emergency overlay with alarm override on their devices.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">Enter your PIN to confirm</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-12"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmEmergency}
                  disabled={!canConfirm || pin.length < 4 || loading}
                  className="min-w-[160px]"
                >
                  {!canConfirm
                    ? `Wait ${countdown}s...`
                    : loading
                    ? "Triggering..."
                    : "Confirm & Send Alert"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
