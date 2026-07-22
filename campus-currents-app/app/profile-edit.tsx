import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/query';
import { validateProfileForm, ProfileCreateInput } from '@/lib/validation';
import { deriveLevelFromProgram } from '@/lib/suspensions';
import FormField from '@/components/FormField';
import LoadingButton from '@/components/LoadingButton';
import { Profile, Program } from '@/types/database';
import { theme, useThemeColors } from '@/constants/Theme';

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
  { label: '5th Year', value: 5 },
];

export default function ProfileEditScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  // Loading states
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSchoolUser, setIsSchoolUser] = useState(true);

  // Non-editable fields (display only)
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [program, setProgram] = useState<Program | null>(null);
  const [yearLevel, setYearLevel] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Session expired. Please sign in again.');
        router.replace('/(auth)/login' as never);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Profile not found');

      const profile = data as Profile;
      setEmail(profile.email || '');
      setStudentId(profile.student_id || '');
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setProgram(profile.program || null);
      setYearLevel(profile.year_level || null);
      // Strip +63 prefix for editing
      const rawPhone = profile.phone_number || '';
      setPhoneNumber(rawPhone.startsWith('+63') ? rawPhone.slice(3) : rawPhone);
      // Detect school vs guest user
      setIsSchoolUser(profile.email?.endsWith('@sscrmnl.edu.ph') ?? false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      Alert.alert('Error', message);
    } finally {
      setFetchingProfile(false);
    }
  }

  function handleSave() {
    if (isSchoolUser) {
      // Full validation for school users
      const formData: ProfileCreateInput = {
        student_id: studentId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        program: program as Program,
        year_level: yearLevel ?? 0,
        section: '',
        phone_number: phoneNumber.trim(),
      };

      const result = validateProfileForm(formData);

      if (!result.isValid) {
        setErrors(result.errors);
        return;
      }

      setErrors({});
      submitChanges(formData);
    } else {
      // Guest only needs name
      const newErrors: Record<string, string> = {};
      if (!firstName.trim()) newErrors.first_name = 'First name is required';
      if (!lastName.trim()) newErrors.last_name = 'Last name is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      submitGuestChanges();
    }
  }

  async function submitGuestChanges() {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Session expired. Please sign in again.');
        router.replace('/(auth)/login' as never);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save changes — please try again');
    } finally {
      setSaving(false);
    }
  }

  async function submitChanges(formData: ProfileCreateInput) {
    try {
      setSaving(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Session expired. Please sign in again.');
        router.replace('/(auth)/login' as never);
        return;
      }

      const level = deriveLevelFromProgram(formData.program);

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          program: formData.program,
          level,
          year_level: formData.year_level,
          phone_number: `+63${formData.phone_number}`,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      // Invalidate any cached profile/feed data so screens refresh immediately
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['broadcasts', 'feed'] });

      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save changes — please try again');
    } finally {
      setSaving(false);
    }
  }

  if (fetchingProfile) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Profile' }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Non-editable fields */}
          <FormField
            label="Email"
            value={email}
            onChangeText={() => {}}
            editable={false}
            placeholder=""
          />
          {isSchoolUser && (
            <FormField
              label="Student ID"
              value={studentId}
              onChangeText={() => {}}
              editable={false}
              placeholder=""
            />
          )}

          {/* Editable fields */}
          <FormField
            label="First Name"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (errors.first_name) setErrors((prev) => ({ ...prev, first_name: '' }));
            }}
            error={errors.first_name}
            placeholder="Juan"
          />
          <FormField
            label="Last Name"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (errors.last_name) setErrors((prev) => ({ ...prev, last_name: '' }));
            }}
            error={errors.last_name}
            placeholder="Dela Cruz"
          />

          {/* Program Picker — school users only */}
          {isSchoolUser && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Program</Text>
            <Pressable
              style={[
                styles.pickerButton,
                { borderColor: errors.program ? colors.error : colors.border, backgroundColor: colors.surface },
              ]}
              onPress={() => setShowProgramPicker(!showProgramPicker)}
              accessibilityLabel="Select Program"
              accessibilityRole="button"
            >
              <Text style={[styles.pickerText, { color: program ? colors.text : colors.textTertiary }]}>
                {program ? PROGRAMS.find((p) => p.value === program)?.label : 'Select program'}
              </Text>
            </Pressable>
            {showProgramPicker && (
              <View style={[styles.pickerOptions, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                {PROGRAMS.map((p) => (
                  <Pressable
                    key={p.value}
                    style={[
                      styles.pickerOption,
                      program === p.value && { backgroundColor: colors.primaryBg },
                    ]}
                    onPress={() => {
                      setProgram(p.value);
                      setShowProgramPicker(false);
                      if (errors.program) setErrors((prev) => ({ ...prev, program: '' }));
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={p.label}
                  >
                    <Text style={[styles.pickerOptionText, { color: colors.text }]}>{p.label}</Text>
                    {program === p.value && <Text style={{ color: colors.tint }}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            )}
            {errors.program ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.program}</Text> : null}
          </View>
          )}

          {/* Year Level Picker — school users only */}
          {isSchoolUser && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Year Level</Text>
            <Pressable
              style={[
                styles.pickerButton,
                { borderColor: errors.year_level ? colors.error : colors.border, backgroundColor: colors.surface },
              ]}
              onPress={() => setShowYearPicker(!showYearPicker)}
              accessibilityLabel="Select Year Level"
              accessibilityRole="button"
            >
              <Text style={[styles.pickerText, { color: yearLevel ? colors.text : colors.textTertiary }]}>
                {yearLevel ? YEAR_LEVELS.find((y) => y.value === yearLevel)?.label : 'Select year level'}
              </Text>
            </Pressable>
            {showYearPicker && (
              <View style={[styles.pickerOptions, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                {YEAR_LEVELS.map((y) => (
                  <Pressable
                    key={y.value}
                    style={[
                      styles.pickerOption,
                      yearLevel === y.value && { backgroundColor: colors.primaryBg },
                    ]}
                    onPress={() => {
                      setYearLevel(y.value);
                      setShowYearPicker(false);
                      if (errors.year_level) setErrors((prev) => ({ ...prev, year_level: '' }));
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={y.label}
                  >
                    <Text style={[styles.pickerOptionText, { color: colors.text }]}>{y.label}</Text>
                    {yearLevel === y.value && <Text style={{ color: colors.tint }}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            )}
            {errors.year_level ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.year_level}</Text> : null}
          </View>
          )}

          {/* Phone Number — school users only */}
          {isSchoolUser && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={[styles.phonePrefix, { borderColor: errors.phone_number ? colors.error : colors.border, backgroundColor: colors.background }]}>
                <Text style={[styles.phonePrefixText, { color: colors.text }]}>+63</Text>
              </View>
              <View style={styles.phoneInputWrapper}>
                <TextInput
                  style={[
                    styles.phoneInput,
                    { borderColor: errors.phone_number ? colors.error : colors.border, backgroundColor: colors.surface, color: colors.text },
                  ]}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (errors.phone_number) setErrors((prev) => ({ ...prev, phone_number: '' }));
                  }}
                  placeholder="9XXXXXXXXX"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  accessibilityLabel="Phone Number"
                />
              </View>
            </View>
            {errors.phone_number ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.phone_number}</Text> : null}
          </View>
          )}

          {/* Save Button */}
          <View style={styles.saveContainer}>
            <LoadingButton
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: theme.spacing['2xl'],
    paddingBottom: theme.spacing['5xl'],
  },
  field: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs + 2,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 15,
    fontWeight: '400',
  },
  pickerOptions: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.xs,
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
  },
  pickerOptionText: {
    ...theme.typography.body,
  },
  errorText: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  phonePrefix: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: '600',
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    fontSize: 15,
  },
  saveContainer: {
    marginTop: theme.spacing.lg,
  },
});
