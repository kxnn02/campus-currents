import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEmergency } from '@/lib/emergency';
import { useBroadcastDetail } from '@/lib/feed';
import { theme } from '@/constants/Theme';

/**
 * Emergency Overlay Screen
 *
 * Full-screen modal with solid red background that cannot be dismissed
 * except by tapping one of the two acknowledgment buttons.
 */
export default function EmergencyOverlayScreen() {
  const router = useRouter();
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

  // Handle "I'm Safe" press
  const handleSafe = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await acknowledge('safe');
      router.replace('/post-acknowledgment?type=safe' as never);
    } catch {
      setIsSubmitting(false);
    }
  }, [isSubmitting, acknowledge, router]);

  // Handle "Need Help" press
  const handleNeedHelp = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await acknowledge('need_help');
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
      <View style={styles.warningBadge}>
        <Text style={styles.warningBadgeText}>⚠️ EMERGENCY ⚠️</Text>
      </View>

      {/* Elapsed Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>ALERT ACTIVE</Text>
        <Text style={styles.timerValue}>{elapsedText}</Text>
      </View>

      {/* Emergency Heading */}
      <Text style={styles.heading}>{emergencyHeading}</Text>

      {/* Instruction Text */}
      <Text style={styles.instructions}>{instructionText}</Text>

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

        {/* NEED HELP Button */}
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
    backgroundColor: '#8E0002',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['5xl'],
  },
  warningBadge: {
    position: 'absolute',
    top: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.full,
  },
  warningBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  timerValue: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 32,
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: theme.spacing['5xl'],
    opacity: 0.9,
    paddingHorizontal: theme.spacing.md,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.lg,
  },
  safeButton: {
    backgroundColor: '#16A34A',
    minHeight: 70,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  safeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  helpButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    minHeight: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
