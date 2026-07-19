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
  // Brand — SSC-R Manila warm palette (from Figma)
  red900: '#AF101A',    // Brand primary (header titles)
  red700: '#BA1A1A',    // Emergency / danger
  red50: '#FEF2F2',
  red100: '#FEE2E2',

  amber500: '#F89C00',  // Important tier / active tab highlight
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber800: '#623A00',  // Active tab text (dark brown)

  green600: '#16A34A',  // Success / classes ON
  green50: '#ECFDF5',
  green100: '#D1FAE5',

  indigo500: '#5E67C2', // Pinned badge / accent
  purple500: '#9333EA', // Org activity category
  orange500: '#F97316',
  teal500: '#14B8A6',
  yellow500: '#EAB308',

  // Warm neutrals (from Figma — NOT cool grays)
  warm50: '#F9F9F9',    // Background (warm off-white)
  warm100: '#F5F0EF',   // Surface elevated
  warmBorder: '#E4BEBA', // Card borders (pinkish-tan)
  warmBorderLight: '#F0DDD9', // Lighter border variant

  // Text colors (warm brown tones from Figma)
  textDark: '#1A1C1C',  // Primary text (near-black)
  textBrown: '#5B403D', // Secondary text (warm brown)
  textMuted: '#8B7370', // Tertiary/muted text

  white: '#FFFFFF',
  black: '#000000',

  // Legacy (kept for backwards compatibility where needed)
  blue50: '#EFF6FF',
  blue500: '#3B82F6',
  blue800: '#1E40AF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const;

// ============================================================
// SEMANTIC COLORS — Light & Dark themes
// ============================================================

const lightColors = {
  // Brand
  primary: palette.red900,         // SSC-R red (header titles, brand accent)
  primaryLight: palette.amber500,  // Amber for active states
  primaryBg: palette.red50,        // Light red background

  // Backgrounds
  background: palette.warm50,      // Warm off-white (#F9F9F9)
  surface: palette.white,          // Card backgrounds
  surfaceElevated: palette.white,

  // Text (warm brown tones from Figma)
  text: palette.textDark,          // #1A1C1C
  textSecondary: palette.textBrown, // #5B403D (warm brown)
  textTertiary: palette.textMuted,  // #8B7370
  textInverse: palette.white,

  // Borders (warm pinkish-tan from Figma)
  border: palette.warmBorder,      // #E4BEBA
  borderLight: palette.warmBorderLight, // Lighter variant
  borderFocus: palette.red900,

  // Interactive
  tint: palette.red900,            // Brand red for CTAs
  tabIconDefault: palette.textBrown, // Warm brown inactive
  tabIconSelected: palette.amber800, // Dark amber active

  // Semantic
  success: palette.green600,
  successBg: palette.green50,
  error: palette.red700,
  errorBg: palette.red50,
  warning: palette.amber500,
  warningBg: palette.amber50,

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: palette.warmBorder,
} as const;

const darkColors = {
  primary: palette.amber500,
  primaryLight: palette.amber500,
  primaryBg: palette.gray800,

  background: '#1A1A1A',
  surface: '#252525',
  surfaceElevated: '#2F2F2F',

  text: '#F5F0EF',
  textSecondary: '#BBA9A5',
  textTertiary: '#8B7370',
  textInverse: palette.textDark,

  border: '#3D3332',
  borderLight: '#2F2828',
  borderFocus: palette.amber500,

  tint: palette.amber500,
  tabIconDefault: '#8B7370',
  tabIconSelected: palette.amber500,

  success: palette.green600,
  successBg: '#1A2A1F',
  error: '#E85454',
  errorBg: '#2A1A1A',
  warning: palette.amber500,
  warningBg: '#2A2518',

  overlay: 'rgba(0, 0, 0, 0.7)',
  shimmer: '#3D3332',
} as const;

// ============================================================
// TIER & STATUS COLORS — Shared across themes
// ============================================================

const tier = {
  emergency: palette.red700,       // #BA1A1A from Figma
  emergencyBg: palette.red50,
  emergencyText: palette.red700,
  important: palette.amber500,     // #F89C00 from Figma
  importantBg: palette.amber50,
  importantText: palette.amber800,
  routine: palette.indigo500,      // #5E67C2 from Figma (pinned/routine blue-purple)
  routineBg: palette.blue50,
  routineText: palette.indigo500,
} as const;

const status = {
  on: palette.green600,
  onBg: palette.green50,
  suspended: palette.red700,
  suspendedBg: palette.red50,
  monitoring: palette.amber500,
  monitoringBg: palette.amber50,
} as const;

const calendar = {
  academic: palette.blue500,
  schoolEvent: palette.green600,
  orgActivity: palette.purple500,
  administrative: palette.orange500,
  holiday: palette.red700,
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
  // Always use light mode — app does not follow system dark mode
  return lightColors;
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
