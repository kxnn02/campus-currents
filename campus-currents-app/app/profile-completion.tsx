import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { theme, useThemeColors } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';
import { Program, Level } from '@/types/database';
import { deriveLevelFromProgram } from '@/lib/suspensions';

const PROGRAMS: { label: string; value: Program }[] = [
  { label: 'BSIT', value: 'BSIT' },
  { label: 'BSBA', value: 'BSBA' },
  { label: 'BSA', value: 'BSA' },
  { label: 'BSED', value: 'BSED' },
  { label: 'BEED', value: 'BEED' },
  { label: 'AB Psychology', value: 'AB_PSYCH' },
  { label: 'AB Communication', value: 'AB_COMM' },
  { label: 'Juris Doctor', value: 'JD' },
  { label: 'ETEEAP', value: 'ETEEAP' },
  { label: 'STEM', value: 'STEM' },
  { label: 'ABM', value: 'ABM' },
  { label: 'HUMSS', value: 'HUMSS' },
  { label: 'GAS', value: 'GAS' },
  { label: 'TVL', value: 'TVL' },
  { label: 'Other', value: 'OTHER' },
];

const YEAR_LEVELS = [
  { label: '1st Year', value: 1 },
  { label: '2nd Year', value: 2 },
  { label: '3rd Year', value: 3 },
  { label: '4th Year', value: 4 },
];

function validateStudentId(id: string): boolean {
  return /^\d{10}$/.test(id);
}

function validatePhoneNumber(phone: string): boolean {
  return /^\d{10}$/.test(phone);
}

