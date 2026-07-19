import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About CampusCurrents</Text>
      <Text style={styles.body}>
        Campus Broadcast, Announcement & Events System{'\n'}
        San Sebastian College – Recoletos, Manila{'\n\n'}
        Version 1.0.0
      </Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    color: '#6B7280',
  },
});
