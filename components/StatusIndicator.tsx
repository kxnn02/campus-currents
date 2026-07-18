import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { theme, useThemeColors } from '@/constants/Theme';

type StatusState = 'on' | 'suspended' | 'monitoring';

interface StatusIndicatorProps {
  status: StatusState;
  lastChecked: Date;
}

function formatLastCheckedTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  });
}

/**
 * StatusIndicator — The "peak moment" of the app (per Peak-End Rule).
 * Uses pulsing glow animation to communicate live status at a glance.
 * Designed as the hero element with strong visual hierarchy.
 */
export default function StatusIndicator({ status, lastChecked }: StatusIndicatorProps) {
  const colors = useThemeColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.15)).current;

  const circleColor =
    status === 'suspended'
      ? theme.colors.status.suspended
      : status === 'monitoring'
      ? theme.colors.status.monitoring
      : theme.colors.status.on;

  const statusText =
    status === 'suspended'
      ? 'CLASSES SUSPENDED'
      : status === 'monitoring'
      ? 'MONITORING'
      : 'CLASSES ARE ON';

  const statusEmoji =
    status === 'suspended' ? '🚫' : status === 'monitoring' ? '⚠️' : '✓';

  const statusSubtext =
    status === 'suspended'
      ? 'Stay safe. Check details below.'
      : status === 'monitoring'
      ? "No suspension yet. We'll notify you immediately."
      : "You're all set for today.";

  // Subtle pulse animation for the glow ring — communicates "alive" status
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.25,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.12,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [pulseAnim, glowAnim]);

  return (
    <View style={styles.container}>
      {/* Outer glow ring — animated pulse for emotional feedback */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            backgroundColor: circleColor,
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Inner soft ring for depth */}
        <View style={[styles.innerGlow, { backgroundColor: circleColor + '20' }]}>
          {/* Main status circle */}
          <View style={[styles.circle, { backgroundColor: circleColor }, theme.shadows.xl]}>
            <Text style={styles.icon}>{statusEmoji}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Status text — bold, single hierarchy level */}
      <Text style={[styles.statusText, { color: circleColor }]}>{statusText}</Text>

      {/* Supportive subtext — emotional, human copy */}
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {statusSubtext}
      </Text>

      {/* Timestamp — lowest hierarchy */}
      <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
        As of {formatLastCheckedTime(lastChecked)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  glowRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerGlow: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: theme.layout.statusCircleSize,
    height: theme.layout.statusCircleSize,
    borderRadius: theme.layout.statusCircleSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusText: {
    ...theme.typography.display,
    marginTop: theme.spacing.xl,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    ...theme.typography.body,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing['4xl'],
  },
  timestamp: {
    ...theme.typography.caption,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
