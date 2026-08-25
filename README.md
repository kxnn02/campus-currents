<h1 align="center">
  <br>
  <img src="campus-currents-website/public/images/logo.png" alt="CampusCurrents" width="80">
  <br>
  CampusCurrents
  <br>
</h1>

<p align="center">
  <strong>Real-time campus communication for SSC-R Manila</strong>
</p>

<p align="center">
  Instant class suspension alerts · Emergency notifications · School event updates · Targeted announcements
</p>

<p align="center">
  <a href="https://github.com/kxnn02/campus-currents/releases/tag/v1.0.0-beta.1">
    <img src="https://img.shields.io/badge/Download-Android%20Beta-AF101A?style=for-the-badge&logo=android&logoColor=white" alt="Download Beta">
  </a>
</p>

---

## Overview

CampusCurrents is a full-stack campus communication system built for San Sebastian College – Recoletos, Manila. It delivers real-time alerts, class suspension updates, and emergency notifications to students through a mobile app, managed by an admin web dashboard.

**Built as a Software Engineering project** by BSIT students with production-grade architecture.

## System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        MA[📱 Mobile App<br/>Expo SDK 54 / React Native]
        AD[🖥️ Admin Dashboard<br/>Next.js 15]
        WEB[🌐 Landing Page<br/>Next.js 16]
    end

    subgraph Backend["Backend Layer — Supabase"]
        AUTH[🔐 Auth<br/>Google OAuth + Email/Password]
        DB[(🗄️ PostgreSQL<br/>10 tables · RLS · 43 migrations)]
        RT[⚡ Realtime<br/>WebSocket]
        EF[☁️ Edge Functions<br/>Deno Runtime]
        ST[📦 Storage<br/>broadcast-images bucket]
    end

    subgraph External["External Services"]
        EXPO[📤 Expo Push API]
        FCM[🔔 FCM<br/>Firebase Cloud Messaging]
    end

    MA <-->|Auth + Queries| AUTH
    MA <-->|Live Updates| RT
    MA <-->|Data, RLS enforced| DB
    AD <-->|SSR + Auth| AUTH
    AD <-->|CRUD, RLS enforced| DB
    AD -->|Image Upload| ST
    DB -.->|WAL replication| RT
    DB -->|pg_net async POST on INSERT| EF
    EF -->|Send Push Batch| EXPO
    EXPO -.->|Delivery Receipts, polled every minute| EF
    EXPO -->|Deliver| FCM
    FCM -->|Push, even if app closed| MA
```

## Push Notification Flow

```mermaid
flowchart TB
    A["🖥️ Admin Dashboard<br/>INSERT broadcast"]
    B["🗄️ Supabase DB<br/>AFTER INSERT trigger → pg_net async POST<br/>Bearer service_role token"]
    C["☁️ Edge Function<br/>Query students with a push token<br/>paginated, 1000/page"]
    D["☁️ Edge Function<br/>filter by audience · drop muted channels<br/>routine only · dedupe by token"]
    E["🗄️ Supabase DB<br/>Create delivery_receipts<br/>delivered_at = NULL"]
    F["📤 Expo Push API<br/>Send push batch, 100/batch"]
    G["🗄️ Supabase DB<br/>Store push_tickets<br/>status = pending/failed"]
    H["🔔 FCM<br/>Relay notification"]
    I["📱 Student Phone<br/>Deliver — even with the app closed"]
    J["☁️ Edge Function<br/>pg_cron runs check-push-receipts<br/>every minute"]
    K["📤 Expo Push API<br/>Check receipt status<br/>300/batch, tickets ≥30s old"]
    L["🗄️ Supabase DB<br/>Set delivered_at · clear invalid fcm_token<br/>mark tickets &gt;24h old as failed"]

    A --> B --> C --> D --> E --> F
    F --> G
    F --> H --> I
    G -.->|~1 min later| J --> K --> L
