import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEmergency } from '@/lib/emergency';
import { useBroadcastDetail } from '@/lib/feed';
import { supabase } from '@/lib/supabase';
import { theme } from '@/constants/Theme';

// Haptic feedback removed — requires native rebuild to activate.
// To re-enable, run: npx expo install expo-haptics, then rebuild dev APK.
const Haptics: any = null;

/**
 * Emergency Overlay Screen
 *
 * Full-screen modal with solid red background that cannot be dismissed
 * except by tapping one of the two acknowledgment buttons.
 * Includes haptic feedback for tactile confirmation during panic scenarios.
 */
export default function EmergencyOverlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeEmergency, acknowledge } = useEmergency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedText, setElapsedText] = useState('0:00');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch broadcast details for title and body
  const { data: broadcast } = useBroadcastDetail(activeEmergency?.broadcast_id ?? '');

  // Disable hardware back button (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  // Trigger heavy haptic when overlay appears (attention-grabbing)
  useEffect(() => {
    if (Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  // Elapsed timer: updates every second since emergency created_at
  useEffect(() => {
    if (!activeEmergency?.created_at) return;

    function updateElapsed() {
      const createdAt = new Date(activeEmergency!.created_at).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - createdAt) / 1000));
      const minutes = Math.floor(diffSec / 60);
      const seconds = diffSec % 60;
      setElapsedText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }

    updateElapsed();
    intervalRef.current = setInterval(updateElapsed, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeEmergency?.created_at]);

  // Realtime listener: if admin resolves/cancels the emergency while student is on this overlay,
  // dismiss gracefully instead of leaving them stuck on a red screen
  useEffect(() => {
    if (!activeEmergency?.id) return;

    const channel = supabase
      .channel(`overlay-emergency-${activeEmergency.id}`)
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
            Alert.alert(
              'ALL CLEAR',
              'The emergency has been resolved. It is now safe to move.',
              [{ text: 'OK', onPress: () => router.replace('/(tabs)' as never) }]
            );
          } else if (newRecord.status === 'false_alarm') {
            Alert.alert(
              'ALERT CANCELLED',
              'This was a false alarm. You may resume normal activities.',
              [{ text: 'OK', onPress: () => router.replace('/(tabs)' as never) }]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeEmergency?.id, router]);

  // Handle "I'm Safe" press
  const handleSafe = useCallback(async () => {
    if (isSubmitting) return;
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setIsSubmitting(true);
    try {
      await acknowledge('safe');
      if (Haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace('/post-acknowledgment?type=safe' as never);
    } catch {
      setIsSubmitting(false);
    }
  }, [isSubmitting, acknowledge, router]);

  // Handle "Need Help" press
  const handleNeedHelp = useCallback(async () => {
    if (isSubmitting) return;
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setIsSubmitting(true);
    try {
      await acknowledge('need_help');
      if (Haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      router.replace('/post-acknowledgment?type=need_help' as never);
    } catch {
      setIsSubmitting(false);
    }
  }, [isSubmitting, acknowledge, router]);

  // Derive display text
  const emergencyHeading = broadcast?.title ?? formatEmergencyType(activeEmergency?.emergency_type);
  const instructionText = broadcast?.body ?? 'Follow campus emergency procedures. Await further instructions.';

  return (
    <View style={styles.container}>
      {/* Warning badge at top */}
      <View style={[styles.warningBadge, { top: insets.top + 12 }]}>
        <Text style={styles.warningBadgeText}>EMERGENCY</Text>
      </View>

      {/* Elapsed Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>ALERT ACTIVE</Text>
        <Text style={styles.timerValue}>{elapsedText}</Text>
      </View>

      {/* Emergency Heading */}
      <Text style={styles.heading}>{emergencyHeading}</Text>

      {/* Instruction Text */}
      <Text style={styles.instructions} numberOfLines={6}>{instructionText}</Text>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* I'M SAFE Button */}
        <TouchableOpacity
          style={[styles.safeButton, isSubmitting && styles.disabledButton]}
          onPress={handleSafe}
          disabled={isSubmitting}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="I'm Safe"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="large" />
          ) : (
            <Text style={styles.safeButtonText}>I'M SAFE ✓</Text>
          )}
        </TouchableOpacity>

        {/* NEED HELP Button — solid amber/orange for equal visual weight */}
        <TouchableOpacity
          style={[styles.helpButton, isSubmitting && styles.disabledButton]}
          onPress={handleNeedHelp}
          disabled={isSubmitting}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Need Help"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="large" />
          ) : (
            <Text style={styles.helpButtonText}>NEED HELP 🆘</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatEmergencyType(type?: string | null): string {
  switch (type) {
    case 'active_threat':
      return 'ACTIVE THREAT - LOCKDOWN';
    case 'fire':
      return 'FIRE EMERGENCY';
    case 'earthquake':
      return 'EARTHQUAKE';
    case 'flooding':
      return 'SEVERE FLOODING';
    default:
      return 'EMERGENCY ALERT';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AF101A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing['5xl'],
  },
  warningBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: 12,
  },
  warningBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  timerValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
    fontVariant: ['tabular-nums'] as any,
    letterSpacing: 4.8,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  instructions: {
    color: '#1A1C1C',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['2xl'],
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E2E2',
    overflow: 'hidden',
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.lg,
  },
  safeButton: {
    backgroundColor: '#16A34A',
    borderWidth: 1,
    borderColor: '#22C55E',
    minHeight: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  safeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  helpButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#BA1A1A',
    minHeight: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  helpButtonText: {
    color: '#BA1A1A',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
