import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// --- Safe NetInfo import (gracefully handles Expo Go where native module is unavailable) ---
let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  // NetInfo not available (Expo Go) — will default to "online"
}

// --- Types ---

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
}

// --- Hook ---

/**
 * Subscribes to device network state via NetInfo.
 * Returns current connectivity and internet reachability.
 * Falls back to "always online" when NetInfo native module isn't available (Expo Go).
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    if (!NetInfo) return; // Skip if native module unavailable

    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });

    return () => unsubscribe();
  }, []);

  return status;
}

// --- Context ---

const NetworkContext = createContext<NetworkStatus>({
  isConnected: true,
  isInternetReachable: true,
});

/**
 * Provides network status globally via React context.
 * Wrap this around your app's component tree.
 */
export function NetworkProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const status = useNetworkStatus();

  return React.createElement(
    NetworkContext.Provider,
    { value: status },
    children
  );
}

/**
 * Consume the global network status from NetworkProvider.
 */
export function useNetworkContext(): NetworkStatus {
  return useContext(NetworkContext);
}

// --- OfflineBanner / NetworkBanner ---

/**
 * Persistent top banner displayed when the device has no internet connection.
 * Returns null when online.
 */
export function OfflineBanner(): React.ReactElement | null {
  const { isConnected, isInternetReachable } = useNetworkContext();

  const isOffline = !isConnected || !isInternetReachable;

  if (!isOffline) {
    return null;
  }

  return React.createElement(
    View,
    { style: styles.banner },
    React.createElement(
      Text,
      { style: styles.bannerText },
      'No internet connection'
    )
  );
}

/**
 * Alias for OfflineBanner — matches the design doc export name.
 */
export const NetworkBanner = OfflineBanner;

// --- StaleDataBanner ---

/**
 * Subtle banner shown when the app is offline and serving cached/stale data.
 * Less urgent than OfflineBanner — uses a muted style.
 * Rendered conditionally based on `isServingStaleData` prop.
 */
export function StaleDataBanner({ visible }: { visible: boolean }): React.ReactElement | null {
  if (!visible) {
    return null;
  }

  return React.createElement(
    View,
    { style: styles.staleBanner },
    React.createElement(
      Text,
      { style: styles.staleBannerText },
      "You\u2019re offline \u2014 showing last available data"
    )
  );
}

// --- TimeoutToast ---

/**
 * Non-persistent toast banner for "Connection timed out" message.
 * Auto-dismisses after 4 seconds, or can be manually dismissed.
 */
export function TimeoutToast({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}): React.ReactElement | null {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, onDismiss]);

  if (!visible) {
    return null;
  }

  return React.createElement(
    View,
    { style: styles.toastBanner },
    React.createElement(
      Text,
      { style: styles.toastText },
      'Connection timed out'
    )
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  staleBanner: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staleBannerText: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '500',
  },
  toastBanner: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
