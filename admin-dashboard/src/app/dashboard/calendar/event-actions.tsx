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
import { updateEvent, deleteEvent } from "./actions";
import { AudienceSelector } from "@/components/audience-selector";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  start_date: string;
  end_date: string | null;
  is_all_day: boolean;
  location: string | null;
  organizer_name: string | null;
  target_audience: Record<string, unknown> | null;
}

export function EventActions({ event }: { event: CalendarEvent }) {
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
    getAudienceType(event.target_audience)
  );

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    try {
      formData.set("audience_type", audienceType);
      await updateEvent(event.id, formData);
      toast.success("Event updated");
      setEditOpen(false);
    } catch (error) {
      toast.error("Failed to update event");
      console.error("Failed to update event:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(event.id);
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Failed to delete event");
      console.error("Failed to delete event:", error);
    }
  }

  const defaultPrograms = (event.target_audience?.programs as string[]) || [];
  const defaultYears = (event.target_audience?.year_levels as string[]) || [];

  function formatDateForInput(dateStr: string | null) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().slice(0, 16);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${event.title}`} />}
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
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update this calendar event.</DialogDescription>
          </DialogHeader>
          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={event.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                rows={3}
                defaultValue={event.description || ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select name="category" defaultValue={event.category}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="school_event">School Event</SelectItem>
                  <SelectItem value="org_activity">Org Activity</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start_date">Start Date</Label>
                <Input
                  id="edit-start_date"
                  name="start_date"
                  type="datetime-local"
                  defaultValue={formatDateForInput(event.start_date)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end_date">End Date</Label>
                <Input
                  id="edit-end_date"
                  name="end_date"
                  type="datetime-local"
                  defaultValue={formatDateForInput(event.end_date)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-is_all_day"
                name="is_all_day"
                value="true"
                defaultChecked={event.is_all_day}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="edit-is_all_day">All Day Event</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  name="location"
                  defaultValue={event.location || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-organizer_name">Organizer</Label>
                <Input
                  id="edit-organizer_name"
                  name="organizer_name"
                  defaultValue={event.organizer_name || ""}
                />
              </div>
            </div>
            <AudienceSelector
              audienceType={audienceType}
              onAudienceTypeChange={setAudienceType}
              defaultPrograms={defaultPrograms}
              defaultYears={defaultYears}
            />
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
