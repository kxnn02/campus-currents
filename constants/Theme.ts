/**
 * Campus Currents Design System
 * ==============================
 * Single source of truth for all visual tokens across the mobile app.
 * Based on the Figma Design Guide for SSC-R Manila.
 *
 * Usage:
 *   import { theme } from '@/constants/Theme';
 *   // Access: theme.colors.primary, theme.typography.h1, theme.spacing.lg, etc.
 *
 * For theme-aware components (light/dark), use:
 *   import { useThemeColors } from '@/constants/Theme';
 *   const colors = useThemeColors();
 */

import { useColorScheme, TextStyle, ViewStyle } from 'react-native';

// ============================================================
// PALETTE — Raw color values (never use directly in components)
// ============================================================

const palette = {
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue800: '#1E40AF',
  blue900: '#1E3A5F',

  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red200: '#FECACA',
  red600: '#DC2626',
  red800: '#991B1B',

  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber500: '#F59E0B',
  amber800: '#92400E',

  green50: '#ECFDF5',
  green100: '#D1FAE5',
  green600: '#16A34A',

  purple500: '#8B5CF6',
  orange500: '#F97316',
  teal500: '#14B8A6',
  yellow500: '#EAB308',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  white: '#FFFFFF',
  black: '#000000',
} as const;

// ============================================================
// SEMANTIC COLORS — Light & Dark themes
// ============================================================

const lightColors = {
  // Brand
  primary: palette.blue800,
  primaryLight: palette.blue500,
  primaryBg: palette.blue50,

  // Backgrounds
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,

  // Text
  text: palette.gray900,
  textSecondary: palette.gray500,
  textTertiary: palette.gray400,
  textInverse: palette.white,

  // Borders
  border: palette.gray200,
  borderLight: palette.gray100,
  borderFocus: palette.blue500,

  // Interactive
  tint: palette.blue800,
  tabIconDefault: palette.gray400,
  tabIconSelected: palette.blue800,

  // Semantic
  success: palette.green600,
  successBg: palette.green50,
  error: palette.red600,
  errorBg: palette.red50,
  warning: palette.amber500,
  warningBg: palette.amber50,

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: palette.gray200,
} as const;

const darkColors = {
  primary: palette.blue400,
  primaryLight: palette.blue500,
  primaryBg: palette.gray800,

  background: palette.gray900,
  surface: palette.gray800,
  surfaceElevated: palette.gray700,

  text: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray500,
  textInverse: palette.gray900,

  border: palette.gray700,
  borderLight: palette.gray800,
  borderFocus: palette.blue400,

  tint: palette.blue400,
  tabIconDefault: palette.gray500,
  tabIconSelected: palette.blue400,

  success: palette.green600,
  successBg: palette.gray800,
  error: palette.red600,
  errorBg: palette.gray800,
  warning: palette.amber500,
  warningBg: palette.gray800,

  overlay: 'rgba(0, 0, 0, 0.7)',
  shimmer: palette.gray700,
} as const;

// ============================================================
// TIER & STATUS COLORS — Shared across themes
// ============================================================

const tier = {
  emergency: palette.red600,
  emergencyBg: palette.red50,
  emergencyText: palette.red800,
  important: palette.amber500,
  importantBg: palette.amber50,
  importantText: palette.amber800,
  routine: palette.blue500,
  routineBg: palette.blue50,
  routineText: palette.blue800,
} as const;

const status = {
  on: palette.green600,
  onBg: palette.green50,
  suspended: palette.red600,
  suspendedBg: palette.red50,
  monitoring: palette.amber500,
  monitoringBg: palette.amber50,
} as const;

const calendar = {
  academic: palette.blue500,
  schoolEvent: palette.green600,
  orgActivity: palette.purple500,
  administrative: palette.orange500,
  holiday: palette.red600,
  sports: palette.teal500,
  seminar: palette.yellow500,
} as const;

// ============================================================
// TYPOGRAPHY
// ============================================================

const typography = {
  // Display — for hero elements (status screen)
  display: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  } as TextStyle,

  // Headings
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  } as TextStyle,
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,
  h3: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,

  // Labels & captions
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
  overline: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,

  // Buttons
  button: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  buttonLarge: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  } as TextStyle,
} as const;

// ============================================================
// SPACING — 4px base, 8-point scale
// ============================================================

const spacing = {
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// ============================================================
// BORDER RADIUS
// ============================================================

const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  full: 9999,
} as const;

