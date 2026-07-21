import { describe, it, expect } from 'vitest';
import { deriveLevelFromProgram } from '@/lib/suspensions';
import type { Program } from '@/types/database';

describe('deriveLevelFromProgram', () => {
  // --- College programs ---
  const collegePrograms: Program[] = ['BSIT', 'BSBA', 'BSA', 'BSED', 'BEED', 'AB_PSYCH', 'AB_COMM', 'OTHER'];

  it.each(collegePrograms)('%s → college', (program) => {
    expect(deriveLevelFromProgram(program)).toBe('college');
  });

  // --- Law program ---
  it('JD → law', () => {
    expect(deriveLevelFromProgram('JD')).toBe('law');
  });

  // --- ETEEAP program ---
  it('ETEEAP → eteeap', () => {
    expect(deriveLevelFromProgram('ETEEAP')).toBe('eteeap');
  });

  // --- Senior High programs ---
  const seniorHighPrograms: Program[] = ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL'];

  it.each(seniorHighPrograms)('%s → senior_high', (program) => {
    expect(deriveLevelFromProgram(program)).toBe('senior_high');
  });

  // --- All programs are mapped ---
  it('every Program value maps to a valid Level', () => {
    const allPrograms: Program[] = [
      'BSIT', 'BSBA', 'BSA', 'BSED', 'BEED', 'AB_PSYCH', 'AB_COMM',
      'JD', 'ETEEAP', 'STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'OTHER',
    ];
    const validLevels = ['grade_school', 'junior_high', 'senior_high', 'college', 'law', 'eteeap'];

    for (const program of allPrograms) {
      const level = deriveLevelFromProgram(program);
      expect(validLevels).toContain(level);
    }
  });
});
