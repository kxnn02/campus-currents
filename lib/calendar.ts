import { CalendarEvent, EventCategory } from '@/types/database';
import Colors from '@/constants/Colors';

/**
 * Filters events that overlap the given date (inclusive range check).
 * For all-day events or events with same start/end, checks the date portion matches.
 */
export function getEventsForDate(events: CalendarEvent[], date: string): CalendarEvent[] {
  // Normalize the target date to YYYY-MM-DD for comparison
  const targetDate = date.slice(0, 10);

  return events.filter((event) => {
    const startDate = event.start_date.slice(0, 10);
    const endDate = event.end_date.slice(0, 10);

    // The target date falls within the event's start_date to end_date range (inclusive)
    return targetDate >= startDate && targetDate <= endDate;
  });
}

/**
 * Maps an EventCategory enum value (snake_case from DB) to the corresponding
 * hex color from the design system (camelCase keys in Colors.calendar).
 */
export function getCategoryColor(category: EventCategory): string {
  const colorMap: Record<EventCategory, string> = {
    academic: Colors.calendar.academic,
    school_event: Colors.calendar.schoolEvent,
    org_activity: Colors.calendar.orgActivity,
    administrative: Colors.calendar.administrative,
    holiday: Colors.calendar.holiday,
    sports: Colors.calendar.sports,
    seminar: Colors.calendar.seminar,
  };
  return colorMap[category] ?? Colors.calendar.academic;
}

/**
 * Sorts calendar events: all-day events first, then by start_date ascending.
 * Stable sort preserves original order for events with equal start times.
 */
export function sortCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    // All-day events come first
    if (a.is_all_day && !b.is_all_day) return -1;
    if (!a.is_all_day && b.is_all_day) return 1;

    // Within each group, sort by start_date ascending
    const aStart = new Date(a.start_date).getTime();
    const bStart = new Date(b.start_date).getTime();
    return aStart - bStart;
  });
}
