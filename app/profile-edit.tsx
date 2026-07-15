import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
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
import FormField from '@/components/FormField';
import LoadingButton from '@/components/LoadingButton';
import { Profile, Program } from '@/types/database';

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

function deriveLevelFromProgram(program: Program) {
  switch (program) {
    case 'BSIT':
    case 'BSBA':
    case 'BSA':
    case 'BSED':
    case 'BEED':
    case 'AB_PSYCH':
    case 'AB_COMM':
    case 'OTHER':
      return 'college';
    case 'JD':
      return 'law';
    case 'ETEEAP':
      return 'eteeap';
    case 'STEM':
    case 'ABM':
    case 'HUMSS':
    case 'GAS':
    case 'TVL':
      return 'senior_high';
    default:
      return 'college';
  }
}

export default function ProfileEditScreen() {
  const router = useRouter();

  // Loading states
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      Alert.alert('Error', message);
    } finally {
      setFetchingProfile(false);
    }
  }

  function handleSave() {
    // Build validation input — reuse student_id from loaded profile
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      <KeyboardAvoidingView
        style={styles.flex}
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
          <FormField
            label="Student ID"
            value={studentId}
            onChangeText={() => {}}
            editable={false}
            placeholder=""
          />

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

          {/* Program Picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Program</Text>
            <Pressable
              style={[
                styles.pickerButton,
                errors.program ? styles.pickerError : null,
              ]}
              onPress={() => setShowProgramPicker(!showProgramPicker)}
              accessibilityLabel="Select Program"
              accessibilityRole="button"
            >
              <Text style={[styles.pickerText, !program && styles.pickerPlaceholder]}>
                {program ? PROGRAMS.find((p) => p.value === program)?.label : 'Select program'}
              </Text>
            </Pressable>
            {showProgramPicker && (
              <View style={styles.pickerOptions}>
                {PROGRAMS.map((p) => (
                  <Pressable
                    key={p.value}
                    style={[
                      styles.pickerOption,
                      program === p.value && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setProgram(p.value);
                      setShowProgramPicker(false);
                      if (errors.program) setErrors((prev) => ({ ...prev, program: '' }));
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{p.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {errors.program ? <Text style={styles.errorText}>{errors.program}</Text> : null}
          </View>

          {/* Year Level Picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Year Level</Text>
            <Pressable
              style={[
                styles.pickerButton,
                errors.year_level ? styles.pickerError : null,
              ]}
              onPress={() => setShowYearPicker(!showYearPicker)}
              accessibilityLabel="Select Year Level"
              accessibilityRole="button"
            >
              <Text style={[styles.pickerText, !yearLevel && styles.pickerPlaceholder]}>
                {yearLevel ? YEAR_LEVELS.find((y) => y.value === yearLevel)?.label : 'Select year level'}
              </Text>
            </Pressable>
            {showYearPicker && (
              <View style={styles.pickerOptions}>
                {YEAR_LEVELS.map((y) => (
                  <Pressable
                    key={y.value}
                    style={[
                      styles.pickerOption,
                      yearLevel === y.value && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setYearLevel(y.value);
                      setShowYearPicker(false);
                      if (errors.year_level) setErrors((prev) => ({ ...prev, year_level: '' }));
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{y.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {errors.year_level ? <Text style={styles.errorText}>{errors.year_level}</Text> : null}
          </View>

          {/* Phone Number */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+63</Text>
              </View>
              <View style={styles.phoneInputWrapper}>
                <FormField
                  label=""
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (errors.phone_number) setErrors((prev) => ({ ...prev, phone_number: '' }));
                  }}
                  error={errors.phone_number}
                  placeholder="9XXXXXXXXX"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  pickerError: {
    borderColor: '#DC2626',
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerPlaceholder: {
    color: '#9CA3AF',
  },
  pickerOptions: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#111827',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  phonePrefix: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    marginTop: 0,
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  phoneInputWrapper: {
    flex: 1,
  },
  saveContainer: {
    marginTop: 16,
  },
});
