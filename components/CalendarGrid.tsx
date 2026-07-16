import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { CalendarEvent, EventCategory } from '@/types/database';
import { getCategoryColor } from '@/lib/calendar';
import Colors from '@/constants/Colors';

export interface CalendarGridProps {
  year: number;
  month: number; // 1-based (1 = January)
  events: CalendarEvent[];
  selectedDate: string | null; // YYYY-MM-DD format
  onDatePress: (date: string) => void; // YYYY-MM-DD format
  onMonthChange: (year: number, month: number) => void;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MAX_VISIBLE_DOTS = 3;

interface DayCell {
  date: string; // YYYY-MM-DD
  day: number;
  isCurrentMonth: boolean;
}

/**
 * Builds the 6x7 grid of day cells for a given month.
 * Pads with days from the previous and next months to fill the grid.
 */
function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstDay = new Date(year, month - 1, 1);
  // getDay() returns 0=Sun, 1=Mon, ..., 6=Sat
  // We want Mon=0, so shift: (getDay() + 6) % 7
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = month - 1;
    const prevYear = prevMonth < 1 ? year - 1 : year;
    const actualMonth = prevMonth < 1 ? 12 : prevMonth;
    cells.push({
      date: formatDate(prevYear, actualMonth, day),
      day,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      date: formatDate(year, month, day),
      day,
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill 6 rows (42 cells)
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month + 1;
    const nextYear = nextMonth > 12 ? year + 1 : year;
    const actualMonth = nextMonth > 12 ? 1 : nextMonth;
    cells.push({
      date: formatDate(nextYear, actualMonth, day),
      day,
      isCurrentMonth: false,
    });
  }

  return cells;
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Groups events by date string and returns unique categories per date.
 */
function getEventCategoriesByDate(
  events: CalendarEvent[]
): Record<string, EventCategory[]> {
  const map: Record<string, Set<EventCategory>> = {};

  for (const event of events) {
    const startDate = event.start_date.slice(0, 10);
    const endDate = event.end_date.slice(0, 10);

    // Walk through each date the event spans
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      const dateKey = current.toISOString().slice(0, 10);
      if (!map[dateKey]) {
        map[dateKey] = new Set();
      }
      map[dateKey].add(event.category);
      current.setDate(current.getDate() + 1);
    }
  }

  // Convert sets to arrays
  const result: Record<string, EventCategory[]> = {};
  for (const [key, value] of Object.entries(map)) {
    result[key] = Array.from(value);
  }
  return result;
}

function getTodayString(): string {
  const now = new Date();
  return formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export default function CalendarGrid({
  year,
  month,
  events,
  selectedDate,
  onDatePress,
  onMonthChange,
}: CalendarGridProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const today = getTodayString();

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const categoriesByDate = useMemo(() => getEventCategoriesByDate(events), [events]);

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header row: arrows + month/year */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.arrowButton}
          accessibilityLabel="Previous month"
          accessibilityRole="button"
        >
          <Text style={[styles.arrowText, { color: colors.tint }]}>‹</Text>
        </TouchableOpacity>

        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {MONTH_NAMES[month - 1]} {year}
        </Text>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.arrowButton}
          accessibilityLabel="Next month"
          accessibilityRole="button"
        >
          <Text style={[styles.arrowText, { color: colors.tint }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day labels row */}
      <View style={styles.dayLabelsRow}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={styles.dayLabelCell}>
            <Text style={[styles.dayLabelText, { color: colors.textSecondary }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid: 6 rows x 7 columns */}
      <View style={styles.grid}>
        {grid.map((cell, index) => {
          const isToday = cell.date === today;
          const isSelected = cell.date === selectedDate;
          const categories = categoriesByDate[cell.date] || [];
          const extraCount = categories.length - MAX_VISIBLE_DOTS;

          return (
            <TouchableOpacity
              key={`${cell.date}-${index}`}
              style={[
                styles.dayCell,
                isToday && !isSelected && {
                  borderWidth: 2,
                  borderColor: colors.tint,
                  borderRadius: 8,
                },
                isSelected && {
                  backgroundColor: colors.tint,
                  borderRadius: 8,
                },
              ]}
              onPress={() => onDatePress(cell.date)}
              accessibilityLabel={`${cell.day} ${cell.isCurrentMonth ? MONTH_NAMES[month - 1] : ''}`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.dayNumber,
                  { color: colors.text },
                  !cell.isCurrentMonth && { color: colors.textSecondary, opacity: 0.5 },
                  isSelected && { color: '#FFFFFF' },
                ]}
              >
                {cell.day}
              </Text>

              {/* Event dots */}
              <View style={styles.dotsContainer}>
                {categories.slice(0, MAX_VISIBLE_DOTS).map((category, dotIndex) => (
                  <View
                    key={`${category}-${dotIndex}`}
                    style={[
                      styles.dot,
                      { backgroundColor: getCategoryColor(category) },
                    ]}
                  />
                ))}
                {extraCount > 0 && (
                  <Text
                    style={[
                      styles.extraDotsText,
                      isSelected ? { color: '#FFFFFF' } : { color: colors.textSecondary },
                    ]}
                  >
                    +{extraCount}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  arrowButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 48,
    justifyContent: 'flex-start',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 10,
    gap: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  extraDotsText: {
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 1,
  },
});
