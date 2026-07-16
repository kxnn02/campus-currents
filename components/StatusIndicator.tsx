import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

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
  const circleColor =
    status === 'suspended'
      ? Colors.status.suspended
      : status === 'monitoring'
      ? Colors.status.monitoring
      : Colors.status.on;

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
      <View style={[styles.circle, { backgroundColor: circleColor }]}>
        <Text style={styles.icon}>{iconText}</Text>
      </View>
      <Text style={[styles.statusText, { color: circleColor }]}>{statusText}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.timestamp}>As of {formatLastCheckedTime(lastChecked)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 80,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  timestamp: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
