import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

interface BannerData {
  title: string;
  body: string;
  tier: string;
  broadcastId?: string;
}

interface InAppBannerContextValue {
  show: (data: BannerData) => void;
}

const InAppBannerContext = createContext<InAppBannerContextValue>({
  show: () => {},
});

export function useInAppBanner() {
  return useContext(InAppBannerContext);
}

export function InAppBannerProvider({ children }: { children: React.ReactNode }) {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const dismiss = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setBanner(null));
  }, [translateY]);

  const show = useCallback((data: BannerData) => {
    setBanner(data);
    translateY.setValue(-120);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();

    // Auto-dismiss after 4 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(dismiss, 4000);
  }, [translateY, dismiss]);

  const handlePress = useCallback(() => {
    dismiss();
    if (banner?.broadcastId) {
      router.push(`/broadcast-detail?id=${banner.broadcastId}` as never);
    }
  }, [banner, dismiss, router]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const tierColor = banner
    ? Colors.tier[banner.tier as keyof typeof Colors.tier] ?? Colors.tier.routine
    : Colors.tier.routine;

  return (
    <InAppBannerContext.Provider value={{ show }}>
      {children}
      {banner && (
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY }], backgroundColor: colors.surface, borderLeftColor: tierColor },
          ]}
        >
          <Pressable onPress={handlePress} style={styles.pressable}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {banner.title}
            </Text>
            <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={1}>
              {banner.body}
            </Text>
          </Pressable>
          <Pressable onPress={dismiss} style={styles.dismissButton} accessibilityLabel="Dismiss">
            <Text style={[styles.dismissText, { color: colors.textSecondary }]}>✕</Text>
          </Pressable>
        </Animated.View>
      )}
    </InAppBannerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  pressable: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
  },
  dismissButton: {
    paddingLeft: 12,
    paddingVertical: 4,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
