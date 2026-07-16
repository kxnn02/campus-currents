import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

/**
 * Shimmer loading placeholder that mimics the BroadcastCard layout.
 * Uses an animated opacity pulse to create a shimmer effect.
 */
export default function SkeletonCard() {
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
    <Animated.View style={[styles.card, { opacity }]}>
      {/* Tier indicator bar */}
      <View style={styles.tierBar} />
      <View style={styles.content}>
        {/* Title placeholder */}
        <View style={styles.titleLine} />
        {/* Body preview placeholder lines */}
        <View style={styles.bodyLine} />
        <View style={styles.bodyLineShort} />
        {/* Footer row: timestamp + channel pill */}
        <View style={styles.footer}>
          <View style={styles.timestamp} />
          <View style={styles.channelPill} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 120,
    overflow: 'hidden',
  },
  tierBar: {
    width: 4,
    backgroundColor: '#D1D5DB',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  titleLine: {
    width: '70%',
    height: 14,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },
  bodyLine: {
    width: '90%',
    height: 10,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },
  bodyLineShort: {
    width: '55%',
    height: 10,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestamp: {
    width: 50,
    height: 10,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },
  channelPill: {
    width: 60,
    height: 18,
    backgroundColor: '#D1D5DB',
    borderRadius: 9,
  },
});
