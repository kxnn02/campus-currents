# Campus Currents

A real-time campus communication system for San Sebastian College – Recoletos, Manila. Delivers instant class suspension alerts, emergency notifications, school event updates, and announcements to students through a mobile app, powered by an admin web dashboard.

## Repository Structure

```
campus-currents/
├── campus-currents-app/        # Mobile app (React Native / Expo SDK 54)
├── admin-dashboard/            # Admin web dashboard (Next.js 15)
├── campus-currents-website/    # Landing page website
├── supabase/                   # Database migrations & Edge Functions
│   ├── migrations/             # Version-controlled schema (36 migrations)
│   └── functions/              # Edge Functions source code
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo SDK 54), TypeScript, expo-router |
| Admin Dashboard | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| Push Notifications | Expo Push API → FCM (two-phase delivery with receipt verification) |
| State Management | TanStack React Query v5 |
| Testing | Vitest + fast-check (property-based testing) |

## Getting Started

### Mobile App

```bash
cd campus-currents-app
npm install
npx expo start --dev-client
```

For push notifications on Android, you need a development build:
```bash
npx eas build --profile development --platform android
```

Run tests:
```bash
npm test
```

### Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
```

Runs at `http://localhost:3000`

### Environment Variables

**Mobile App** (`campus-currents-app/.env`):
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

**Admin Dashboard** (`admin-dashboard/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Features

### Student Mobile App
- **Notification Feed** — Server-side audience-filtered pagination via Postgres RPC, pinned broadcasts
- **Class Suspension Hub** — Three-state status (ON / SUSPENDED TODAY / SUSPENDED TOMORROW) with level-aware scope filtering
- **School Calendar** — Month grid with event dots, category colors, "For [PROGRAM]" labels on targeted events
- **Emergency Overlay** — Full-screen red alert with I'm Safe / Need Help buttons, persists across app relaunch
- **Profile Management** — Google OAuth (SSC-R domain only), auto-level derivation from program
- **Push Notifications** — Tiered Android channels (emergency overrides silent mode), two-phase delivery tracking
- **Notification Preferences** — Server-synced mute settings for routine channels (general/event/academic), enforced at push delivery
- **Realtime Updates** — Live feed, suspension, and emergency state via WebSocket with exponential backoff reconnection
- **Offline Resilience** — Receipt queue, stale data banners, reconnect sync, emergency auth guard (no login redirect during active emergency)

### Admin Web Dashboard
- **Broadcast Management** — Create, edit, delete with audience targeting + confirmation modal before send
- **Real-Time Delivery Monitor** — Honest metrics using "students with push tokens" as denominator
- **Suspension Management** — Template-based quick entry with scope-to-audience mapping, human-readable messages, optional custom message override
- **Emergency System** — PIN validation against stored hash, 5-second countdown, real-time accountability dashboard (Reached/Safe/Need Help/No Response), "Need Help" student list with contact info, False Alarm resolution type
- **Calendar Events** — CRUD with poster upload, audience targeting
- **Analytics** — Delivery stats per broadcast with verified delivery (Expo receipt confirmation)
- **Student Directory** — View all registered students

### Backend & Security
- **Two-Phase Push Delivery** — Edge Function sends via Expo Push API, stores ticket IDs; scheduled checker confirms delivery via Expo Receipts API
- **Stale Token Cleanup** — Automatic `fcm_token` clearance when Expo reports `DeviceNotRegistered`
- **Row Level Security** — Students can only read own profile + admin profiles; cannot insert receipts for other students
- **Webhook Secret** — Push Edge Function validates `X-Webhook-Secret` header, preventing unauthorized external calls
- **Duplicate Emergency Prevention** — Database trigger rejects new emergency while one is active
- **Auto-Level Derivation** — Database trigger sets `level` from `program` on every profile insert/update
- **Version-Controlled Schema** — Full database schema in `supabase/migrations/` (36 migrations)

## Database Schema

Key tables: `profiles`, `broadcasts`, `class_suspensions`, `calendar_events`, `delivery_receipts`, `active_emergencies`, `push_tickets`

All tables have RLS enabled with appropriate policies. See `supabase/migrations/` for full schema.

## Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `push` | Database webhook (on broadcasts INSERT) | Sends push notifications via Expo API with audience filtering |
| `check-push-receipts` | pg_cron (every 60 seconds) | Verifies delivery via Expo Receipts API, cleans stale tokens |

## Testing

```bash
cd campus-currents-app
npm test
```

Unit tests cover:
- `matchesTargetAudience` — audience targeting logic (with property-based tests)
- `getNavigationTarget` — notification routing priority
- `formatRelativeTime` — time display formatting
- `suspensionAppliesToStudent` — scope-to-level matching
- `deriveLevelFromProgram` — program-to-level mapping

## Authors

- Kenneth Clein Fernandez — Lead Developer
- Campus Currents Team — San Sebastian College – Recoletos, Manila

## License

This project is developed as a capstone project for academic purposes.