export default function ProfileCompletionScreen() {
  const colors = useThemeColors();

  const [studentId, setStudentId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [program, setProgram] = useState<Program | null>(null);
  const [yearLevel, setYearLevel] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    } else if (!validateStudentId(studentId.trim())) {
      newErrors.studentId = 'Must be exactly 10 digits (e.g., 2024101291)';
    }

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!program) newErrors.program = 'Program is required';
    if (!yearLevel) newErrors.yearLevel = 'Year level is required';

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Enter 10 digits after +63';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Session expired. Please sign in again.');
        router.replace('/(auth)/login' as never);
        return;
      }

      const level = deriveLevelFromProgram(program!);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          student_id: studentId.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          program: program,
          level: level,
          year_level: yearLevel,
          phone_number: `+63${phoneNumber.trim()}`,
          role: 'student',
        });

      if (error) throw error;

      // Navigate to main tabs
      router.replace('/(tabs)' as never);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save profile';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.text }]}>Complete Your Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We need a few details to personalize your experience and target relevant announcements.
          </Text>

          {/* Student ID */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Student ID</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.studentId ? '#DC2626' : colors.border, color: colors.text }]}
              placeholder="2024101291"
              placeholderTextColor={colors.textSecondary}
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="none"
            />
            {errors.studentId && <Text style={styles.errorText}>{errors.studentId}</Text>}
          </View>

          {/* First Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.firstName ? '#DC2626' : colors.border, color: colors.text }]}
              placeholder="Juan"
              placeholderTextColor={colors.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>

          {/* Last Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.lastName ? '#DC2626' : colors.border, color: colors.text }]}
              placeholder="Dela Cruz"
              placeholderTextColor={colors.textSecondary}
              value={lastName}
              onChangeText={setLastName}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>

          {/* Program Picker */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Program</Text>
            <Pressable
              style={[styles.input, styles.pickerButton, { backgroundColor: colors.surface, borderColor: errors.program ? '#DC2626' : colors.border }]}
              onPress={() => setShowProgramPicker(!showProgramPicker)}
            >
              <Text style={[styles.pickerText, { color: program ? colors.text : colors.textSecondary }]}>
                {program ? PROGRAMS.find(p => p.value === program)?.label : 'Select program'}
              </Text>
            </Pressable>
            {showProgramPicker && (
              <View style={[styles.pickerOptions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  persistentScrollbar={true}
                >
                  {PROGRAMS.map((p) => (
                    <Pressable
                      key={p.value}
                      style={[styles.pickerOption, program === p.value && { backgroundColor: colors.tint + '15' }]}
                      onPress={() => { setProgram(p.value); setShowProgramPicker(false); }}
                    >
                      <Text style={[styles.pickerOptionText, { color: colors.text }]}>{p.label}</Text>
                      {program === p.value && (
                        <Text style={{ color: colors.tint, fontSize: 16 }}>✓</Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            {errors.program && <Text style={styles.errorText}>{errors.program}</Text>}
          </View>

          {/* Year Level Picker */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Year Level</Text>
            <Pressable
              style={[styles.input, styles.pickerButton, { backgroundColor: colors.surface, borderColor: errors.yearLevel ? '#DC2626' : colors.border }]}
              onPress={() => setShowYearPicker(!showYearPicker)}
            >
              <Text style={[styles.pickerText, { color: yearLevel ? colors.text : colors.textSecondary }]}>
                {yearLevel ? YEAR_LEVELS.find(y => y.value === yearLevel)?.label : 'Select year level'}
              </Text>
            </Pressable>
            {showYearPicker && (
              <View style={[styles.pickerOptions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {YEAR_LEVELS.map((y) => (
                  <Pressable
                    key={y.value}
                    style={[styles.pickerOption, yearLevel === y.value && { backgroundColor: colors.tint + '15' }]}
                    onPress={() => { setYearLevel(y.value); setShowYearPicker(false); }}
                  >
                    <Text style={[styles.pickerOptionText, { color: colors.text }]}>{y.label}</Text>
                    {yearLevel === y.value && (
                      <Text style={{ color: colors.tint, fontSize: 16 }}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
            {errors.yearLevel && <Text style={styles.errorText}>{errors.yearLevel}</Text>}
          </View>

          {/* Phone Number */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={[styles.phonePrefix, { backgroundColor: colors.surface, borderColor: errors.phoneNumber ? '#DC2626' : colors.border }]}>
                <Text style={[styles.phonePrefixText, { color: colors.text }]}>+63</Text>
              </View>
              <TextInput
                style={[styles.phoneInput, { backgroundColor: colors.surface, borderColor: errors.phoneNumber ? '#DC2626' : colors.border, color: colors.text }]}
                placeholder="9XXXXXXXXX"
                placeholderTextColor={colors.textSecondary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>

          {/* Submit */}
          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.tint, opacity: submitting ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>
              {submitting ? 'Saving...' : 'Complete Profile'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { padding: theme.spacing['2xl'], paddingBottom: theme.spacing['5xl'] },
  title: { ...theme.typography.h1, marginBottom: theme.spacing.sm },
  subtitle: { ...theme.typography.body, lineHeight: 20, marginBottom: theme.spacing['2xl'] + 4 },
  field: { marginBottom: theme.spacing.lg + 2 },
  label: { ...theme.typography.label, marginBottom: theme.spacing.xs + 2 },
  input: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: theme.spacing.md,
    fontSize: 15,
  },
  errorText: { color: theme.colors.tier.emergency, ...theme.typography.caption, marginTop: theme.spacing.xs },
  pickerButton: { justifyContent: 'center' },
  pickerText: { fontSize: 15 },
  pickerOptions: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.xs,
    maxHeight: 240,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 236,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: theme.spacing.sm + 2,
  },
  pickerOptionText: { ...theme.typography.body },
  phoneRow: { flexDirection: 'row', gap: theme.spacing.sm },
  phonePrefix: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
  },
  phonePrefixText: { fontSize: 15, fontWeight: '600' },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: theme.spacing.md,
    fontSize: 15,
  },
  submitButton: {
    borderRadius: 2,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing['2xl'],
    ...theme.shadows.md,
  },
  submitText: { color: '#FFFFFF', ...theme.typography.buttonLarge },
});
