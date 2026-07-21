"use client";

import { useState, useEffect } from "react";
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
import { Plus, AlertTriangle } from "lucide-react";
import { createBroadcast } from "./actions";
import { AudienceSelector } from "@/components/audience-selector";
import { createClient } from "@/lib/supabase/client";

function getTierEmoji(tier: string) {
  switch (tier) {
    case "emergency":
      return "🔴";
    case "important":
      return "🟡";
    case "routine":
      return "🔵";
    default:
      return "🔵";
  }
}

export function NewBroadcastDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audienceType, setAudienceType] = useState("all");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewBody, setPreviewBody] = useState("");
  const [previewTier, setPreviewTier] = useState("routine");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [reachableCount, setReachableCount] = useState<number | null>(null);

  // Fetch reachable student count (students with push token)
  useEffect(() => {
    async function fetchReachableCount() {
      const supabase = createClient();
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student")
        .not("fcm_token", "is", null);
      setReachableCount(count ?? 0);
    }
    if (open) {
      fetchReachableCount();
    }
  }, [open]);

  async function handleSubmit(formData: FormData) {
    // Validate form first, then show confirmation
    const title = formData.get("title");
    const body = formData.get("body");
    if (!title || !body) {
      toast.error("Please fill in all required fields");
      return;
    }
    formData.set("audience_type", audienceType);
    setPendingFormData(formData);
    setShowConfirmation(true);
  }

  async function handleConfirmSend() {
    if (!pendingFormData) return;
    setLoading(true);
    try {
      await createBroadcast(pendingFormData);
      toast.success("Broadcast sent successfully");
      setOpen(false);
      setShowConfirmation(false);
      setPendingFormData(null);
      setAudienceType("all");
      setPreviewTitle("");
      setPreviewBody("");
      setPreviewTier("routine");
    } catch (error) {
      toast.error("Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  }

  function handleCancelConfirmation() {
    setShowConfirmation(false);
    setPendingFormData(null);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setShowConfirmation(false);
          setPendingFormData(null);
        }
      }}>
        <DialogTrigger render={<Button />}>
          <Plus className="mr-2 h-4 w-4" />
          New Broadcast
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Broadcast</DialogTitle>
            <DialogDescription>
              Send a new announcement to students.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                value={previewTitle}
                onChange={(e) => setPreviewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                name="body"
                rows={4}
                required
                value={previewBody}
                onChange={(e) => setPreviewBody(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select
                  name="tier"
                  defaultValue="routine"
                  onValueChange={(value) => setPreviewTier(value ?? "routine")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select name="channel" defaultValue="general">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="suspension">Suspension</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AudienceSelector
              audienceType={audienceType}
              onAudienceTypeChange={setAudienceType}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_pinned"
                name="is_pinned"
                value="true"
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="is_pinned">Pin this broadcast</Label>
            </div>

            {/* Push Notification Preview */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Notification Preview</Label>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1.5">
                  <span className="text-base">{getTierEmoji(previewTier)}</span>
                  <span className="font-semibold text-foreground">CampusCurrents</span>
                  {previewTier !== "routine" && (
                    <span className="uppercase font-bold text-[10px]">• {previewTier}</span>
                  )}
                </div>
                <div className="font-semibold text-foreground truncate text-sm">
                  {previewTitle || "Announcement title"}
                </div>
                <div className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                  {previewBody || "Message body preview..."}
                </div>
                <div className="text-right text-muted-foreground/60 text-[10px] mt-2">
                  Just now
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Broadcast"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={(isOpen) => {
        if (!isOpen) handleCancelConfirmation();
      }}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
              Confirm Broadcast
            </DialogTitle>
            <DialogDescription>
              You are about to send a push notification to students.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-[#C4C5D5] bg-[#FFF1F1] p-4 space-y-2">
            <p className="text-sm font-semibold text-[#141B2B]">
              &ldquo;{previewTitle}&rdquo;
            </p>
            <p className="text-sm text-[#444653]">
              This will notify approximately{" "}
              <span className="font-bold text-[#141B2B]">
                {reachableCount !== null ? reachableCount.toLocaleString() : "..."}
              </span>{" "}
              students{audienceType !== "all" ? " (filtered by audience criteria)" : ""}.
            </p>
          </div>
          <p className="text-xs text-[#444653]">
            This action cannot be undone. The broadcast will be delivered immediately via push notification.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelConfirmation}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSend}
              disabled={loading}
              className="bg-[#8E0002] hover:bg-[#6D0002] text-white"
            >
              {loading ? "Sending..." : "Confirm & Send"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
