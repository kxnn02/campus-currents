import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform, View, Text, Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { theme, useThemeColors } from '@/constants/Theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useUnreadCount } from '@/lib/feed';
import { useSuspensionBadge } from '@/lib/suspension-badge';
import { useRealtimeBroadcasts, useRealtimeSuspensions } from '@/lib/realtime';
import { useProfile } from '@/lib/profile';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
}) {
  const { focused, ...iconProps } = props;
  return (
    <View style={tabIndicatorStyles.iconWrapper}>
      {focused && <View style={[tabIndicatorStyles.activeIndicator, { backgroundColor: iconProps.color }]} />}
      <FontAwesome size={22} style={{ marginBottom: -2 }} {...iconProps} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const { count } = useUnreadCount();
  const { hasSuspension } = useSuspensionBadge();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  // Live clock for header
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Manila',
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  });

  // User's first name for header
  const userName = profile?.first_name || 'Home';

  // Shared header right component (date/time) for all tabs
  const HeaderRight = () => (
    <View style={headerStyles.dateTimeContainer}>
      <Text style={[headerStyles.dateText, { color: colors.textSecondary }]}>{formattedDate}</Text>
      <Text style={[headerStyles.timeText, { color: colors.text }]}>{formattedTime}</Text>
    </View>
  );

  // Wire up realtime subscriptions — live updates while tabs are mounted
  useRealtimeBroadcasts(queryClient);
  useRealtimeSuspensions(queryClient);

  // Ensure bottom padding respects the device's navigation bar (gesture bar, soft keys)
  // On Android devices without a notch, insets.bottom is 0, so use a minimum padding
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 4);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 56 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
          ...theme.shadows.sm,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          ...theme.typography.h3,
          fontWeight: '700',
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontWeight: '600',
          marginTop: 2,
        },
        headerRight: () => <HeaderRight />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} />,
          tabBarBadge: count > 0 ? (count > 9 ? '9+' : count) : undefined,
          headerTitle: () => (
            <View style={headerStyles.titleContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={headerStyles.logo}
                resizeMode="contain"
              />
              <Text style={[headerStyles.userName, { color: colors.text }]}>{userName}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="graduation-cap" color={color} focused={focused} />,
          tabBarBadge: hasSuspension ? '' : undefined,
          tabBarBadgeStyle: hasSuspension ? {
            backgroundColor: theme.colors.tier.emergency,
            minWidth: 10,
            maxHeight: 10,
            borderRadius: 5,
            top: 2,
          } : undefined,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="calendar" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="user" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const tabIndicatorStyles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 3,
    borderRadius: 2,
  },
});

const headerStyles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
