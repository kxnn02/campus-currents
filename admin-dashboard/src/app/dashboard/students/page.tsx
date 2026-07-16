import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, student_id, program, year_level, phone_number")
    .eq("role", "student")
    .order("last_name", { ascending: true });

  if (error) {
    return <div className="text-destructive">Error loading students: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Students</h2>
        <p className="text-muted-foreground">
          View registered student profiles. ({students?.length ?? 0} students)
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Year Level</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students && students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.first_name || student.last_name
                      ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
                      : "—"}
                  </TableCell>
                  <TableCell>{student.student_id || "—"}</TableCell>
                  <TableCell className="text-sm">{student.email || "—"}</TableCell>
                  <TableCell>{student.program || "—"}</TableCell>
                  <TableCell>{student.year_level || "—"}</TableCell>
                  <TableCell className="text-sm">{student.phone_number || "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No students registered yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
