"use client";

import { useEffect, useState, useMemo } from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const PAGE_SIZE = 25;

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(1);

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

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
        const matches = name.includes(q) ||
          (s.email?.toLowerCase().includes(q)) ||
          (s.student_id?.includes(q));
        if (!matches) return false;
      }
      if (programFilter !== "all" && s.program !== programFilter) return false;
      if (yearFilter !== "all" && String(s.year_level) !== yearFilter) return false;
      return true;
    });
  }, [students, search, programFilter, yearFilter]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, programFilter, yearFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      <div className="rounded-xl border border-[#C4C5D5] bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FFF1F1]/50 hover:bg-[#FFF1F1]/50">
              <TableHead className="font-semibold text-[#444653]">Name</TableHead>
              <TableHead className="font-semibold text-[#444653]">Student ID</TableHead>
              <TableHead className="font-semibold text-[#444653]">Program</TableHead>
              <TableHead className="font-semibold text-[#444653]">Year</TableHead>
              <TableHead className="font-semibold text-[#444653]">Email</TableHead>
              <TableHead className="font-semibold text-[#444653]">Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-[#141B2B]">
                    {student.first_name || student.last_name
                      ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
                      : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-[#444653]">
                    {student.student_id || "—"}
                  </TableCell>
                  <TableCell>
                    {student.program ? (
                      <Badge variant="secondary">{student.program}</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-[#444653]">{student.year_level || "—"}</TableCell>
                  <TableCell className="text-sm text-[#444653]">
                    {student.email || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#444653]">{student.phone_number || "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-sm text-[#444653]">
                    {students.length === 0 ? "No students registered yet." : "No students match your filters."}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#C4C5D5] px-4 py-3">
            <p className="text-sm text-[#444653]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="rounded-md p-1.5 hover:bg-[#FFF1F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-[#444653]" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={pageNum === page ? "page" : undefined}
                    className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                      pageNum === page
                        ? "bg-[#8D1515] text-white"
                        : "text-[#444653] hover:bg-[#FFF1F1]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="rounded-md p-1.5 hover:bg-[#FFF1F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-[#444653]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
