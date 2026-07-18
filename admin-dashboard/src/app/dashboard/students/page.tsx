"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  student_id: string | null;
  program: string | null;
  year_level: number | null;
  phone_number: string | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    async function fetchStudents() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, student_id, program, year_level, phone_number")
        .eq("role", "student")
        .order("last_name", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setStudents((data as Student[]) ?? []);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
      const matches = name.includes(q) ||
        (s.email?.toLowerCase().includes(q)) ||
        (s.student_id?.includes(q));
      if (!matches) return false;
    }
    // Program filter
    if (programFilter !== "all" && s.program !== programFilter) return false;
    // Year filter
    if (yearFilter !== "all" && String(s.year_level) !== yearFilter) return false;
    return true;
  });

  if (error) {
    return <div className="text-destructive">Error loading students: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Students</h2>
        <p className="text-[#444653]">
          {students.length} registered students
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={programFilter} onValueChange={(v) => setProgramFilter(v ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            <SelectItem value="BSIT">BSIT</SelectItem>
            <SelectItem value="BSBA">BSBA</SelectItem>
            <SelectItem value="BSA">BSA</SelectItem>
            <SelectItem value="BSED">BSED</SelectItem>
            <SelectItem value="BEED">BEED</SelectItem>
            <SelectItem value="AB_PSYCH">AB Psychology</SelectItem>
            <SelectItem value="AB_COMM">AB Communication</SelectItem>
            <SelectItem value="JD">Juris Doctor</SelectItem>
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={(v) => setYearFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
            <SelectItem value="4">4th Year</SelectItem>
          </SelectContent>
        </Select>
        {(search || programFilter !== "all" || yearFilter !== "all") && (
          <span className="text-sm text-muted-foreground">
            Showing {filtered.length} of {students.length}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Student ID</TableHead>
              <TableHead className="font-semibold">Program</TableHead>
              <TableHead className="font-semibold">Year</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : filtered.length > 0 ? (
              filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.first_name || student.last_name
                      ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
                      : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {student.student_id || "—"}
                  </TableCell>
                  <TableCell>
                    {student.program ? (
                      <Badge variant="secondary">{student.program}</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{student.year_level || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {student.email || "—"}
                  </TableCell>
                  <TableCell className="text-sm">{student.phone_number || "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    {students.length === 0 ? "No students registered yet." : "No students match your filters."}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
