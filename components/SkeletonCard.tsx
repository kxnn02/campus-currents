import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme, useThemeColors } from '@/constants/Theme';

/**
 * Shimmer loading placeholder that mimics the BroadcastCard layout.
 * Uses an animated opacity pulse to create a shimmer effect.
 */
export default function SkeletonCard() {
  const colors = useThemeColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity, backgroundColor: colors.shimmer },
      ]}
    >
      {/* Tier indicator bar */}
      <View style={[styles.tierBar, { backgroundColor: colors.border }]} />
      <View style={styles.content}>
        {/* Title placeholder */}
        <View style={[styles.titleLine, { backgroundColor: colors.border }]} />
        {/* Body preview placeholder lines */}
        <View style={[styles.bodyLine, { backgroundColor: colors.border }]} />
        <View style={[styles.bodyLineShort, { backgroundColor: colors.border }]} />
        {/* Footer row: timestamp + channel pill */}
        <View style={styles.footer}>
          <View style={[styles.timestamp, { backgroundColor: colors.border }]} />
          <View style={[styles.channelPill, { backgroundColor: colors.border }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: theme.radius.xl,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    height: 120,
    overflow: 'hidden',
  },
  tierBar: {
    width: 4,
    borderTopLeftRadius: theme.radius.xl,
    borderBottomLeftRadius: theme.radius.xl,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md + 2,
    justifyContent: 'space-between',
  },
  titleLine: {
    width: '70%',
    height: 14,
    borderRadius: theme.radius.xs,
  },
  bodyLine: {
    width: '90%',
    height: 10,
    borderRadius: theme.radius.xs,
  },
  bodyLineShort: {
    width: '55%',
    height: 10,
    borderRadius: theme.radius.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestamp: {
    width: 50,
    height: 10,
    borderRadius: theme.radius.xs,
  },
  channelPill: {
    width: 60,
    height: 18,
    borderRadius: theme.radius.full,
  },
});
