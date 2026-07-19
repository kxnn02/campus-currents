# CampusCurrents — Complete Team Guide

> This guide covers everything you need to set up the project on your computer, run both apps, test on your phone, and understand how the system works.

---

## Table of Contents

1. [What is CampusCurrents?](#what-is-campuscurrents)
2. [System Requirements](#system-requirements)
3. [Installation (Step by Step)](#installation-step-by-step)
4. [Running the Mobile App](#running-the-mobile-app)
5. [Running the Admin Dashboard](#running-the-admin-dashboard)
6. [Testing on Your Phone](#testing-on-your-phone)
7. [How the App Works (User Guide)](#how-the-app-works-user-guide)
8. [How the Admin Dashboard Works](#how-the-admin-dashboard-works)
9. [Project Structure Explained](#project-structure-explained)
10. [Common Problems & Fixes](#common-problems--fixes)
11. [Important Notes](#important-notes)

---

## What is CampusCurrents?

CampusCurrents is a two-part campus communication system for SSC-R Manila:

| App | Who uses it | What it does |
|-----|------------|--------------|
| **Mobile App** | Students | Receive announcements, check class suspensions, view calendar, respond to emergencies |
| **Admin Dashboard** | Admins/Faculty | Send broadcasts, declare suspensions, create events, trigger emergency alerts, view analytics |

The backend is **Supabase** (a cloud database + authentication service). You don't need to set up any database — it's already running in the cloud.

---

## System Requirements

You need these installed on your computer:

### Required

| Software | What it is | How to install |
|----------|-----------|----------------|
| **Node.js** (v18+) | JavaScript runtime | Download from https://nodejs.org (pick "LTS" version) |
| **Git** | Version control | Download from https://git-scm.com |
| **VS Code** | Code editor | Download from https://code.visualstudio.com |

### For Testing on Phone

| Software | What it is | How to get it |
|----------|-----------|----------------|
| **Expo Go** | App to run the mobile app on your phone | Search "Expo Go" on Google Play Store or Apple App Store |

### How to Check if You Have Node.js

Open Command Prompt (or Terminal) and type:
```
node --version
```
If you see something like `v18.17.0` or higher, you're good. If it says "not recognized", install Node.js first.

---

## Installation (Step by Step)

### Step 1: Get the Code

Open Command Prompt and navigate to where you want the project:

```bash
cd Desktop
git clone https://github.com/kxnn02/campus-currents.git
cd campus-currents
```

### Step 2: Install Mobile App Dependencies

Navigate to the mobile app folder:

```bash
cd campus-currents-app
npm install
```

This downloads all the libraries the app needs. It may take 2-5 minutes. You'll see a progress bar.

**If you see warnings** — that's normal. Only worry if you see red "ERROR" messages.

### Step 3: Create the Environment File

The app needs connection details for the database. **Check the Messenger group chat** for a file called `CREDENTIALS-FOR-TEAM.md` — it has the exact values to use.

**On Windows:**
1. Open the `campus-currents-app` folder in File Explorer
2. Right-click → New → Text Document
3. Name it `.env` (not `.env.txt` — make sure file extensions are visible in File Explorer settings)
4. Open it in Notepad and paste the values from the credentials file shared in the GC (section "1. Mobile App")
5. Save and close.

> 🔒 **Never commit this file to Git.** It's already excluded via `.gitignore`.

### Step 4: Install Admin Dashboard Dependencies

```bash
cd ../admin-dashboard
npm install
```

### Step 5: Create the Admin Environment File

Create a file called `.env.local` in the `admin-dashboard` folder using the values from the credentials file shared in the GC (section "2. Admin Dashboard").

> 🔒 **Never commit this file to Git.** It's already excluded via `.gitignore`.

### Step 6: Go Back to Root

```bash
cd ..
```

You're now back in the `campus-currents` repo root folder. Setup is complete!

---

## Running the Mobile App

From the `campus-currents-app` folder:

```bash
cd campus-currents-app
npx expo start
```

You'll see something like this in your terminal:

```
▄▄▄▄▄▄▄▄▄▄▄▄▄
█ QR CODE HERE █
▀▀▀▀▀▀▀▀▀▀▀▀▀

› Metro waiting on exp://192.168.1.5:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web
› Press r │ reload app
› Press j │ open debugger
```

**To view on your phone:** Scan the QR code with Expo Go (see next section).

**To view in browser:** Press `w` in the terminal.

**To stop:** Press `Ctrl + C` in the terminal.

---

## Running the Admin Dashboard

Open a **new** Command Prompt window (keep the mobile app running in the first one).

```bash
cd Desktop\campus-currents\admin-dashboard
npm run dev
```

You'll see:

```
▲ Next.js 15.x
- Local:   http://localhost:3000
```

Open http://localhost:3000 in your browser (Chrome recommended).

**Login credentials:** Check the credentials file shared in the GC (section "3. Admin Dashboard Login").

---

## Testing on Your Phone

### Android — Install the Development Build

**📥 Download the APK:** https://expo.dev/accounts/kxnn02/projects/campus-currents/builds/d46e2360-c0e7-480d-be39-54ff5eb0af3e

**Steps:**

1. Open the link above on your **Android phone** (use Chrome)
2. Tap **"Install"** or **"Download"** on the EAS build page
3. Your phone will ask "Allow installation from unknown sources?" → Go to Settings → Allow for your browser → Tap **Install**
4. Once installed, you'll see a **"CampusCurrents"** app on your home screen

### iOS — Install via Expo Go (Temporary)

> ⚠️ Push notifications do NOT work on iOS via Expo Go. For full iOS testing with notifications, a paid Apple Developer account ($99/year) is required to build an IPA. For now, use Expo Go for UI/functionality testing.

1. Install **Expo Go** from the App Store on your iPhone
2. On your computer, run: `npx expo start`
3. Scan the QR code using your iPhone's **Camera app** — it will open in Expo Go
4. Everything works except push notifications

> If the team later gets an Apple Developer account, we can build an iOS development build with: `eas build --platform ios --profile development`

### Connect to the Dev Server (Android with APK)

5. On your computer, run:
```bash
npx expo start --dev-client
```
6. Open the **CampusCurrents** app on your phone (NOT Expo Go)
7. It will show a screen to enter a URL or scan a QR code — scan the QR code from your terminal
8. The app loads with full functionality including **push notifications**

> ✅ The APK only needs to be installed **once**. After that, just run `npx expo start --dev-client` and scan the QR code each time you want to test.

> ⚠️ Your phone and computer must be on the **same WiFi network**. If they're on different networks, use `npx expo start --dev-client --tunnel` instead.

> ⚠️ If the download link expires or the build is outdated, ask the project lead to create a new build with `eas build --platform android --profile development`.

---

## How the App Works (User Guide)

### Student Mobile App — Flow

```
Login (Google SSO) → Profile Completion → Main App (4 tabs)
```

### Tab 1: Feed 📋
- Shows all announcements/broadcasts from the school
- Cards have a **colored left strip** showing urgency:
  - 🔴 Red = Emergency
  - 🟠 Amber = Important (suspensions, urgent news)
  - 🟣 Purple = Routine (events, general announcements)
- Tap a card to see the full announcement
- Pull down to refresh
- Pinned announcements appear at the top

### Tab 2: Status 🏫
- Shows if classes are ON or SUSPENDED right now
- Large green circle = classes are on
- Large red circle = classes are suspended
- When suspended, shows details: source, reason, scope, duration
- Shows recent suspension history at the bottom

### Tab 3: Calendar 📅
- Monthly calendar with colored dots on days with activity
- Tap a date to see what happened/is happening:
  - 📢 Announcements sent on that date
  - 🔴 Suspensions declared for that date
  - 📅 Events scheduled for that date
- Navigate between months with arrow buttons
- Today is auto-selected when you open it

### Tab 4: Profile 👤
- Shows your academic info (program, year, student ID)
- Edit Profile — update your name, program, year level, phone
- Notification Preferences — toggle routine channel notifications
- Sign Out

### Emergency Alert 🚨
- If an emergency is triggered, your screen will turn **solid red**
- You CANNOT dismiss it — you must respond
- Two buttons: "I'M SAFE ✓" or "NEED HELP 🆘"
- After responding, you wait for "ALL CLEAR" from security
- This overrides silent mode (in the full build)

---

## How the Admin Dashboard Works

### Login
- Go to http://localhost:3000
- Enter your admin email and password
- Only accounts with `admin` or `super_admin` role can access

### Dashboard Home
- Overview stats: total broadcasts, active suspensions, upcoming events, active emergencies
- Quick action cards: New Broadcast, Post Suspension, New Event
- Recent broadcasts table with delivery stats

### Broadcasts Page
- View all sent announcements
- **New Broadcast** button opens a form:
  - Title and Body (the message)
  - Tier: Routine / Important / Emergency
  - Channel: General / Academic / Event / Suspension / Security
  - Audience: All Students, or target by Program/Year Level
  - Pin option (pinned broadcasts stay at top of feed)
  - Live notification preview shows how it'll look on phone
- Edit or Delete existing broadcasts from the actions menu (⋯)
- Click a broadcast title to see **real-time delivery stats**

### Suspensions Page
- View all declared suspensions (active and lifted)
- **Declare Suspension** button:
  - Pick a template: Manila LGU, PAGASA Weather, DepEd Order, or School Decision
  - Set the date (defaults to today)
  - Choose source, reason, scope, and duration
  - This automatically creates a broadcast notification for students
- **Lift** button to end an active suspension

### Calendar/Events Page
- View all school calendar events
- **New Event** button:
  - Title, Description, Category (Academic, School Event, Org, etc.)
  - Start/End date and time
  - Location, Organizer name
  - Audience targeting
  - Optional: upload an event poster
- Edit or Delete events from the actions menu

### Emergency Page
- Shows active emergencies (if any) with a pulsing "ACTIVE" badge
- **Trigger Emergency** button:
  1. Select type (Active Threat, Fire, Earthquake, Flooding)
  2. Enter title and instructions
  3. Click Continue
  4. Enter any 4+ character PIN (speed bump, not a real password)
  5. Wait 5 seconds, then confirm
  6. ALL students receive a full-screen red alert on their phones
- **Mark as Resolved** button sends "ALL CLEAR" to all students

### Students Page
- View all registered students
- Search by name, email, or student ID
- Filter by program or year level

### Analytics Page
- Broadcast delivery metrics: delivered count, read count, acknowledged count per broadcast
- Total student count

### History Page
- Complete broadcast history (including deleted ones)
- Filter by tier (Emergency/Important/Routine)
- Search by title

---

## Project Structure Explained

```
campus-currents/                   ← GitHub repo root
├── campus-currents-app/           ← Mobile app folder
│   ├── app/                       ← Mobile app screens
│   │   ├── (auth)/                ← Login screen
│   │   ├── (tabs)/                ← Main tabs (Feed, Status, Calendar, Profile)
│   │   ├── emergency-overlay.tsx  ← Red emergency screen
│   │   ├── broadcast-detail.tsx   ← Full announcement view
│   │   ├── event-detail.tsx       ← Full event view
│   │   └── ...
│   ├── components/                ← Reusable UI pieces (cards, buttons, etc.)
│   ├── lib/                       ← Data fetching, business logic
│   ├── constants/                 ← Colors, theme, design tokens
│   ├── types/                     ← TypeScript type definitions
│   ├── assets/                    ← Images, fonts, icons
│   ├── .env                       ← Database connection (DO NOT SHARE PUBLICLY)
│   ├── app.json                   ← App configuration (name, icons, etc.)
│   └── package.json               ← Dependencies list
│
├── admin-dashboard/               ← Admin web app
│   ├── src/app/                   ← Web pages
│   │   ├── login/                 ← Admin login
│   │   └── dashboard/             ← All admin pages
│   ├── src/components/            ← Reusable web UI pieces
│   ├── src/lib/                   ← Database client
│   ├── .env.local                 ← Database connection
│   └── package.json               ← Dependencies list
│
├── campus-currents-website/       ← Landing page (coming soon)
└── README.md                      ← Project overview
```

---

## Common Problems & Fixes

### "npx expo start" says "command not found"
→ Node.js isn't installed or not in your PATH. Reinstall Node.js and restart your terminal.

### QR code doesn't work / "Network request failed"
→ Your phone and computer aren't on the same WiFi. Either connect to the same network OR use `npx expo start --tunnel`.

### App shows a blank white screen
→ The `.env` file is missing or has wrong content. Double-check it exists in the `campus-currents-app` folder.

### "Unable to resolve module" error
→ Run `npx expo start --clear` to clear the cache. If that doesn't work, delete the `node_modules` folder in `campus-currents-app` and run `npm install` again.

### Admin dashboard says "Access denied"
→ Your account doesn't have admin role. Ask the project lead to update your role in Supabase.

### Metro bundler gets stuck / frozen
→ Press `Ctrl + C` to stop it, then run `npx expo start` again.

### Phone can't connect to dev server
→ Check your computer's firewall. Try disabling Windows Firewall temporarily for testing.

### "Module not found" after pulling new code
→ Run `npm install` again — someone probably added new dependencies.

### Admin dashboard page shows "Error loading..."
→ Check that `.env.local` exists in the `admin-dashboard` folder with the correct Supabase URL.

---

## Important Notes

### For Everyone
- **Never** commit `.env` or `.env.local` files to Git (they contain database keys)
- Always run `npm install` in the relevant folder after pulling new code from Git
- The mobile app and admin dashboard are **separate apps** in separate folders — run them in separate terminal windows

### For Developers
- Mobile app uses **Expo Router** (file-based routing — each file in `campus-currents-app/app/` is a screen)
- Admin dashboard uses **Next.js App Router** (same concept — each folder in `admin-dashboard/src/app/` is a page)
- Database is **Supabase** — you can view/edit data at https://supabase.com/dashboard
- UI styling: Mobile uses React Native `StyleSheet`, Admin uses Tailwind CSS

### For Testing
- To test as a **student**: Use the mobile app, sign in with a Google account
- To test as an **admin**: Use the web dashboard at localhost:3000
- You can have both running at the same time to see real-time updates (e.g., send a broadcast from admin → see it appear on mobile feed)

### Git Workflow
```bash
git pull                    # Get latest changes from team
cd campus-currents-app
npm install                 # Install any new dependencies
npx expo start             # Run the app
```

After making changes:
```bash
git add .
git commit -m "your message about what you changed"
git push
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Install mobile dependencies | `cd campus-currents-app && npm install` |
| Run mobile app | `cd campus-currents-app && npx expo start` |
| Run mobile (tunnel mode) | `cd campus-currents-app && npx expo start --tunnel` |
| Run mobile (dev client) | `cd campus-currents-app && npx expo start --dev-client` |
| Run admin dashboard | `cd admin-dashboard && npm run dev` |
| Clear cache | `cd campus-currents-app && npx expo start --clear` |
| Check Node version | `node --version` |
| Pull latest code | `git pull` |

---

## Contacts & Resources

| Resource | Link |
|----------|------|
| Supabase Dashboard | https://supabase.com/dashboard (ask project lead for access) |
| Expo Dev Console | https://expo.dev |
| Project Lead | [Ask in the group chat] |
| SSC-R Domain | @sscrmnl.edu.ph |

---

*Last updated: July 2026*
