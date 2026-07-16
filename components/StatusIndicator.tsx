import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export default function StatusIndicator({ status, lastChecked }: StatusIndicatorProps) {
  const colors = useThemeColors();

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

  const iconText =
    status === 'suspended' ? '✕' : status === 'monitoring' ? '⚠️' : '✓';

  const subtitle =
    status === 'monitoring'
      ? "No suspension yet. We'll notify you immediately."
      : undefined;

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <View style={[styles.glowRing, { backgroundColor: circleColor + '1A' }]}>
        {/* Main status circle */}
        <View style={[styles.circle, { backgroundColor: circleColor }, theme.shadows.lg]}>
          <Text style={styles.icon}>{iconText}</Text>
        </View>
      </View>
      <Text style={[styles.statusText, { color: circleColor }]}>{statusText}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
        As of {formatLastCheckedTime(lastChecked)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  glowRing: {
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
    fontSize: 72,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusText: {
    ...theme.typography.h1,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing['3xl'],
  },
  timestamp: {
    ...theme.typography.caption,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
