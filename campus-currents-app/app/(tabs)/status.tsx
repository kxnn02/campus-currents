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

  // Derive three-state indicator: red (suspended today) → yellow (upcoming) → green (clear)
  const indicatorStatus = isSuspendedToday
    ? 'suspended'
    : hasUpcoming
    ? 'monitoring'
    : 'on';

  // Primary suspension to show details for (today takes priority, otherwise first upcoming)
  const primarySuspension = isSuspendedToday
    ? todaySuspensions[0]
    : hasUpcoming
    ? upcomingSuspensions[0]
    : null;
  const otherTodaySuspensions = todaySuspensions.slice(1);

  // Format the upcoming suspension date for the indicator
  const upcomingDate = hasUpcoming
    ? new Date(upcomingSuspensions[0].suspension_date + 'T00:00:00')
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

        {/* Suspension details — Bento grid style (matching Figma) */}
        {primarySuspension && (
          <View style={styles.bentoGrid}>
            {/* Show date prominently for upcoming suspensions */}
            {!isSuspendedToday && hasUpcoming && (
              <View style={[styles.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>Date</Text>
                <Text style={[styles.bentoValue, { color: colors.text }]}>
                  {new Date(primarySuspension.suspension_date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Asia/Manila',
                  })}
                </Text>
              </View>
            )}
            <View style={[styles.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>Source</Text>
              <Text style={[styles.bentoValue, { color: colors.text }]}>
                {formatSuspensionSource(primarySuspension.source)}
              </Text>
            </View>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>Reason</Text>
              <Text style={[styles.bentoValue, { color: colors.text }]}>
                {formatSuspensionReason(primarySuspension.reason)}
              </Text>
            </View>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>Scope</Text>
              <Text style={[styles.bentoValue, { color: colors.text }]}>
                {formatSuspensionScope(primarySuspension.scope)}
              </Text>
            </View>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>Duration</Text>
              <Text style={[styles.bentoValue, { color: colors.text }]}>
                {formatSuspensionDuration(primarySuspension.duration)}
              </Text>
            </View>
          </View>
        )}

        {/* Other active suspensions today */}
        {otherTodaySuspensions.length > 0 && (
          <View style={styles.otherSection}>
            <Text style={[styles.otherTitle, { color: colors.textSecondary }]}>
              Other active suspensions
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

        {/* Upcoming suspensions listed when today is already suspended */}
        {isSuspendedToday && upcomingSuspensions.length > 0 && (
          <View style={styles.otherSection}>
            <Text style={[styles.otherTitle, { color: colors.textSecondary }]}>
              Upcoming suspensions
            </Text>
            {upcomingSuspensions.map((suspension) => (
              <OtherSuspensionCard
                key={suspension.id}
                suspension={suspension}
                colors={colors}
                showDate
              />
            ))}
          </View>
        )}

        {/* Additional upcoming suspensions when primary is monitoring */}
        {!isSuspendedToday && upcomingSuspensions.length > 1 && (
          <View style={styles.otherSection}>
            <Text style={[styles.otherTitle, { color: colors.textSecondary }]}>
              Other upcoming suspensions
            </Text>
            {upcomingSuspensions.slice(1).map((suspension) => (
              <OtherSuspensionCard
                key={suspension.id}
                suspension={suspension}
                colors={colors}
                showDate
              />
            ))}
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
  // Other suspensions
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
