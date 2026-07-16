"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROGRAMS = [
  "BSIT",
  "BSBA",
  "BSA",
  "BSED",
  "BEED",
  "AB_PSYCH",
  "AB_COMM",
  "JD",
  "ETEEAP",
  "STEM",
  "ABM",
  "HUMSS",
  "GAS",
  "TVL",
  "OTHER",
];

const YEAR_LEVELS = ["1", "2", "3", "4"];

interface AudienceSelectorProps {
  audienceType: string;
  onAudienceTypeChange: (value: string) => void;
  defaultPrograms?: string[];
  defaultYears?: string[];
}

export function AudienceSelector({
  audienceType,
  onAudienceTypeChange,
  defaultPrograms = [],
  defaultYears = [],
}: AudienceSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Target Audience</Label>
        <Select value={audienceType} onValueChange={(val) => onAudienceTypeChange(val ?? "all")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="by_program">By Program</SelectItem>
            <SelectItem value="by_year">By Year Level</SelectItem>
            <SelectItem value="by_program_year">By Program + Year Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(audienceType === "by_program" || audienceType === "by_program_year") && (
        <div className="space-y-2">
          <Label>Programs</Label>
          <div className="grid grid-cols-3 gap-2">
            {PROGRAMS.map((program) => (
              <label key={program} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="programs"
                  value={program}
                  defaultChecked={defaultPrograms.includes(program)}
                  className="h-4 w-4 rounded border-input"
                />
                {program}
              </label>
            ))}
          </div>
        </div>
      )}

      {(audienceType === "by_year" || audienceType === "by_program_year") && (
        <div className="space-y-2">
          <Label>Year Levels</Label>
          <div className="flex gap-4">
            {YEAR_LEVELS.map((year) => (
              <label key={year} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="years"
                  value={year}
                  defaultChecked={defaultYears.includes(year)}
                  className="h-4 w-4 rounded border-input"
                />
                Year {year}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
