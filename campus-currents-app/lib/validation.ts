import { Program } from '@/types/database';

/**
 * Valid programs as defined in the database schema.
 */
const VALID_PROGRAMS: Program[] = [
  'BSIT', 'BSBA', 'BSA', 'BSED', 'BEED',
  'AB_PSYCH', 'AB_COMM', 'JD', 'ETEEAP',
  'STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'OTHER',
];

export interface ProfileCreateInput {
  student_id: string;       // YYYY-NNNNN format
  first_name: string;
  last_name: string;
  program: Program;
  year_level: number;       // 1-4
  section?: string;         // optional — not collected in form
  phone_number: string;     // 10 digits after +63
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates that a student ID is exactly 10 digits (e.g., 2024101291).
 */
export function validateStudentId(id: string): boolean {
  return /^\d{10}$/.test(id);
}

/**
 * Validates that a phone number is exactly 10 digits.
 * This is the number portion after the +63 country code prefix.
 */
export function validatePhoneNumber(phone: string): boolean {
  return /^\d{10}$/.test(phone);
}

/**
 * Validates that an email address belongs to the SSC-R Manila domain.
 * Must have a non-empty local part and end with @sscrmnl.edu.ph.
 */
export function isValidSSCREmail(email: string): boolean {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;
  return localPart.length > 0 && domain === 'sscrmnl.edu.ph';
}

/**
 * Validates the entire profile creation form.
 * Returns a ValidationResult with isValid and field-keyed errors.
 */
export function validateProfileForm(data: ProfileCreateInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!validateStudentId(data.student_id)) {
    errors.student_id = 'Student ID must be exactly 10 digits';
  }

  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.first_name = 'First name is required';
  }

  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.last_name = 'Last name is required';
  }

  if (!VALID_PROGRAMS.includes(data.program)) {
    errors.program = 'Please select a valid program';
  }

  if (
    !Number.isInteger(data.year_level) ||
    data.year_level < 1 ||
    data.year_level > 5
  ) {
    errors.year_level = 'Year level must be between 1 and 5';
  }

  if (!validatePhoneNumber(data.phone_number)) {
    errors.phone_number = 'Phone number must be exactly 10 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
