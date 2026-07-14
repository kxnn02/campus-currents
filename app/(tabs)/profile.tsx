import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Placeholder user data - will be replaced with Supabase auth session
const USER = {
  first_name: 'Juan',
  last_name: 'Dela Cruz',
  student_id: '2024-00123',
  program: 'BSIT',
  year_level: 4,
  section: '4ITA',
  email: 'juan.delacruz@sscr.edu.ph',
  phone_number: '+63 912 345 6789',
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <View style={styles.content}>
        {/* Avatar + Name */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>
              {USER.first_name[0]}{USER.last_name[0]}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {USER.first_name} {USER.last_name}
          </Text>
          <Text style={[styles.studentId, { color: colors.textSecondary }]}>
            {USER.student_id}
          </Text>
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label="Program" value={USER.program} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Year Level" value={`${USER.year_level}th Year`} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Section" value={USER.section} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Email" value={USER.email} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Phone" value={USER.phone_number} colors={colors} />
        </View>

        {/* Buttons */}
        <Pressable style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Edit Profile</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.logoutButton]}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  button: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});
