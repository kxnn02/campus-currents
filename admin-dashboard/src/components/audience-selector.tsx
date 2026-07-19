"use client";

import { useState, useEffect } from "react";
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
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(defaultPrograms);
  const [selectedYears, setSelectedYears] = useState<string[]>(defaultYears);

  useEffect(() => {
    setSelectedPrograms(defaultPrograms);
  }, [defaultPrograms]);

  useEffect(() => {
    setSelectedYears(defaultYears);
  }, [defaultYears]);

  const toggleProgram = (program: string) => {
    setSelectedPrograms((prev) =>
      prev.includes(program)
        ? prev.filter((p) => p !== program)
        : [...prev, program]
    );
  };

  const toggleYear = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.filter((y) => y !== year)
        : [...prev, year]
    );
  };

  const selectAllPrograms = () => setSelectedPrograms([...PROGRAMS]);
  const deselectAllPrograms = () => setSelectedPrograms([]);

  const selectAllYears = () => setSelectedYears([...YEAR_LEVELS]);
  const deselectAllYears = () => setSelectedYears([]);

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
          <div className="flex items-center justify-between">
            <Label>Programs</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedPrograms.length} of {PROGRAMS.length} selected
              </span>
              <button
                type="button"
                onClick={selectedPrograms.length === PROGRAMS.length ? deselectAllPrograms : selectAllPrograms}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {selectedPrograms.length === PROGRAMS.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PROGRAMS.map((program) => (
              <label
                key={program}
                className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                  selectedPrograms.includes(program)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <input
                  type="checkbox"
                  name="programs"
                  value={program}
                  checked={selectedPrograms.includes(program)}
                  onChange={() => toggleProgram(program)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="font-medium">{program}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {(audienceType === "by_year" || audienceType === "by_program_year") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Year Levels</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedYears.length} of {YEAR_LEVELS.length} selected
              </span>
              <button
                type="button"
                onClick={selectedYears.length === YEAR_LEVELS.length ? deselectAllYears : selectAllYears}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {selectedYears.length === YEAR_LEVELS.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            {YEAR_LEVELS.map((year) => (
              <label
                key={year}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  selectedYears.includes(year)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <input
                  type="checkbox"
                  name="years"
                  value={year}
                  checked={selectedYears.includes(year)}
                  onChange={() => toggleYear(year)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="font-medium">Year {year}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
