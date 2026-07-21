import { describe, it, expect } from 'vitest';
import { suspensionAppliesToStudent } from '@/lib/suspensions';
import type { ClassSuspension, Level, Program } from '@/types/database';

/** Helper to create a minimal suspension with only scope and scope_detail */
function makeSuspension(
  scope: ClassSuspension['scope'],
  scope_detail?: Record<string, unknown> | null
): ClassSuspension {
  return {
    id: 'test-id',
    declared_by: 'admin-1',
    source: 'school_admin',
    reason: 'other',
    scope,
    scope_detail: scope_detail ?? null,
    duration: 'full_day',
    suspension_date: '2025-07-15',
    status: 'active',
    broadcast_id: null,
    school_id: 'school-1',
    created_at: '2025-07-15T00:00:00Z',
    updated_at: '2025-07-15T00:00:00Z',
  };
}

describe('suspensionAppliesToStudent', () => {
  // --- all_levels ---
  it('all_levels → applies to everyone', () => {
    const suspension = makeSuspension('all_levels');
    expect(suspensionAppliesToStudent(suspension, { level: 'college', program: 'BSIT' })).toBe(true);
    expect(suspensionAppliesToStudent(suspension, { level: 'senior_high', program: 'STEM' })).toBe(true);
    expect(suspensionAppliesToStudent(suspension, { level: null, program: null })).toBe(true);
  });

  // --- college_only ---
  it('college_only → true for college students', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('college_only'), { level: 'college', program: 'BSIT' })
    ).toBe(true);
  });

  it('college_only → false for non-college students', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('college_only'), { level: 'senior_high', program: 'STEM' })
    ).toBe(false);
    expect(
      suspensionAppliesToStudent(makeSuspension('college_only'), { level: null, program: null })
    ).toBe(false);
  });

  // --- grade_school_only ---
  it('grade_school_only → true for grade_school students', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('grade_school_only'), { level: 'grade_school', program: null })
    ).toBe(true);
  });

  it('grade_school_only → false for college students', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('grade_school_only'), { level: 'college', program: 'BSIT' })
    ).toBe(false);
  });

  // --- junior_high_only ---
  it('junior_high_only → true for junior_high', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('junior_high_only'), { level: 'junior_high', program: null })
    ).toBe(true);
  });

  it('junior_high_only → false for college', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('junior_high_only'), { level: 'college', program: 'BSIT' })
    ).toBe(false);
  });

  // --- senior_high_only ---
  it('senior_high_only → true for senior_high', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('senior_high_only'), { level: 'senior_high', program: 'STEM' })
    ).toBe(true);
  });

  it('senior_high_only → false for college', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('senior_high_only'), { level: 'college', program: 'BSIT' })
    ).toBe(false);
  });

  // --- k12_only ---
  it('k12_only → true for grade_school', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('k12_only'), { level: 'grade_school', program: null })
    ).toBe(true);
  });

  it('k12_only → true for junior_high', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('k12_only'), { level: 'junior_high', program: null })
    ).toBe(true);
  });

  it('k12_only → true for senior_high', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('k12_only'), { level: 'senior_high', program: 'STEM' })
    ).toBe(true);
  });

  it('k12_only → false for college', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('k12_only'), { level: 'college', program: 'BSIT' })
    ).toBe(false);
  });

  it('k12_only → false for law', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('k12_only'), { level: 'law', program: 'JD' })
    ).toBe(false);
  });

  // --- law_only ---
  it('law_only → true for law students', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('law_only'), { level: 'law', program: 'JD' })
    ).toBe(true);
  });

  it('law_only → false for college students', () => {
    expect(
      suspensionAppliesToStudent(makeSuspension('law_only'), { level: 'college', program: 'BSIT' })
    ).toBe(false);
  });

  // --- specific_programs ---
  it('specific_programs → true when student program is in list', () => {
    const suspension = makeSuspension('specific_programs', { programs: ['BSIT', 'BSBA'] });
    expect(suspensionAppliesToStudent(suspension, { level: 'college', program: 'BSIT' })).toBe(true);
  });

  it('specific_programs → false when student program is NOT in list', () => {
    const suspension = makeSuspension('specific_programs', { programs: ['BSIT', 'BSBA'] });
    expect(suspensionAppliesToStudent(suspension, { level: 'college', program: 'BSA' })).toBe(false);
  });

  it('specific_programs → false when scope_detail is null', () => {
    const suspension = makeSuspension('specific_programs', null);
    expect(suspensionAppliesToStudent(suspension, { level: 'college', program: 'BSIT' })).toBe(false);
  });

  it('specific_programs → false when programs list is empty', () => {
    const suspension = makeSuspension('specific_programs', { programs: [] });
    expect(suspensionAppliesToStudent(suspension, { level: 'college', program: 'BSIT' })).toBe(false);
  });

  it('specific_programs → false when profile.program is null', () => {
    const suspension = makeSuspension('specific_programs', { programs: ['BSIT'] });
    expect(suspensionAppliesToStudent(suspension, { level: 'college', program: null })).toBe(false);
  });

  // --- unrecognized scope (fail-open) ---
  it('unrecognized scope → fail-open (returns true)', () => {
    const suspension = makeSuspension('unknown_scope' as any);
    expect(suspensionAppliesToStudent(suspension, { level: 'college', program: 'BSIT' })).toBe(true);
  });
});
