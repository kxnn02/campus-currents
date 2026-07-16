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

export function NewBroadcastDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audienceType, setAudienceType] = useState("all");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      formData.set("audience_type", audienceType);
      await createBroadcast(formData);
      toast.success("Broadcast sent successfully");
      setOpen(false);
      setAudienceType("all");
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
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" name="body" rows={4} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select name="tier" defaultValue="routine">
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
