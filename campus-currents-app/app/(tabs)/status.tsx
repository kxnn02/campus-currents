import { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { theme, useThemeColors } from '@/constants/Theme';
import StatusIndicator from '@/components/StatusIndicator';
import ErrorState from '@/components/ErrorState';
import { useNetworkContext } from '@/lib/network';
import { useProfile } from '@/lib/profile';
import {
  useActiveSuspensions,
  formatSuspensionSource,
  formatSuspensionReason,
  formatSuspensionDuration,
} from '@/lib/suspensions';
import { supabase } from '@/lib/supabase';
import { ClassSuspension, SuspensionScope } from '@/types/database';

/** Two minutes in milliseconds — threshold for stale data warning */
const STALE_THRESHOLD_MS = 2 * 60 * 1000;

/**
 * Maps a suspension scope enum value to a human-readable string.
 */
function formatSuspensionScope(scope: SuspensionScope): string {
  const scopeMap: Record<SuspensionScope, string> = {
    all_levels: 'All levels',
    grade_school_only: 'Grade school only',
    junior_high_only: 'Junior high only',
    senior_high_only: 'Senior high only',
    k12_only: 'K-12 only',
    college_only: 'College only',
    law_only: 'Law only',
    specific_programs: 'Specific programs',
  };
  return scopeMap[scope] ?? scope;
}

export default function StatusScreen() {
  const colors = useThemeColors();
  const { isConnected, isInternetReachable } = useNetworkContext();
  const isOffline = !isConnected || !isInternetReachable;

  // Get profile from shared context
  const { profile, isLoading: profileLoading } = useProfile();

  // Fetch active suspensions (today + upcoming) once profile is available
  const {
    data: activeSuspensions,
    isLoading: suspensionsLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useActiveSuspensions(
    profile ?? { level: null, program: null },
    { enabled: !!profile }
  );

  // Fetch recent suspension history (last 3)
  const { data: suspensionHistory } = useQuery<ClassSuspension[]>({
    queryKey: ['suspensions', 'history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_suspensions')
        .select('*')
        .in('status', ['active', 'lifted'])
        .order('suspension_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data as ClassSuspension[]) ?? [];
    },
    staleTime: 60_000,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Determine stale data state
  const isDataStale =
    dataUpdatedAt > 0 && Date.now() - dataUpdatedAt > STALE_THRESHOLD_MS;
  const showStaleWarning = isDataStale && isOffline;

  // Loading state: waiting for profile or suspensions initial load
  const isLoading = profileLoading || (suspensionsLoading && !activeSuspensions);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state: query failed and no cached data
  if (isError && !activeSuspensions) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <ErrorState
          message="Unable to load suspension status"
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  const todaySuspensions = activeSuspensions?.todaySuspensions ?? [];
  const upcomingSuspensions = activeSuspensions?.upcomingSuspensions ?? [];
  const isSuspendedToday = todaySuspensions.length > 0;
  const hasUpcoming = upcomingSuspensions.length > 0;
  const lastChecked = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();

  // Determine if the nearest upcoming suspension is TOMORROW (actionable tonight)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const isSuspendedTomorrow = upcomingSuspensions.some((s) => s.suspension_date === tomorrow);

  // Hero indicator: red (today) → yellow (ONLY if tomorrow) → green (clear today)
  // Suspensions further than tomorrow do NOT change the hero — they appear as cards below
  const indicatorStatus = isSuspendedToday
    ? 'suspended'
    : isSuspendedTomorrow
    ? 'monitoring'
    : 'on';

  // Primary suspension details: today's suspension (if any)
  const primarySuspension = isSuspendedToday ? todaySuspensions[0] : null;
  const otherTodaySuspensions = todaySuspensions.slice(1);

  // Format the upcoming suspension date for the indicator (only tomorrow)
  const upcomingDate = isSuspendedTomorrow
    ? new Date(tomorrow + 'T00:00:00')
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stale data warning banner */}
        {showStaleWarning && (
          <View style={styles.staleBanner}>
            <Text style={styles.staleBannerText}>
              Status may be outdated. Last checked:{' '}
              {lastChecked.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Manila',
              })}
            </Text>
          </View>
        )}

        {/* Status Indicator */}
        <StatusIndicator
          status={indicatorStatus}
          lastChecked={lastChecked}
          upcomingDate={upcomingDate ?? undefined}
        />

        {/* Today's suspension details — Bento grid */}
        {isSuspendedToday && primarySuspension && (
          <View style={styles.bentoGrid}>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>Source</Text>
              <Text style={[styles.bentoValue, { color: colors.text }]} numberOfLines={2}>
                {formatSuspensionSource(primarySuspension.source)}
              </Text>
            </View>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>Reason</Text>
              <Text style={[styles.bentoValue, { color: colors.text }]} numberOfLines={2}>
                {formatSuspensionReason(primarySuspension.reason)}
              </Text>
            </View>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>Scope</Text>
              <Text style={[styles.bentoValue, { color: colors.text }]} numberOfLines={2}>
                {formatSuspensionScope(primarySuspension.scope)}
              </Text>
            </View>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>Duration</Text>
              <Text style={[styles.bentoValue, { color: colors.text }]} numberOfLines={2}>
                {formatSuspensionDuration(primarySuspension.duration)}
              </Text>
            </View>
          </View>
        )}

        {/* Other active suspensions today */}
        {otherTodaySuspensions.length > 0 && (
          <View style={styles.otherSection}>
            <Text style={[styles.otherTitle, { color: colors.textSecondary }]}>
              Other active suspensions today
            </Text>
            {otherTodaySuspensions.map((suspension) => (
              <OtherSuspensionCard
                key={suspension.id}
                suspension={suspension}
                colors={colors}
              />
            ))}
          </View>
        )}

        {/* Upcoming suspensions — alert-style cards below the hero */}
        {upcomingSuspensions.length > 0 && (
          <View style={styles.upcomingSection}>
            <Text style={[styles.upcomingSectionTitle, { color: colors.textSecondary }]}>
              ⚠️  HEADS UP
            </Text>
            {upcomingSuspensions.map((suspension) => {
              const suspDate = new Date(suspension.suspension_date + 'T00:00:00');
              const daysAway = Math.ceil((suspDate.getTime() - new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) + 'T00:00:00').getTime()) / 86400000);
              const isTomorrow = suspension.suspension_date === new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
              return (
                <View
                  key={suspension.id}
                  style={[
                    styles.upcomingCard,
                    {
                      backgroundColor: isTomorrow ? '#FEF3C7' : colors.surface,
                      borderColor: isTomorrow ? '#F59E0B' : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.upcomingStripe, { backgroundColor: isTomorrow ? '#F59E0B' : '#D97706' }]} />
                  <View style={styles.upcomingContent}>
                    <View style={styles.upcomingHeader}>
                      <Text style={[styles.upcomingDate, { color: isTomorrow ? '#92400E' : colors.text }]}>
                        {suspDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'Asia/Manila',
                        })}
                      </Text>
                      <Text style={[styles.upcomingBadge, { color: isTomorrow ? '#92400E' : colors.textSecondary }]}>
                        {isTomorrow ? 'Tomorrow' : `In ${daysAway} days`}
                      </Text>
                    </View>
                    <Text style={[styles.upcomingDetails, { color: isTomorrow ? '#78350F' : colors.textSecondary }]}>
                      {formatSuspensionSource(suspension.source)} · {formatSuspensionReason(suspension.reason)} · {formatSuspensionDuration(suspension.duration)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Info text when classes are on */}
        {indicatorStatus === 'on' && (
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            You'll be notified immediately if this changes.
          </Text>
        )}

        {/* Recent Suspensions history — card style matching Figma */}
        {suspensionHistory && suspensionHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>
              RECENT HISTORY
            </Text>
            {suspensionHistory.map((item) => (
              <View key={item.id} style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.historyStripe, { backgroundColor: theme.colors.status.suspended }]} />
                <View style={styles.historyContent}>
                  <Text style={[styles.historyDate, { color: colors.text }]}>
                    {new Date(item.suspension_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'Asia/Manila',
                    })}
                  </Text>
                  <Text style={[styles.historySource, { color: colors.textSecondary }]}>
                    {formatSuspensionSource(item.source)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function OtherSuspensionCard({
  suspension,
  colors,
  showDate,
}: {
  suspension: ClassSuspension;
  colors: Record<string, string>;
  showDate?: boolean;
}) {
  return (
    <View style={[styles.otherCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {showDate && (
        <Text style={[styles.otherCardDate, { color: colors.tint }]}>
          {new Date(suspension.suspension_date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: 'Asia/Manila',
          })}
        </Text>
      )}
      <Text style={[styles.otherCardSource, { color: colors.text }]}>
        {formatSuspensionSource(suspension.source)}
      </Text>
      <Text style={[styles.otherCardDetail, { color: colors.textSecondary }]}>
        {formatSuspensionReason(suspension.reason)} · {formatSuspensionDuration(suspension.duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 96,
  },
  staleBanner: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  staleBannerText: {
    color: '#92400E',
    ...theme.typography.bodySmall,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Bento grid for suspension details (Figma: full-width stacked cards)
  bentoGrid: {
    width: '100%',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  bentoCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 25,
    ...theme.shadows.sm,
  },
  bentoLabel: {
    ...theme.typography.caption,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  bentoValue: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  // Other suspensions (today)
  otherSection: {
    width: '100%',
    marginTop: theme.spacing['2xl'],
  },
  otherTitle: {
    ...theme.typography.overline,
    marginBottom: theme.spacing.md,
  },
  otherCard: {
    borderRadius: theme.radius['2xl'],
    padding: theme.spacing.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  otherCardSource: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs,
  },
  otherCardDate: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  otherCardDetail: {
    ...theme.typography.bodySmall,
  },
  // Upcoming suspensions section
  upcomingSection: {
    width: '100%',
    marginTop: theme.spacing['2xl'],
  },
  upcomingSectionTitle: {
    ...theme.typography.overline,
    marginBottom: theme.spacing.md,
    letterSpacing: 1,
  },
  upcomingCard: {
    flexDirection: 'row' as const,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden' as const,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  upcomingStripe: {
    width: 5,
  },
  upcomingContent: {
    flex: 1,
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg,
  },
  upcomingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.xs,
  },
  upcomingDate: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  upcomingBadge: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  upcomingDetails: {
    ...theme.typography.bodySmall,
    lineHeight: 18,
  },
  infoText: {
    ...theme.typography.body,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  // History section (Figma card style with colored left stripe)
  historySection: {
    width: '100%',
    marginTop: theme.spacing['2xl'],
  },
  historyTitle: {
    ...theme.typography.overline,
    marginBottom: theme.spacing.md,
  },
  historyCard: {
    flexDirection: 'row',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  historyStripe: {
    width: 6,
    borderRadius: theme.radius.xl,
    marginVertical: 12,
    marginLeft: 4,
  },
  historyContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  historyDate: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs,
  },
  historySource: {
    ...theme.typography.bodySmall,
  },
});
