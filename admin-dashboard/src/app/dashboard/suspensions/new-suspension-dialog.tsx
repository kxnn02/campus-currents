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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createSuspension } from "./actions";

const PROGRAMS = [
  "BSIT", "BSBA", "BSA", "BSED", "BEED", "AB_PSYCH", "AB_COMM", "JD", "ETEEAP", "STEM", "ABM", "HUMSS", "GAS", "TVL", "OTHER",
];

const TEMPLATES = [
  { label: "Manila LGU", source: "manila_lgu", reason: "lgu_order" },
  { label: "PAGASA Weather", source: "pagasa", reason: "weather_typhoon" },
  { label: "DepEd Order", source: "deped", reason: "lgu_order" },
  { label: "School Decision", source: "school_admin", reason: "other" },
] as const;

export function NewSuspensionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState("all_levels");
  const [source, setSource] = useState("school_admin");
  const [reason, setReason] = useState("weather_typhoon");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      formData.set("scope", scope);
      formData.set("source", source);
      formData.set("reason", reason);
      await createSuspension(formData);
      toast.success("Suspension declared and students notified");
      setOpen(false);
      setScope("all_levels");
      setSource("school_admin");
      setReason("weather_typhoon");
    } catch (error) {
      toast.error("Failed to declare suspension");
      console.error("Failed to create suspension:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Declare Suspension
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Declare Class Suspension</DialogTitle>
          <DialogDescription>
            This will also create a broadcast notification for all students.
          </DialogDescription>
        </DialogHeader>

        {/* Template Cards */}
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((template) => {
            const isSelected = source === template.source && reason === template.reason;
            const icons: Record<string, string> = {
              "Manila LGU": "🏛️",
              "PAGASA Weather": "🌧️",
              "DepEd Order": "📋",
              "School Decision": "🏫",
            };
            return (
              <button
                key={template.label}
                type="button"
                className={`rounded-xl border-2 p-4 text-left text-sm font-medium transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40"
                }`}
                onClick={() => {
                  setSource(template.source);
                  setReason(template.reason);
                }}
              >
                <span className="text-2xl block mb-1">{icons[template.label] ?? "📄"}</span>
                <span className="block font-semibold">{template.label}</span>
              </button>
            );
          })}
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suspension_date">Suspension Date</Label>
            <Input
              id="suspension_date"
              name="suspension_date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Select value={source} onValueChange={(val) => setSource(val ?? "school_admin")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manila_lgu">Manila LGU</SelectItem>
                <SelectItem value="pagasa">PAGASA</SelectItem>
                <SelectItem value="deped">DepEd</SelectItem>
                <SelectItem value="school_admin">School Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={(val) => setReason(val ?? "weather_typhoon")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weather_flooding">Weather - Flooding</SelectItem>
                <SelectItem value="weather_typhoon">Weather - Typhoon</SelectItem>
                <SelectItem value="lgu_order">LGU Order</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(val) => setScope(val ?? "all_levels")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_levels">All Levels</SelectItem>
                <SelectItem value="grade_school_only">Grade School Only</SelectItem>
                <SelectItem value="k12_only">K-12 Only</SelectItem>
                <SelectItem value="junior_high_only">Junior High Only</SelectItem>
                <SelectItem value="senior_high_only">Senior High Only</SelectItem>
                <SelectItem value="college_only">College Only</SelectItem>
                <SelectItem value="law_only">Law Only</SelectItem>
                <SelectItem value="specific_programs">Specific Programs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scope === "specific_programs" && (
            <div className="space-y-2">
              <Label>Programs</Label>
              <div className="grid grid-cols-3 gap-2">
                {PROGRAMS.map((program) => (
                  <label key={program} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="programs"
                      value={program}
                      className="h-4 w-4 rounded border-input"
                    />
                    {program}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select name="duration" defaultValue="full_day">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_day">Full Day</SelectItem>
                <SelectItem value="am_only">AM Only</SelectItem>
                <SelectItem value="pm_only">PM Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Declaring..." : "Declare Suspension"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
