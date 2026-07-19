/**
 * Colors — Compatibility layer
 * ============================
 * This file re-exports color tokens from the canonical Theme.ts design system.
 * Existing screens can continue importing `Colors` without changes.
 *
 * For new code, prefer importing directly from '@/constants/Theme':
 *   import { useThemeColors, theme } from '@/constants/Theme';
 */

import { theme } from './Theme';

const Colors = {
  light: theme.colors.light,
  dark: theme.colors.dark,
  tier: theme.colors.tier,
  status: theme.colors.status,
  calendar: theme.colors.calendar,
};

export default Colors;
