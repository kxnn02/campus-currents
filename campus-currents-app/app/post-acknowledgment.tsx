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
          } else if (newRecord.status === 'false_alarm') {
            Alert.alert('ALERT CANCELLED', 'This was a false alarm. You may resume normal activities.', [
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
    paddingHorizontal: theme.spacing.lg,
  },
  safeBackground: {
    backgroundColor: '#293040',
  },
  helpBackground: {
    backgroundColor: '#2A1A1A',
  },
  checkmarkCircle: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
    shadowColor: 'rgba(22,163,74,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  checkmarkIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  helpIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: theme.colors.tier.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
    shadowColor: 'rgba(186,26,26,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  helpIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headingLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.55,
    marginBottom: theme.spacing.lg,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '400',
    color: '#D3DAEF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  waitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 25,
    paddingVertical: theme.spacing.sm + 1,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
  },
  waitingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.35,
  },
});
