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
import { NewEventDialog } from "./new-event-dialog";
import { EventActions } from "./event-actions";

export default async function CalendarPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("is_deleted", false)
    .order("start_date", { ascending: false });

  if (error) {
    return <div className="text-destructive">Error loading events: {error.message}</div>;
  }

  function getCategoryColor(category: string) {
    switch (category) {
      case "academic":
        return "default";
      case "school_event":
        return "secondary";
      case "holiday":
        return "destructive";
      case "sports":
        return "outline";
      default:
        return "secondary";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar Events</h2>
          <p className="text-muted-foreground">
            Manage school calendar events and activities.
          </p>
        </div>
        <NewEventDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events && events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <Badge variant={getCategoryColor(event.category)}>
                      {event.category?.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {event.start_date
                      ? new Date(event.start_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {event.location || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.status === "active" ? "default" : "destructive"}
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <EventActions event={event} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No events yet. Create your first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
