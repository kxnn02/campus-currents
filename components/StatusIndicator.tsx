import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface StatusIndicatorProps {
  isSuspended: boolean;
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

export default function StatusIndicator({ isSuspended, lastChecked }: StatusIndicatorProps) {
  const circleColor = isSuspended ? Colors.status.suspended : Colors.status.on;
  const statusText = isSuspended ? 'CLASSES SUSPENDED' : 'CLASSES ARE ON';
  const iconText = isSuspended ? '✕' : '✓';

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: circleColor }]}>
        <Text style={styles.icon}>{iconText}</Text>
      </View>
      <Text style={[styles.statusText, { color: circleColor }]}>{statusText}</Text>
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
  timestamp: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
