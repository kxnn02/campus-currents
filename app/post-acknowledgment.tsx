import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useEmergency } from '@/lib/emergency';
import { AcknowledgmentType } from '@/types/database';
import { theme } from '@/constants/Theme';

/**
 * Post-Acknowledgment screen shown after a student acknowledges an emergency.
 * Two variants:
 * - "safe": Green checkmark, "You're marked as SAFE", stay instruction
 * - "need_help": "Security has been notified. Stay where you are."
 *
 * Subscribes to active_emergencies table UPDATE events via Supabase Realtime.
 * When emergency status changes to "resolved": dismiss screen, show ALL CLEAR alert, navigate to tabs.
 */
export default function PostAcknowledgmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { activeEmergency, acknowledgmentType } = useEmergency();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const ackType: AcknowledgmentType =
    (params.type as AcknowledgmentType) || acknowledgmentType || 'safe';

  const isSafe = ackType === 'safe';

  useEffect(() => {
    if (!activeEmergency) {
      router.replace('/(tabs)' as never);
      return;
    }

    const channel = supabase
      .channel('post-ack-emergency-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_emergencies',
          filter: `id=eq.${activeEmergency.id}`,
        },
        (payload) => {
          const newRecord = payload.new as { status?: string };
          if (newRecord.status === 'resolved') {
            Alert.alert('ALL CLEAR', 'The emergency has been resolved. It is now safe to move.', [
              {
                text: 'OK',
                onPress: () => {
                  router.replace('/(tabs)' as never);
                },
              },
            ]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [activeEmergency?.id]);

  return (
    <View style={[styles.container, isSafe ? styles.safeBackground : styles.helpBackground]}>
      {isSafe ? (
        <>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmarkIcon}>✓</Text>
          </View>
          <Text style={styles.headingLarge}>You're marked as SAFE</Text>
          <Text style={styles.instruction}>
            Stay where you are. You will be notified when it is safe to move.
          </Text>
          <View style={styles.waitingBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.waitingText}>Waiting for ALL CLEAR...</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.helpIconCircle}>
            <Text style={styles.helpIcon}>!</Text>
          </View>
          <Text style={styles.headingLarge}>Security has been notified</Text>
          <Text style={styles.instruction}>
            Stay where you are. Help is on the way.
          </Text>
          <View style={styles.waitingBadge}>
            <View style={[styles.liveDot, { backgroundColor: theme.colors.tier.emergency }]} />
            <Text style={styles.waitingText}>Alert still active</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['3xl'],
  },
  safeBackground: {
    backgroundColor: theme.colors.light.successBg,
  },
  helpBackground: {
    backgroundColor: theme.colors.light.errorBg,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.status.on,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
    ...theme.shadows.lg,
  },
  checkmarkIcon: {
    fontSize: 56,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  helpIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.tier.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
    ...theme.shadows.lg,
  },
  helpIcon: {
    fontSize: 56,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headingLarge: {
    ...theme.typography.display,
    color: theme.palette.gray900,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  instruction: {
    ...theme.typography.bodyLarge,
    color: theme.palette.gray600,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: theme.spacing['3xl'],
  },
  waitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.full,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.status.on,
  },
  waitingText: {
    ...theme.typography.caption,
    color: theme.palette.gray600,
    fontWeight: '600',
  },
});
