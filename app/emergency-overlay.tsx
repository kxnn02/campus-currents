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

/**
 * Emergency Overlay Screen
 *
 * Full-screen modal with solid red background that cannot be dismissed
 * except by tapping one of the two acknowledgment buttons.
 *
 * Displays:
 * - Emergency type heading (from broadcast title)
 * - Instruction text (from broadcast body)
 * - Elapsed timer since emergency created_at
 * - "I'M SAFE ✓" green button
 * - "NEED HELP 🆘" white-outlined button
 *
 * Validates: Requirements 10.5, 10.6, 10.7, 10.8, 10.9
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
      // Navigate to post-acknowledgment screen (safe)
      router.replace('/post-acknowledgment?type=safe' as never);
    } catch {
      // Retry logic handled in EmergencyProvider; if it throws, the overlay was already dismissed
      setIsSubmitting(false);
    }
  }, [isSubmitting, acknowledge, router]);

  // Handle "Need Help" press
  const handleNeedHelp = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await acknowledge('need_help');
      // Navigate to "Security notified" screen
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
            <ActivityIndicator color="#FFFFFF" />
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
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.helpButtonText}>NEED HELP 🆘</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Formats the emergency_type enum into a readable heading as fallback.
 */
function formatEmergencyType(type?: string | null): string {
  switch (type) {
    case 'active_threat':
      return '⚠️ ACTIVE THREAT';
    case 'fire':
      return '🔥 FIRE EMERGENCY';
    case 'earthquake':
      return '🌍 EARTHQUAKE';
    case 'flooding':
      return '🌊 FLOODING';
    default:
      return '🚨 EMERGENCY ALERT';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    opacity: 0.8,
  },
  timerValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
    marginTop: 4,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    opacity: 0.95,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  safeButton: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  safeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  helpButton: {
    backgroundColor: 'transparent',
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
