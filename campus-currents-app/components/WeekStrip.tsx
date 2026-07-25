import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, useThemeColors } from '@/constants/Theme';
import { ClassSuspension } from '@/types/database';
import {
  formatSuspensionSource,
  formatSuspensionReason,
  formatSuspensionDuration,
} from '@/lib/suspensions';

interface WeekStripProps {
  /** All suspensions from today onwards (today + upcoming combined) */
  suspensions: ClassSuspension[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns the current week (Mon–Sun) as an array of date strings in YYYY-MM-DD format.
 */
function getCurrentWeekDates(): string[] {
  const now = new Date();
  // Use Manila timezone for the current date
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const today = new Date(todayStr + 'T12:00:00');
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  // Start from Monday
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

function getTodayString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

type DayStatus = 'on' | 'suspended' | 'weekend' | 'past';

/**
 * WeekStrip — A 7-day horizontal timeline showing class status for the current week.
 * Students can instantly see which days this week have suspensions without scrolling.
 * Tapping a suspended day shows its details inline.
 */
export default function WeekStrip({ suspensions }: WeekStripProps) {
  const colors = useThemeColors();
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const todayStr = getTodayString();

  const weekDates = useMemo(() => getCurrentWeekDates(), []);

  // Map suspension dates for quick lookup
  const suspensionsByDate = useMemo(() => {
    const map: Record<string, ClassSuspension[]> = {};
    for (const s of suspensions) {
      if (!map[s.suspension_date]) {
        map[s.suspension_date] = [];
      }
      map[s.suspension_date].push(s);
    }
    return map;
  }, [suspensions]);

  const getDayStatus = (dateStr: string): DayStatus => {
    if (suspensionsByDate[dateStr]?.length > 0) return 'suspended';
    const d = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) return 'weekend'; // Sunday only — Saturday may have classes at SSC-R
    if (dateStr < todayStr) return 'past';
    return 'on';
  };

  const getDayColor = (status: DayStatus): string => {
    switch (status) {
      case 'suspended': return theme.colors.status.suspended;
      case 'on': return theme.colors.status.on;
      case 'weekend': return colors.textTertiary;
      case 'past': return colors.textTertiary;
    }
  };

  const getDotColor = (status: DayStatus): string => {
    switch (status) {
      case 'suspended': return theme.colors.status.suspended;
      case 'on': return theme.colors.status.on;
      case 'weekend': return colors.border;
      case 'past': return colors.border;
    }
  };

  const expandedSuspension = expandedDate ? suspensionsByDate[expandedDate]?.[0] : null;

  return (
    <View style={styles.container}>
      {/* Section label */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>THIS WEEK</Text>

      {/* Week days row */}
      <View style={[styles.weekRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {weekDates.map((dateStr) => {
          const d = new Date(dateStr + 'T12:00:00');
          const dayLabel = DAY_LABELS[d.getDay()];
          const dayNum = d.getDate();
          const isToday = dateStr === todayStr;
          const status = getDayStatus(dateStr);
          const isSuspended = status === 'suspended';
          const isExpanded = expandedDate === dateStr;

          return (
            <Pressable
              key={dateStr}
              style={[
                styles.dayCell,
                isToday && [styles.todayCell, { borderColor: colors.tint }],
                isExpanded && isSuspended && { backgroundColor: theme.colors.status.suspended + '10' },
              ]}
              onPress={() => {
                if (isSuspended) {
                  setExpandedDate(isExpanded ? null : dateStr);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`${dayLabel} ${dayNum}, ${status === 'suspended' ? 'classes suspended' : 'classes on'}`}
            >
              <Text style={[styles.dayLabel, { color: isToday ? colors.tint : colors.textSecondary }]}>
                {dayLabel}
              </Text>
              <Text style={[
                styles.dayNumber,
                { color: isToday ? colors.tint : getDayColor(status) },
                isSuspended && { fontWeight: '800' },
              ]}>
                {dayNum}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: getDotColor(status) }]}>
                {isSuspended && (
                  <Ionicons name="close" size={6} color="#FFFFFF" />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Expanded detail card for tapped suspended day */}
      {expandedSuspension && expandedDate && (
        <View style={[styles.detailCard, { backgroundColor: theme.colors.status.suspended + '08', borderColor: theme.colors.status.suspended + '25' }]}>
          <View style={[styles.detailStripe, { backgroundColor: theme.colors.status.suspended }]} />
          <View style={styles.detailContent}>
            <Text style={[styles.detailDate, { color: theme.colors.status.suspended }]}>
              {new Date(expandedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                timeZone: 'Asia/Manila',
              })}
            </Text>
            <Text style={[styles.detailInfo, { color: colors.text }]}>
              {formatSuspensionSource(expandedSuspension.source)} · {formatSuspensionReason(expandedSuspension.reason)}
            </Text>
            <Text style={[styles.detailMeta, { color: colors.textSecondary }]}>
              {formatSuspensionDuration(expandedSuspension.duration)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  sectionLabel: {
    ...theme.typography.overline,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  todayCell: {
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Expanded detail card
  detailCard: {
    flexDirection: 'row',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
  },
  detailStripe: {
    width: 4,
  },
  detailContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  detailDate: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailInfo: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailMeta: {
    ...theme.typography.caption,
  },
});
