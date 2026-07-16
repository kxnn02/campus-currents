# Campus Currents

A real-time campus communication system for San Sebastian College – Recoletos, Manila. Delivers instant class suspension alerts, emergency notifications, school event updates, and announcements to students through a mobile app, powered by an admin web dashboard.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Student Mobile    │     │   Admin Dashboard    │     │    Supabase     │
│   (React Native)    │◄────│     (Next.js)        │────►│   (PostgreSQL)  │
│                     │     │                      │     │   Auth, RLS     │
└─────────┬───────────┘     └──────────────────────┘     │   Realtime      │
          │                                              │   Storage       │
          │  Push Notifications                          └────────┬────────┘
          │◄─────────────────────────────────────────────────────┘
          │         Edge Function → Expo Push API → FCM
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo SDK 54), TypeScript, expo-router |
| Admin Dashboard | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| Push Notifications | Expo Push API → Firebase Cloud Messaging |
| State Management | TanStack React Query v5 |
| Offline Support | AsyncStorage queue with sync on reconnect |

## Features

### Student Mobile App
- **Notification Feed** — Infinite scroll, pinned broadcasts, audience-targeted
- **Class Suspension Hub** — Traffic-light style status (ON/SUSPENDED/MONITORING)
- **School Calendar** — Month grid with event dots, category colors, detail views
- **Emergency Overlay** — Full-screen red alert with I'm Safe / Need Help buttons
- **Profile Management** — Google OAuth (SSC-R domain), profile completion
- **Push Notifications** — Tiered Android channels (emergency overrides silent mode)
- **Realtime Updates** — Live feed, suspension, and emergency state via WebSocket
- **Offline Resilience** — Receipt queue, stale data banners, reconnect sync
- **Dark Mode** — Full theme support

### Admin Web Dashboard
- **Broadcast Management** — Create, edit, delete with audience targeting
- **Real-Time Delivery Monitor** — Live progress bar with delivered/read/acknowledged counts
- **Suspension Management** — Template-based quick entry (Manila LGU, PAGASA, DepEd, School)
- **Emergency Trigger** — PIN confirmation with 5-second countdown safety
- **Calendar Events** — CRUD with poster upload, audience targeting
- **Analytics** — Delivery stats per broadcast, total engagement
- **Student Directory** — View all registered students
- **Broadcast History** — Filterable archive with tier/search
- **Push Preview** — Live notification mockup while composing

## Project Structure

```
campus-currents/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Login flow
│   ├── (tabs)/             # Main tab navigation (Feed, Status, Calendar, Profile)
│   ├── broadcast-detail.tsx
│   ├── emergency-overlay.tsx
│   ├── event-detail.tsx
│   ├── notification-preferences.tsx
│   ├── post-acknowledgment.tsx
│   ├── profile-completion.tsx
│   └── profile-edit.tsx
├── components/             # Reusable UI components
├── lib/                    # Business logic, API hooks, utilities
├── constants/              # Design system (colors, etc.)
├── types/                  # TypeScript type definitions
├── admin-dashboard/        # Next.js admin app (monorepo)
│   └── src/
│       ├── app/dashboard/  # Admin pages
│       ├── components/     # Admin UI components
│       └── lib/            # Supabase client setup
└── assets/                 # Fonts, images
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Supabase account with project configured
- Firebase project with `google-services.json`

### Mobile App

```bash
cd campus-currents
npm install
npx expo start --dev-client
```

For push notifications on Android, you need a development build:
```bash
npx eas build --profile development --platform android
```

### Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
```

Runs at `http://localhost:3000`

### Environment Variables

**Mobile App** (`.env`):
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

**Admin Dashboard** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Student/admin user profiles (linked to Supabase Auth) |
| `broadcasts` | Announcements with tier (routine/important/emergency) |
| `class_suspensions` | Suspension records with source, scope, duration |
| `calendar_events` | School calendar events with categories |
| `delivery_receipts` | Push delivery tracking (delivered, read, acknowledged) |
| `active_emergencies` | Active emergency alerts with resolution tracking |

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Push Notification Flow

1. Admin creates broadcast → row inserted into `broadcasts` table
2. PostgreSQL trigger fires → calls Supabase Edge Function via `pg_net`
3. Edge Function queries matching student tokens, applies audience filtering
4. Sends batch notifications via Expo Push API (100 per batch)
5. FCM delivers to Android devices with tiered channel importance
6. Mobile app handles: foreground banner, background notification, tap navigation

## Authors

- Kenneth Clein Fernandez — Lead Developer
- Campus Currents Team — San Sebastian College – Recoletos, Manila

## License

This project is developed as a capstone project for academic purposes.
