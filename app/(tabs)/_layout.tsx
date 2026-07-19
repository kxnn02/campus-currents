import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme, useThemeColors } from '@/constants/Theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useUnreadCount } from '@/lib/feed';
import { useSuspensionBadge } from '@/lib/suspension-badge';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const { count } = useUnreadCount();
  const { hasSuspension } = useSuspensionBadge();
  const insets = useSafeAreaInsets();

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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
          tabBarBadge: count > 0 ? (count > 9 ? '9+' : count) : undefined,
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          tabBarIcon: ({ color }) => <TabBarIcon name="graduation-cap" color={color} />,
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
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