```

## Emergency Response Flow

```mermaid
stateDiagram-v2
    [*] --> Idle : no active emergency

    Idle --> PinConfirm : admin clicks "Trigger Emergency"
    PinConfirm --> Idle : cancelled
    PinConfirm --> Countdown : PIN verified (bcrypt)

    Countdown --> Active : 5s countdown elapses

    state Active {
        [*] --> Notifying
        Notifying --> AwaitingAck : Realtime + push delivered, overlay shown
        AwaitingAck --> Acknowledged : student responds Safe / Need Help
    }

    Active --> Resolved : admin marks All Clear
    Active --> FalseAlarm : admin marks False Alarm
    Resolved --> Idle
    FalseAlarm --> Idle

    note left of PinConfirm
        only super_admin may trigger
        or resolve an emergency
    end note
    note left of Active
        a DB trigger blocks a second
        emergency while this one is active
    end note
    note right of AwaitingAck
        write retried 3x on failure,
        then queued on-device so the
        overlay still clears
    end note
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Mobile App | React Native (Expo) | SDK 54 |
| Mobile Router | expo-router | v6 |
| Admin Dashboard | Next.js | 15.5 |
| Landing Page | Next.js | 16.2 |
| Language | TypeScript | 5.9 |
| Database | PostgreSQL (Supabase) | — |
| Auth | Supabase Auth + Google OAuth | — |
| Realtime | Supabase Realtime (WebSocket) | — |
| Edge Functions | Deno (Supabase Functions) | — |
| Push Notifications | Expo Push API → FCM | — |
| State Management | TanStack React Query | v5 |
| Styling (Mobile) | React Native StyleSheet | — |
| Styling (Web) | Tailwind CSS | v4 |
| UI Components | shadcn/ui | — |
| Testing | Vitest + fast-check | — |
| Build | EAS Build | — |

## Repository Structure

```
campus-currents/
├── campus-currents-app/           # 📱 Mobile app
│   ├── app/                       #    File-based routing (expo-router)
│   │   ├── (auth)/                #    Login flow
│   │   ├── (tabs)/                #    Feed, Status, Calendar, Profile
│   │   ├── emergency-overlay.tsx  #    Full-screen emergency alert
│   │   └── broadcast-detail.tsx   #    Announcement detail view
│   ├── components/                #    Reusable UI (BroadcastCard, StatusIndicator, etc.)
│   ├── lib/                       #    Business logic (feed, suspensions, notifications)
│   ├── constants/                 #    Design tokens (Theme.ts)
│   ├── __tests__/                 #    Unit + property-based tests
│   └── app.json                   #    Expo configuration
│
├── admin-dashboard/               # 🖥️ Admin web app
│   └── src/
│       ├── app/dashboard/         #    Broadcasts, Suspensions, Emergency, Calendar, Analytics
│       ├── components/            #    Dashboard UI components
│       └── lib/                   #    Supabase client, utilities
│
├── campus-currents-website/       # 🌐 Landing page
│   ├── app/                       #    Next.js app router
│   └── components/                #    Hero, Features, InteractivePhone, Team, etc.
│
├── supabase/                      # 🗄️ Backend
│   ├── migrations/                #    43 SQL migration files
│   └── functions/                 #    Edge Functions (push, check-push-receipts)
│
├── TEAM-GUIDE.md                  # 📖 Complete team onboarding guide
└── README.md                      # ← You are here
```

## Features

### Student Mobile App

| Feature | Description |
|---------|-------------|
| **Notification Feed** | Tier-based announcements (Emergency/Important/Routine) with filter chips, pinned posts, infinite scroll |
| **Class Suspension Hub** | Three-state indicator (ON/SUSPENDED/MONITORING) with scope-aware filtering by student level |
| **School Calendar** | Interactive month grid with events, suspensions, and announcements per date |
| **Emergency Overlay** | Full-screen red alert with I'm Safe / Need Help — persists across app relaunch |
| **Push Notifications** | Tiered Android channels (HIGH/MAX importance) — lock screen + heads-up display, auto-retry on failure, catch-up for missed notifications |
| **Notification Preferences** | Per-channel mute for routine alerts, enforced server-side at delivery |
| **Realtime Updates** | WebSocket live feed with exponential backoff reconnection |
| **Offline Resilience** | Stale data banners, connectivity sync, receipt queue |

### Admin Dashboard

| Feature | Description |
|---------|-------------|
| **Broadcast Management** | Create/edit/delete with audience targeting + send confirmation |
| **Suspension Management** | Template-based entry with auto-generated human-readable messages |
| **Emergency System** | PIN-validated trigger, real-time accountability dashboard, "Need Help" contact list |
| **Calendar Events** | CRUD with poster upload and audience targeting |
| **Analytics** | Verified delivery stats per broadcast (Expo receipt confirmation) |
| **Student Directory** | Search and filter all registered students |

### Backend & Security

| Feature | Description |
|---------|-------------|
| **Two-Phase Push Delivery** | Send (high priority) → store tickets → verify receipts → confirm delivery |
| **Stale Token Cleanup** | Auto-clear `fcm_token` on `DeviceNotRegistered` |
| **Row Level Security** | 40+ RLS policies — students read-only, admins write |
| **Dual Auth** | Push function validates `Authorization: Bearer` OR `X-Webhook-Secret` header |
| **Duplicate Emergency Prevention** | DB trigger rejects new emergency while one is active |
| **Auto-Level Derivation** | DB trigger sets `level` from `program` on insert/update |
| **Audit Logging** | All admin actions logged to `audit_log` table with user, action, timestamp |
| **Rate Limiting** | Admin login limited to 5 attempts per 15 minutes per IP |
| **Input Sanitization** | HTML tags stripped from all user inputs; file type validation on uploads |
| **Security Headers** | HSTS, X-Frame-Options, CSP directives on all web apps |
| **Middleware Role Check** | Admin dashboard verifies role at edge (middleware) + layout level |

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- Android phone (for testing push notifications)

