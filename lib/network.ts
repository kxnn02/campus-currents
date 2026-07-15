import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// --- Types ---

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
}

// --- Hook ---

/**
 * Subscribes to device network state via NetInfo.
 * Returns current connectivity and internet reachability.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
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
});
