import { useQuery } from '@tanstack/react-query';
import { CalendarEvent, EventCategory, Program } from '@/types/database';
import { queryKeys, staleTimeConfig } from '@/lib/query';
import { supabase } from '@/lib/supabase';
import { matchesTargetAudience } from '@/lib/feed';
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

// --- React Query Hooks ---

/**
 * A unified calendar item that can represent a calendar event, broadcast, or suspension.
 */
export interface UnifiedCalendarItem {
  id: string;
  title: string;
  subtitle: string | null;
  date: string; // YYYY-MM-DD
  startDate: string; // ISO
  endDate: string; // ISO
  isAllDay: boolean;
  category: EventCategory | 'suspension' | 'announcement';
  source: 'event' | 'broadcast' | 'suspension';
  location: string | null;
  color: string;
}

/**
 * Maps a unified item's category to a display color.
 */
export function getUnifiedItemColor(item: UnifiedCalendarItem): string {
  if (item.source === 'suspension') return Colors.calendar.holiday; // red
  if (item.source === 'broadcast') return Colors.calendar.administrative; // orange
  return getCategoryColor(item.category as EventCategory);
}

/**
 * Fetches ALL data sources for a given month and unifies them into calendar items:
 * - calendar_events (dedicated events)
 * - broadcasts (announcements — placed on their sent_at date)
 * - class_suspensions (placed on their suspension_date)
 *
 * This makes the calendar actually useful by showing everything that happens on campus.
 */
export function useUnifiedMonthData(
  year: number,
  month: number,
  profile?: { program: Program | null; year_level: number | null } | null
) {
  return useQuery({
    queryKey: ['unified-calendar', year, month],
    queryFn: async () => {
      const firstOfMonth = new Date(year, month - 1, 1);
      const lastOfMonth = new Date(year, month, 0);

      const rangeStart = new Date(firstOfMonth);
      rangeStart.setDate(rangeStart.getDate() - 7);
      const rangeEnd = new Date(lastOfMonth);
      rangeEnd.setDate(rangeEnd.getDate() + 7);

      const rangeStartISO = rangeStart.toISOString();
      const rangeEndISO = rangeEnd.toISOString();
      const rangeStartDate = rangeStart.toISOString().slice(0, 10);
      const rangeEndDate = rangeEnd.toISOString().slice(0, 10);

      // Fetch all three data sources in parallel
      const [eventsResult, broadcastsResult, suspensionsResult] = await Promise.all([
        // 1. Calendar events
        supabase
          .from('calendar_events')
          .select('*')
          .eq('is_deleted', false)
          .eq('status', 'active')
          .lte('start_date', rangeEndISO)
          .gte('end_date', rangeStartISO),

        // 2. Broadcasts (announcements) in the date range
        supabase
          .from('broadcasts')
          .select('id, title, body, tier, channel, sent_at, target_audience')
          .eq('is_deleted', false)
          .gte('sent_at', rangeStartISO)
          .lte('sent_at', rangeEndISO)
          .order('sent_at', { ascending: false })
          .limit(50),

        // 3. Suspensions in the date range
        supabase
          .from('class_suspensions')
          .select('id, source, reason, scope, duration, suspension_date, status')
          .gte('suspension_date', rangeStartDate)
          .lte('suspension_date', rangeEndDate),
      ]);

      const unified: UnifiedCalendarItem[] = [];

      // Process calendar events
      if (eventsResult.data) {
        let events = eventsResult.data as CalendarEvent[];
        if (profile) {
          events = events.filter((e) =>
            matchesTargetAudience(e.target_audience, {
              program: profile.program,
              year_level: profile.year_level,
            })
          );
        }
        for (const event of events) {
          unified.push({
            id: event.id,
            title: event.title,
            subtitle: event.location,
            date: event.start_date.slice(0, 10),
            startDate: event.start_date,
            endDate: event.end_date,
            isAllDay: event.is_all_day,
            category: event.category,
            source: 'event',
            location: event.location,
            color: getCategoryColor(event.category),
          });
        }
      }

      // Process broadcasts → calendar items
      if (broadcastsResult.data) {
        let broadcasts = broadcastsResult.data as Array<{
          id: string;
          title: string;
          body: string;
          tier: string;
          channel: string;
          sent_at: string;
          target_audience: Record<string, unknown>;
        }>;
        if (profile) {
          broadcasts = broadcasts.filter((b) =>
            matchesTargetAudience(b.target_audience, {
              program: profile.program,
              year_level: profile.year_level,
            })
          );
        }
        for (const b of broadcasts) {
          unified.push({
            id: `broadcast-${b.id}`,
            title: b.title,
            subtitle: b.channel,
            date: b.sent_at.slice(0, 10),
            startDate: b.sent_at,
            endDate: b.sent_at,
            isAllDay: true,
            category: 'announcement',
            source: 'broadcast',
            location: null,
            color: Colors.calendar.administrative,
          });
        }
      }

      // Process suspensions → calendar items
      if (suspensionsResult.data) {
        for (const s of suspensionsResult.data) {
          const dateISO = `${s.suspension_date}T00:00:00`;
          unified.push({
            id: `suspension-${s.id}`,
            title: `Classes Suspended`,
            subtitle: `${s.source} · ${s.reason}`.replace(/_/g, ' '),
            date: s.suspension_date,
            startDate: dateISO,
            endDate: dateISO,
            isAllDay: true,
            category: 'suspension',
            source: 'suspension',
            location: null,
            color: Colors.calendar.holiday,
          });
        }
      }

      return unified;
    },
    staleTime: staleTimeConfig.calendarEvents,
  });
}

