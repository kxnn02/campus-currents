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
  useTodaySuspensions,
  formatSuspensionSource,
  formatSuspensionReason,
  formatSuspensionDuration,
} from '@/lib/suspensions';
import { supabase } from '@/lib/supabase';
import { Profile, ClassSuspension, SuspensionScope } from '@/types/database';

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

  // Fetch suspensions once profile is available
  const {
    data: suspensions,
    isLoading: suspensionsLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useTodaySuspensions(
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
  const isLoading = profileLoading || (suspensionsLoading && !suspensions);

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
  if (isError && !suspensions) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <ErrorState
          message="Unable to load suspension status"
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  const isSuspended = (suspensions?.length ?? 0) > 0;
  const lastChecked = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();
  const primarySuspension = suspensions?.[0] ?? null;
  const otherSuspensions = suspensions?.slice(1) ?? [];

  // Derive status for the indicator
  const indicatorStatus = isSuspended ? 'suspended' : 'on';

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
        <StatusIndicator status={indicatorStatus} lastChecked={lastChecked} />

        {/* Suspension details card */}
        {isSuspended && primarySuspension && (
          <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <DetailRow
              label="Source"
              value={formatSuspensionSource(primarySuspension.source)}
              colors={colors}
            />
            <DetailRow
              label="Reason"
              value={formatSuspensionReason(primarySuspension.reason)}
              colors={colors}
            />
            <DetailRow
              label="Scope"
              value={formatSuspensionScope(primarySuspension.scope)}
              colors={colors}
            />
            <DetailRow
              label="Duration"
              value={formatSuspensionDuration(primarySuspension.duration)}
              colors={colors}
            />
          </View>
        )}

        {/* Other active suspensions */}
        {otherSuspensions.length > 0 && (
          <View style={styles.otherSection}>
            <Text style={[styles.otherTitle, { color: colors.textSecondary }]}>
              Other active suspensions
            </Text>
            {otherSuspensions.map((suspension) => (
              <OtherSuspensionCard
                key={suspension.id}
                suspension={suspension}
                colors={colors}
              />
            ))}
          </View>
        )}

        {/* Info text when classes are on */}
        {!isSuspended && (
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            You'll be notified immediately if this changes.
          </Text>
        )}

        {/* Recent Suspensions history */}
        {suspensionHistory && suspensionHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>
              Recent Suspensions
            </Text>
            {suspensionHistory.map((item) => (
              <View key={item.id} style={[styles.historyRow, { borderColor: colors.border }]}>
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
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: Record<string, string> }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function OtherSuspensionCard({
  suspension,
  colors,
}: {
  suspension: ClassSuspension;
  colors: Record<string, string>;
}) {
  return (
    <View style={[styles.otherCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  staleBanner: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  staleBannerText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  otherSection: {
    width: '100%',
    marginTop: 24,
  },
  otherTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  otherCard: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  otherCardSource: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  otherCardDetail: {
    fontSize: 13,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  historySection: {
    width: '100%',
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  historySource: {
    fontSize: 13,
  },
});