### Mobile App

```bash
cd campus-currents-app
npm install
cp .env.example .env    # Fill in Supabase credentials
npx expo start --dev-client
```

### Admin Dashboard

```bash
cd admin-dashboard
npm install
cp .env.local.example .env.local    # Fill in Supabase credentials
npm run dev
```

### Landing Page

```bash
cd campus-currents-website
npm install
npm run dev
```

### Running Tests

```bash
cd campus-currents-app
npm test
```

Tests cover: audience targeting, notification routing, time formatting, suspension scope matching, and level derivation — including property-based tests with fast-check.

## Database Schema

```mermaid
%%{init: {'er': {'layoutDirection': 'TB', 'fontSize': 11, 'diagramPadding': 8, 'entityPadding': 8, 'minEntityWidth': 80, 'minEntityHeight': 32}}}%%
erDiagram
    profiles {
        uuid id PK
        text email
        text first_name
        text last_name
        enum role "student | admin | super_admin"
        enum level
        enum program
        int year_level
        text fcm_token
        text pin_hash
        jsonb notification_preferences
    }

    broadcasts {
        uuid id PK
        uuid sender_id FK
        uuid linked_event_id FK
        enum tier "routine | important | emergency"
        enum channel "suspension | event | academic | security | general"
        text title
        text body
        jsonb target_audience
        bool is_pinned
        bool is_deleted
        timestamp sent_at
    }

    class_suspensions {
        uuid id PK
        uuid declared_by FK
        uuid broadcast_id FK
        date suspension_date
        enum source
        enum reason
        enum scope
        enum duration
        enum status "active | lifted"
    }

    calendar_events {
        uuid id PK
        uuid created_by FK
        text title
        enum category
        timestamp start_date
        timestamp end_date
        jsonb target_audience
        enum status "active | cancelled"
    }

    active_emergencies {
        uuid id PK
        uuid broadcast_id FK
        enum emergency_type "active_threat | fire | earthquake | flooding"
        enum status "active | resolved | false_alarm"
        timestamp resolved_at
    }

    delivery_receipts {
        uuid id PK
        uuid broadcast_id FK
        uuid student_id FK
        enum delivery_method "push | sms | both"
        timestamp delivered_at
        timestamp read_at
        timestamp acknowledged_at
        enum acknowledgment_type "safe | need_help"
    }

    push_tickets {
        uuid id PK
        uuid broadcast_id FK
        uuid student_id FK
        text expo_ticket_id
        enum status "pending | delivered | failed | invalid_token"
        timestamp checked_at
    }

    audit_log {
        uuid id PK
        uuid user_id FK
        text action
        text target_table
        uuid target_id
        jsonb metadata
    }

    feedback {
        uuid id PK
        uuid user_id FK
        int rating "1 to 5"
        text comment
    }

    bug_reports {
        uuid id PK
        uuid user_id FK
        text title
        enum severity "critical | major | minor"
        enum status "open | acknowledged | fixed"
    }

    profiles ||--o{ broadcasts : "sends"
    profiles ||--o{ delivery_receipts : "receives"
    profiles ||--o{ push_tickets : "targeted by"
    profiles ||--o{ class_suspensions : "declares"
    profiles ||--o{ calendar_events : "creates"
    profiles ||--o{ audit_log : "logs"
    profiles ||--o{ feedback : "gives"
    profiles ||--o{ bug_reports : "reports"
    broadcasts ||--o{ delivery_receipts : "tracks"
    broadcasts ||--o{ push_tickets : "has"
    broadcasts |o--o| class_suspensions : "announces"
    broadcasts }o--o| calendar_events : "may link to"
    broadcasts ||--o| active_emergencies : "escalates to"
```

## Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `push` | DB webhook (broadcasts INSERT) | Audience-filtered push notification delivery via Expo API |
| `check-push-receipts` | pg_cron (every 60s) | Verifies delivery via Expo Receipts API, cleans stale tokens |

## Team

| Name | Role |
|------|------|
| Kenneth Clein Fernandez | Project Manager & Lead Developer |
| Chi Leyco | Backend Developer & QA |
| Marvin Miranda | UI/UX Designer & QA |
| Andrei Baguisa | Documentation & QA |
| Jheniel Maglinte | Documentation & QA |

**San Sebastian College – Recoletos, Manila** · BSIT · Software Engineering · 2026

## License

This project is developed for academic purposes as a Software Engineering project. All rights reserved.
