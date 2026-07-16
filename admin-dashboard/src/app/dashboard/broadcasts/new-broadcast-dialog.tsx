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
import { Plus } from "lucide-react";
import { createBroadcast } from "./actions";
import { AudienceSelector } from "@/components/audience-selector";

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

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      formData.set("audience_type", audienceType);
      await createBroadcast(formData);
      toast.success("Broadcast sent successfully");
      setOpen(false);
      setAudienceType("all");
      setPreviewTitle("");
      setPreviewBody("");
      setPreviewTier("routine");
    } catch (error) {
      toast.error("Failed to send broadcast");
      console.error("Failed to create broadcast:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Label>Notification Preview</Label>
            <div className="rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm">
              <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                <span>{getTierEmoji(previewTier)}</span>
                <span className="font-semibold">CampusCurrents</span>
              </div>
              <div className="font-semibold text-foreground truncate">
                {previewTitle || "Title"}
              </div>
              <div className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                {previewBody || "Body preview..."}
              </div>
              <div className="text-right text-muted-foreground text-xs mt-1">
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
  );
}
