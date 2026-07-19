# Campus Currents

A real-time campus communication system for San Sebastian College – Recoletos, Manila. Delivers instant class suspension alerts, emergency notifications, school event updates, and announcements to students through a mobile app, powered by an admin web dashboard.

## Repository Structure

```
campus-currents/
├── campus-currents-app/        # Mobile app (React Native / Expo SDK 54)
├── admin-dashboard/            # Admin web dashboard (Next.js 15)
├── campus-currents-website/    # Landing page website (coming soon)
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo SDK 54), TypeScript, expo-router |
| Admin Dashboard | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| Push Notifications | Expo Push API → Firebase Cloud Messaging |
| State Management | TanStack React Query v5 |

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
- **Notification Feed** — Infinite scroll, pinned broadcasts, audience-targeted
- **Class Suspension Hub** — Traffic-light style status (ON/SUSPENDED/MONITORING)
- **School Calendar** — Month grid with event dots, category colors, detail views
- **Emergency Overlay** — Full-screen red alert with I'm Safe / Need Help buttons
- **Profile Management** — Google OAuth (SSC-R domain), profile completion
- **Push Notifications** — Tiered Android channels (emergency overrides silent mode)
- **Realtime Updates** — Live feed, suspension, and emergency state via WebSocket
- **Offline Resilience** — Receipt queue, stale data banners, reconnect sync

### Admin Web Dashboard
- **Broadcast Management** — Create, edit, delete with audience targeting
- **Real-Time Delivery Monitor** — Live progress bar with delivered/read/acknowledged counts
- **Suspension Management** — Template-based quick entry
- **Emergency Trigger** — PIN confirmation with 5-second countdown safety
- **Calendar Events** — CRUD with poster upload, audience targeting
- **Analytics** — Delivery stats per broadcast, total engagement
- **Student Directory** — View all registered students

## Authors

- Kenneth Clein Fernandez — Lead Developer
- Campus Currents Team — San Sebastian College – Recoletos, Manila

## License

This project is developed as a capstone project for academic purposes.
