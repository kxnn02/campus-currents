import { StyleSheet, FlatList, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Placeholder data - will be replaced with Supabase fetch
const SAMPLE_BROADCASTS = [
  {
    id: '1',
    tier: 'emergency',
    title: 'ACTIVE THREAT - LOCKDOWN',
    body: 'Stay in your room. Lock doors. Keep silent. Do NOT exit building.',
    channel: 'security',
    sent_at: '2026-07-14T14:34:00Z',
  },
  {
    id: '2',
    tier: 'important',
    title: 'Classes Suspended - July 14',
    body: 'All classes suspended due to flooding per Manila LGU directive. Stay safe.',
    channel: 'suspension',
    sent_at: '2026-07-14T04:47:00Z',
  },
  {
    id: '3',
    tier: 'routine',
    title: 'SSC-R Foundation Day 2026',
    body: 'Annual foundation day celebration on August 28. Cultural performances, booth fair, and awarding ceremony.',
    channel: 'event',
    sent_at: '2026-07-13T10:00:00Z',
  },
  {
    id: '4',
    tier: 'routine',
    title: 'Web Development Workshop',
    body: 'GDSC SSC-R invites all BSIT students to a React basics workshop on August 5.',
    channel: 'event',
    sent_at: '2026-07-12T09:00:00Z',
  },
];

function getTierColor(tier: string) {
  switch (tier) {
    case 'emergency': return Colors.tier.emergency;
    case 'important': return Colors.tier.important;
    case 'routine': return Colors.tier.routine;
    default: return Colors.tier.routine;
  }
}

function getTierLabel(tier: string) {
  switch (tier) {
    case 'emergency': return 'EMERGENCY';
    case 'important': return 'IMPORTANT';
    case 'routine': return 'ROUTINE';
    default: return 'ROUTINE';
  }
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderItem = ({ item }: { item: typeof SAMPLE_BROADCASTS[0] }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.tierBadge, { backgroundColor: getTierColor(item.tier) + '15' }]}>
          <View style={[styles.tierDot, { backgroundColor: getTierColor(item.tier) }]} />
          <Text style={[styles.tierLabel, { color: getTierColor(item.tier) }]}>
            {getTierLabel(item.tier)}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {formatTime(item.sent_at)}
        </Text>
      </View>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.cardBody, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.body}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <FlatList
        data={SAMPLE_BROADCASTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
