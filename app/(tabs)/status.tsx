import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// TODO: Replace with Supabase realtime subscription to class_suspensions table
const CURRENT_STATUS = {
  status: 'on' as 'on' | 'suspended' | 'monitoring',
  lastUpdated: '2026-07-14T05:30:00Z',
  // Uncomment below for suspended state:
  // status: 'suspended' as const,
  // source: 'Manila LGU',
  // reason: 'Weather / Flooding',
  // scope: 'All levels',
  // duration: 'Full day',
  // message: 'All classes suspended due to flooding per Manila LGU directive. Stay safe.',
};

export default function StatusScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isOn = CURRENT_STATUS.status === 'on';
  const isSuspended = CURRENT_STATUS.status === 'suspended';
  const isMonitoring = CURRENT_STATUS.status === 'monitoring';

  const statusColor = isOn
    ? Colors.status.on
    : isSuspended
    ? Colors.status.suspended
    : Colors.status.monitoring;

  const statusText = isOn
    ? 'CLASSES ARE ON'
    : isSuspended
    ? 'CLASSES SUSPENDED'
    : 'MONITORING';

  const statusEmoji = isOn ? '✓' : isSuspended ? '✕' : '⚠';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <View style={styles.content}>
        {/* Large status indicator */}
        <View style={[styles.statusCircle, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
          <Text style={[styles.statusEmoji, { color: statusColor }]}>{statusEmoji}</Text>
        </View>

        {/* Status text */}
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>

        {/* Last updated */}
        <Text style={[styles.updatedText, { color: colors.textSecondary }]}>
          As of {new Date(CURRENT_STATUS.lastUpdated).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
          })}, {new Date(CURRENT_STATUS.lastUpdated).toLocaleDateString('en-PH', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>

        {/* Details card (shown when suspended) */}
        {isSuspended && (
          <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <DetailRow label="Source" value="Manila LGU" colors={colors} />
            <DetailRow label="Reason" value="Weather / Flooding" colors={colors} />
            <DetailRow label="Scope" value="All levels" colors={colors} />
            <DetailRow label="Duration" value="Full day" colors={colors} />
          </View>
        )}

        {/* Info text when classes are on */}
        {isOn && (
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            You'll be notified immediately if this changes.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  statusCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusEmoji: {
    fontSize: 48,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  updatedText: {
    fontSize: 14,
    marginBottom: 32,
  },
  detailsCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
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
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});
