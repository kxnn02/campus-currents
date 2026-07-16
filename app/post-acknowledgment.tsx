import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useEmergency } from '@/lib/emergency';
import { AcknowledgmentType } from '@/types/database';

/**
 * Post-Acknowledgment screen shown after a student acknowledges an emergency.
 * Two variants:
 * - "safe": Green checkmark, "You're marked as SAFE", stay instruction
 * - "need_help": "Security has been notified. Stay where you are."
 *
 * Subscribes to active_emergencies table UPDATE events via Supabase Realtime.
 * When emergency status changes to "resolved": dismiss screen, show ALL CLEAR alert, navigate to tabs.
 *
 * This screen has no back button and cannot be dismissed via gesture.
 */
export default function PostAcknowledgmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { activeEmergency, acknowledgmentType } = useEmergency();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Determine the acknowledgment type: from params first, then from emergency context
  const ackType: AcknowledgmentType =
    (params.type as AcknowledgmentType) || acknowledgmentType || 'safe';

  const isSafe = ackType === 'safe';

  useEffect(() => {
    if (!activeEmergency) {
      // No active emergency — resolve immediately to normal nav
      router.replace('/(tabs)' as never);
      return;
    }

    // Subscribe to active_emergencies table UPDATE events
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
            // Dismiss screen, show ALL CLEAR alert, navigate to tabs
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
          {/* Green checkmark icon */}
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmarkIcon}>✓</Text>
          </View>
          <Text style={styles.headingLarge}>You're marked as SAFE</Text>
          <Text style={styles.instruction}>
            Stay where you are. You will be notified when it is safe to move.
          </Text>
        </>
      ) : (
        <>
          <View style={styles.helpIconCircle}>
            <Text style={styles.helpIcon}>!</Text>
          </View>
          <Text style={styles.headingLarge}>Security has been notified.</Text>
          <Text style={styles.instruction}>Stay where you are.</Text>
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
    paddingHorizontal: 32,
  },
  safeBackground: {
    backgroundColor: '#ECFDF5', // light green background
  },
  helpBackground: {
    backgroundColor: '#FEF2F2', // light red background
  },
  checkmarkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkmarkIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  helpIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  helpIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headingLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
});
