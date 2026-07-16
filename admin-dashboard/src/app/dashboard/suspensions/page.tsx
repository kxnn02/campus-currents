import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewSuspensionDialog } from "./new-suspension-dialog";
import { LiftSuspensionButton } from "./lift-suspension-button";

export default async function SuspensionsPage() {
  const supabase = await createClient();

  const { data: suspensions, error } = await supabase
    .from("class_suspensions")
    .select("*")
    .order("suspension_date", { ascending: false });

  if (error) {
    return <div className="text-destructive">Error loading suspensions: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Class Suspensions</h2>
          <p className="text-muted-foreground">
            Manage class suspension declarations.
          </p>
        </div>
        <NewSuspensionDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suspensions && suspensions.length > 0 ? (
              suspensions.map((suspension) => (
                <TableRow key={suspension.id}>
                  <TableCell className="font-medium">
                    {suspension.suspension_date}
                  </TableCell>
                  <TableCell className="capitalize">
                    {suspension.source?.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {suspension.reason?.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {suspension.scope?.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {suspension.duration?.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        suspension.status === "active" ? "default" : "secondary"
                      }
                    >
                      {suspension.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {suspension.status === "active" && (
                      <LiftSuspensionButton id={suspension.id} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No suspensions recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