/**
 * Filters unified items for a specific date.
 */
export function getUnifiedItemsForDate(items: UnifiedCalendarItem[], date: string): UnifiedCalendarItem[] {
  const targetDate = date.slice(0, 10);
  return items.filter((item) => {
    const startDate = item.startDate.slice(0, 10);
    const endDate = item.endDate.slice(0, 10);
    return targetDate >= startDate && targetDate <= endDate;
  });
}

/**
 * Fetches calendar events for a given month with ±7 day padding for edge visibility.
 * Filters by is_deleted = false and status = 'active', selecting events whose
 * date range overlaps with the padded month window.
 * Applies client-side audience filtering when a profile is provided.
 */
export function useMonthEvents(
  year: number,
  month: number,
  profile?: { program: Program | null; year_level: number | null } | null
) {
  return useQuery({
    queryKey: queryKeys.calendar.month(year, month),
    queryFn: async () => {
      // Calculate padded date range: first of month - 7 days to last of month + 7 days
      const firstOfMonth = new Date(year, month - 1, 1);
      const lastOfMonth = new Date(year, month, 0); // day 0 of next month = last day of current month

      const rangeStart = new Date(firstOfMonth);
      rangeStart.setDate(rangeStart.getDate() - 7);

      const rangeEnd = new Date(lastOfMonth);
      rangeEnd.setDate(rangeEnd.getDate() + 7);

      const rangeStartISO = rangeStart.toISOString();
      const rangeEndISO = rangeEnd.toISOString();

      // Fetch events that overlap with the range:
      // An event overlaps if its start_date <= rangeEnd AND end_date >= rangeStart
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('is_deleted', false)
        .eq('status', 'active')
        .lte('start_date', rangeEndISO)
        .gte('end_date', rangeStartISO);

      if (error) throw error;

      const events = (data as CalendarEvent[]) ?? [];

      // Apply client-side audience filtering if profile is provided
      if (profile) {
        return events.filter((event) =>
          matchesTargetAudience(event.target_audience, {
            program: profile.program,
            year_level: profile.year_level,
          })
        );
      }

      return events;
    },
    staleTime: staleTimeConfig.calendarEvents,
  });
}

/**
 * Fetches a single calendar event by its ID.
 */
export function useEventDetail(eventId: string) {
  return useQuery({
    queryKey: queryKeys.calendar.event(eventId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as CalendarEvent;
    },
    staleTime: staleTimeConfig.calendarEvents,
    enabled: !!eventId && eventId.length > 0,
  });
}