// ============================================================
// SHADOWS — Platform-aware elevation
// ============================================================

const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  sm: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  md: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  lg: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  xl: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
} as const;

// ============================================================
// ANIMATION DURATIONS
// ============================================================

const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: { tension: 80, friction: 12 },
} as const;

// ============================================================
// LAYOUT CONSTANTS
// ============================================================

const layout = {
  screenPaddingHorizontal: spacing.xl,
  screenPaddingVertical: spacing.lg,
  cardGap: spacing.md,
  sectionGap: spacing['2xl'],
  tabBarHeight: 56,
  headerHeight: 56,
  inputHeight: 44,
  buttonHeight: 48,
  buttonHeightLarge: 56,
  statusCircleSize: 200,
  avatarSizeSm: 40,
  avatarSizeMd: 64,
  avatarSizeLg: 80,
  iconSizeSm: 16,
  iconSizeMd: 20,
  iconSizeLg: 24,
  maxContentWidth: 600,
} as const;

// ============================================================
// COMPONENT PRESETS — Theme-aware style generators
// ============================================================

/**
 * Returns component style presets for the given color set (light or dark).
 * Use with `useThemeColors()` to get theme-aware component styles:
 *
 * @example
 * const colors = useThemeColors();
 * const comp = getComponentStyles(colors);
 * <View style={comp.card}>...</View>
 */
export function getComponentStyles(colors: { [K in keyof typeof lightColors]: string }) {
  return {
    // Card base
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      ...shadows.md,
    } as ViewStyle,

    // Card without shadow (for lists)
    cardFlat: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    } as ViewStyle,

    // Input field
    input: {
      height: layout.inputHeight,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      fontSize: 15,
    } as ViewStyle,

    // Primary button
    buttonPrimary: {
      height: layout.buttonHeight,
      borderRadius: radius.lg,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing['2xl'],
    } as ViewStyle,

    // Secondary/outline button
    buttonSecondary: {
      height: layout.buttonHeight,
      borderRadius: radius.lg,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing['2xl'],
    } as ViewStyle,

    // Danger button
    buttonDanger: {
      height: layout.buttonHeight,
      borderRadius: radius.lg,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing['2xl'],
    } as ViewStyle,

    // Large emergency button (panic-tap friendly)
    buttonEmergencyLarge: {
      minHeight: layout.buttonHeightLarge,
      borderRadius: radius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing['2xl'],
    } as ViewStyle,

    // Notification card (feed)
    notificationCard: {
      borderRadius: radius.lg,
      borderLeftWidth: 4,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.xs + 2,
      backgroundColor: colors.surface,
      ...shadows.md,
    } as ViewStyle,

    // Badge / pill
    badge: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
    } as ViewStyle,

    // Divider
    divider: {
      height: 1,
      backgroundColor: colors.border,
    } as ViewStyle,

    // Screen container
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    // Scroll content padding
    scrollContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing['3xl'],
    } as ViewStyle,
  };
}

// Static fallback for non-hook contexts (light mode default)
const components = getComponentStyles(lightColors);

// ============================================================
// EXPORTED THEME OBJECT
// ============================================================

export const theme = {
  palette,
  colors: {
    light: lightColors,
    dark: darkColors,
    tier,
    status,
    calendar,
  },
  typography,
  spacing,
  radius,
  shadows,
  animation,
  layout,
  components,
} as const;

// ============================================================
// THEME HOOK — Returns colors for current color scheme
// ============================================================

/**
 * Returns the color set for the current device color scheme (light/dark).
 * Use this in components instead of accessing theme.colors.light directly.
 *
 * @example
 * const colors = useThemeColors();
 * <View style={{ backgroundColor: colors.background }}>
 *   <Text style={{ color: colors.text }}>Hello</Text>
 * </View>
 */
export function useThemeColors() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}

/**
 * Returns theme-aware component style presets for the current color scheme.
 *
 * @example
 * const comp = useThemeComponents();
 * <View style={comp.card}>...</View>
 */
export function useThemeComponents() {
  const colors = useThemeColors();
  return getComponentStyles(colors);
}

// ============================================================
// TYPE EXPORTS
// ============================================================

export type ThemeColors = typeof lightColors | typeof darkColors;
export type TierName = keyof typeof tier;
export type StatusName = 'on' | 'suspended' | 'monitoring';
export type CalendarCategory = keyof typeof calendar;
export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;
export type ShadowKey = keyof typeof shadows;
