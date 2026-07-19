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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { updateBroadcast, deleteBroadcast } from "./actions";
import { AudienceSelector } from "@/components/audience-selector";

interface Broadcast {
  id: string;
  title: string;
  body: string;
  tier: string;
  channel: string;
  is_pinned: boolean;
  target_audience: Record<string, unknown> | null;
}

export function BroadcastActions({ broadcast }: { broadcast: Broadcast }) {
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function getAudienceType(target: Record<string, unknown> | null) {
    if (!target || target.all) return "all";
    if (target.programs && target.year_levels) return "by_program_year";
    if (target.programs) return "by_program";
    if (target.year_levels) return "by_year";
    return "all";
  }

  const [audienceType, setAudienceType] = useState(
    getAudienceType(broadcast.target_audience)
  );

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    try {
      formData.set("audience_type", audienceType);
      await updateBroadcast(broadcast.id, formData);
      toast.success("Broadcast updated");
      setEditOpen(false);
    } catch (error) {
      toast.error("Failed to update broadcast");
      console.error("Failed to update broadcast:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this broadcast?")) return;
    try {
      await deleteBroadcast(broadcast.id);
      toast.success("Broadcast deleted");
    } catch (error) {
      toast.error("Failed to delete broadcast");
      console.error("Failed to delete broadcast:", error);
    }
  }

  const defaultPrograms = (broadcast.target_audience?.programs as string[]) || [];
  const defaultYears = (broadcast.target_audience?.year_levels as string[]) || [];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${broadcast.title}`} />}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Broadcast</DialogTitle>
            <DialogDescription>Update this broadcast.</DialogDescription>
          </DialogHeader>
          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={broadcast.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-body">Body</Label>
              <Textarea
                id="edit-body"
                name="body"
                rows={4}
                defaultValue={broadcast.body}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select name="tier" defaultValue={broadcast.tier}>
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
                <Select name="channel" defaultValue={broadcast.channel}>
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
              defaultPrograms={defaultPrograms}
              defaultYears={defaultYears}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-is_pinned"
                name="is_pinned"
                value="true"
                defaultChecked={broadcast.is_pinned}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="edit-is_pinned">Pin this broadcast</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
