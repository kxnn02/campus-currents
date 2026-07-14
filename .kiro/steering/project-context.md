# CampusCurrents

## Stack
React Native (Expo SDK 54, Expo Router), Supabase (Auth, Realtime, Edge Functions), TypeScript strict.

## Structure
- `app/(tabs)/` — tab screens: index (Feed), status, calendar, profile
- `app/(auth)/` — login, register (to be created)
- `lib/` — supabase client, notifications helper
- `types/` — TypeScript interfaces for DB tables
- `constants/Colors.ts` — all colors (tier, status, calendar categories)
- `components/` — shared UI components
- `hooks/` — custom hooks (data fetching with TanStack Query)

## Rules
- TypeScript always. No `any`.
- `StyleSheet.create()` for styles. Use `Colors` from constants — no hardcoded hex.
- `FlatList` for lists. `SafeAreaView` from `react-native-safe-area-context`.
- Supabase client from `lib/supabase.ts` only. TanStack Query for fetching.
- Dark mode: use `useColorScheme()` + `Colors[colorScheme ?? 'light']`.
- No new dependencies without explicit approval.
- No tests, no refactoring unless asked. Ship fast — deadline July 28.
- Env vars use `EXPO_PUBLIC_*` prefix. No secrets in source files.

## Types
All DB types are in `types/database.ts`: Student, Admin, Broadcast, ClassSuspension, CalendarEvent, DeliveryReceipt. Import from `@/types/database`.
