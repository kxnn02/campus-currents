import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { matchesTargetAudience } from '@/lib/feed';
import type { Program } from '@/types/database';

describe('matchesTargetAudience', () => {
  // --- all: true ---
  it('returns true when target_audience is { all: true }', () => {
    expect(matchesTargetAudience({ all: true }, { program: 'BSIT', year_level: 3 })).toBe(true);
  });

  it('returns true when { all: true } regardless of null profile fields', () => {
    expect(matchesTargetAudience({ all: true }, { program: null, year_level: null })).toBe(true);
  });

  // --- programs match / no-match ---
  it('returns true when student program is in programs array', () => {
    expect(
      matchesTargetAudience({ programs: ['BSIT', 'BSBA'] }, { program: 'BSIT', year_level: 2 })
    ).toBe(true);
  });

  it('returns false when student program is NOT in programs array', () => {
    expect(
      matchesTargetAudience({ programs: ['BSIT', 'BSBA'] }, { program: 'BSA', year_level: 2 })
    ).toBe(false);
  });

  it('returns false when programs specified but profile.program is null', () => {
    expect(
      matchesTargetAudience({ programs: ['BSIT'] }, { program: null, year_level: 2 })
    ).toBe(false);
  });

  // --- year_levels match / no-match ---
  it('returns true when student year_level is in year_levels array (numbers)', () => {
    expect(
      matchesTargetAudience({ year_levels: [1, 2, 3] }, { program: 'BSIT', year_level: 2 })
    ).toBe(true);
  });

  it('returns true when student year_level matches year_levels stored as strings', () => {
    expect(
      matchesTargetAudience({ year_levels: ['1', '2', '3'] }, { program: 'BSIT', year_level: 2 })
    ).toBe(true);
  });

  it('returns false when student year_level is NOT in year_levels array', () => {
    expect(
      matchesTargetAudience({ year_levels: [1, 2] }, { program: 'BSIT', year_level: 4 })
    ).toBe(false);
  });

  it('returns false when year_levels specified but profile.year_level is null', () => {
    expect(
      matchesTargetAudience({ year_levels: [1, 2, 3] }, { program: 'BSIT', year_level: null })
    ).toBe(false);
  });

  // --- both programs + year_levels (AND logic) ---
  it('returns true when both programs and year_levels match (AND)', () => {
    expect(
      matchesTargetAudience(
        { programs: ['BSIT', 'BSBA'], year_levels: [2, 3] },
        { program: 'BSIT', year_level: 3 }
      )
    ).toBe(true);
  });

  it('returns false when programs match but year_levels do not (AND)', () => {
    expect(
      matchesTargetAudience(
        { programs: ['BSIT'], year_levels: [2, 3] },
        { program: 'BSIT', year_level: 4 }
      )
    ).toBe(false);
  });

  it('returns false when year_levels match but programs do not (AND)', () => {
    expect(
      matchesTargetAudience(
        { programs: ['BSIT'], year_levels: [2, 3] },
        { program: 'BSA', year_level: 2 }
      )
    ).toBe(false);
  });

  // --- unrecognized structure (fail-open) ---
  it('returns true for empty object (fail-open)', () => {
    expect(matchesTargetAudience({}, { program: 'BSIT', year_level: 1 })).toBe(true);
  });

  it('returns true for unrecognized keys (fail-open)', () => {
    expect(
      matchesTargetAudience({ foo: 'bar', levels: ['college'] }, { program: 'BSIT', year_level: 1 })
    ).toBe(true);
  });

  it('returns true for { all: false } with no programs/year_levels (fail-open)', () => {
    expect(
      matchesTargetAudience({ all: false }, { program: 'BSIT', year_level: 1 })
    ).toBe(true);
  });

  // --- null profile fields ---
  it('handles null program with programs filter', () => {
    expect(
      matchesTargetAudience({ programs: ['BSIT'] }, { program: null, year_level: 1 })
    ).toBe(false);
  });

  it('handles null year_level with year_levels filter', () => {
    expect(
      matchesTargetAudience({ year_levels: [1, 2] }, { program: 'BSIT', year_level: null })
    ).toBe(false);
  });

  // --- Property-based tests with fast-check ---
  describe('property tests', () => {
    const programArb = fc.constantFrom<Program>(
      'BSIT', 'BSBA', 'BSA', 'BSED', 'BEED', 'AB_PSYCH', 'AB_COMM',
      'JD', 'ETEEAP', 'STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'OTHER'
    );

    const profileArb = fc.record({
      program: fc.oneof(programArb, fc.constant(null)),
      year_level: fc.oneof(fc.integer({ min: 1, max: 6 }), fc.constant(null)),
    });

    it('{ all: true } always returns true for any profile', () => {
      fc.assert(
        fc.property(profileArb, (profile) => {
          expect(matchesTargetAudience({ all: true }, profile)).toBe(true);
        })
      );
    });

    it('unrecognized structure (no programs/year_levels) always returns true', () => {
      const weirdAudienceArb = fc.record({
        foo: fc.string(),
        bar: fc.integer(),
      });

      fc.assert(
        fc.property(weirdAudienceArb, profileArb, (audience, profile) => {
          expect(matchesTargetAudience(audience, profile)).toBe(true);
        })
      );
    });

    it('programs filter: profile in list → true, profile not in list → false', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(programArb, { minLength: 1, maxLength: 5 }),
          programArb,
          fc.integer({ min: 1, max: 4 }),
          (programs, studentProgram, yearLevel) => {
            const result = matchesTargetAudience(
              { programs },
              { program: studentProgram, year_level: yearLevel }
            );
            if (programs.includes(studentProgram)) {
              expect(result).toBe(true);
            } else {
              expect(result).toBe(false);
            }
          }
        )
      );
    });
  });
});
