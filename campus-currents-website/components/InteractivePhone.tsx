"use client";

import React, { useState, useCallback, memo } from "react";

/**
 * InteractivePhone — Pixel-perfect replica of the Campus Currents mobile app.
 * Matches the exact design tokens from constants/Theme.ts:
 * - Colors: primary #AF101A, background #F9F9F9, text #1A1C1C, textSecondary #5B403D, muted #8B7370
 * - Borders: #E4BEBA (warm pinkish-tan), light #F0DDD9
 * - Tier colors: emergency #BA1A1A, important #F89C00, routine #5E67C2
 * - Active tab: #623A00 (amber dark), inactive: #5B403D
 */

type Tab = "feed" | "status" | "calendar" | "profile";

/* ─── Design Tokens (from Theme.ts) ─── */
const c = {
  primary: "#AF101A",
  primaryBg: "#FEF2F2",
  background: "#F9F9F9",
  surface: "#FFFFFF",
  text: "#1A1C1C",
  textSecondary: "#5B403D",
  textTertiary: "#8B7370",
  border: "#E4BEBA",
  borderLight: "#F0DDD9",
  tabActive: "#623A00",
  tabInactive: "#5B403D",
  emergency: "#BA1A1A",
  emergencyBg: "#FEF2F2",
  important: "#F89C00",
  importantBg: "#FFFBEB",
  routine: "#5E67C2",
  routineBg: "#EFF6FF",
  green: "#16A34A",
  greenBg: "#ECFDF5",
};

/* ─── Feed Screen ─── */
const FeedScreen = memo(function FeedScreen() {
  const [filter, setFilter] = useState<string>("all");

  const filters = [
    { key: "all", label: "All", color: c.primary },
    { key: "emergency", label: "Emergency", color: c.emergency },
    { key: "important", label: "Important", color: c.important },
    { key: "routine", label: "Routine", color: c.routine },
  ];

  const broadcasts = [
    {
      id: 1,
      tier: "emergency" as const,
      title: "Lockdown Drill — Building A",
      body: "Follow safety protocols immediately. Proceed to nearest exit and await further instructions.",
      time: "2h ago",
      channel: "security",
      pinned: true,
    },
    {
      id: 2,
      tier: "important" as const,
      title: "Classes Suspended — Habagat",
      body: "Per Manila LGU advisory, all classes from Pre-K to College are suspended effective immediately.",
      time: "4h ago",
      channel: "suspension",
      pinned: true,
    },
    {
      id: 3,
      tier: "routine" as const,
      title: "Foundation Day 2026",
      body: "Join us on August 28 for the annual celebration. All departments welcome.",
      time: "6h ago",
      channel: "event",
      pinned: false,
    },
    {
      id: 4,
      tier: "routine" as const,
      title: "Enrollment Advisory — SY 2026-2027",
      body: "Online enrollment opens July 25. Slots are limited for transferees.",
      time: "1d ago",
      channel: "academic",
      pinned: false,
    },
    {
      id: 5,
      tier: "important" as const,
      title: "Water Service Interruption",
      body: "Maynilad scheduled maintenance on July 24. Bring your own water.",
      time: "2d ago",
      channel: "general",
      pinned: false,
    },
    {
      id: 6,
      tier: "routine" as const,
      title: "Club Fair — Registration Open",
      body: "Sign up for clubs and organizations at the Student Center lobby.",
      time: "3d ago",
      channel: "event",
      pinned: false,
    },
  ];

  const tierColor = { emergency: c.emergency, important: c.important, routine: c.routine };
  const tierLabel = { emergency: "Emergency", important: "Important", routine: "Routine" };
  const tierBg = { emergency: c.emergencyBg, important: c.importantBg, routine: c.routineBg };

  const filtered = filter === "all" ? broadcasts : broadcasts.filter((b) => b.tier === filter);

  return (
    <div className="flex flex-col h-full">
      {/* Sticky filter bar — matches app's stickyHeaderIndices */}
      <div className="shrink-0 py-2" style={{ backgroundColor: c.background }}>
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex items-center gap-1 px-3 py-[6px] rounded-full border whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: active ? f.color + "18" : c.surface,
                  borderColor: active ? f.color : c.borderLight,
                }}
              >
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: active ? f.color : c.textSecondary }}
                >
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable feed — matches FlatList with card margins */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-3 space-y-[10px]">
        {filtered.map((item) => {
          const color = tierColor[item.tier];
          return (
            <div
              key={item.id}
              className="rounded-xl border overflow-hidden shadow-sm"
              style={{
                borderColor: c.borderLight,
                borderLeftWidth: "4px",
                borderLeftColor: color,
                backgroundColor: c.surface,
              }}
            >
              <div className="py-3.5 pl-4 pr-3.5">
                {/* Top row: tier pill + pin */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                    style={{ color, backgroundColor: tierBg[item.tier] }}
                  >
                    {tierLabel[item.tier]}
                  </span>
                  {item.pinned && (
                    <span className="text-[10px]" style={{ color: c.textSecondary }}>📌</span>
                  )}
                </div>
                {/* Title */}
                <p
                  className="text-[13px] font-bold leading-tight mb-1"
                  style={{ color: c.text, letterSpacing: "-0.2px" }}
                >
                  {item.title}
                </p>
                {/* Body — 2 lines */}
                <p
                  className="text-[11px] leading-[16px] mb-2 line-clamp-2"
                  style={{ color: c.textSecondary }}
                >
                  {item.body}
                </p>
                {/* Bottom: timestamp + channel pill */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: c.textTertiary }}>
                    {item.time}
                  </span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-xl"
                    style={{ backgroundColor: c.borderLight, color: c.textSecondary }}
                  >
                    {item.channel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ─── Status Screen ─── */
const StatusScreen = memo(function StatusScreen() {
  return (
    <div className="flex flex-col h-full overflow-y-auto overscroll-contain">
      {/* Status indicator hero — matches the pulsing glow layout */}
      <div className="flex flex-col items-center py-6">
        {/* Glow layers */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow */}
          <div
            className="absolute w-[120px] h-[120px] rounded-full animate-pulse"
            style={{ backgroundColor: c.green, opacity: 0.12 }}
          />
          {/* Inner glow */}
          <div
            className="absolute w-[108px] h-[108px] rounded-full"
            style={{ backgroundColor: c.green + "20" }}
          />
          {/* Main circle */}
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: c.green }}
          >
            <span className="text-3xl text-white">✓</span>
          </div>
        </div>

        {/* Status text */}
        <p
          className="mt-4 text-[14px] font-bold tracking-wide uppercase text-center"
          style={{ color: c.green }}
        >
          Classes are ON
        </p>
        <p className="mt-1 text-[11px] text-center px-8" style={{ color: c.textSecondary }}>
          You&apos;re all set for today.
        </p>
        <p className="mt-2 text-[10px]" style={{ color: c.textTertiary }}>
          As of 8:30 AM
        </p>
      </div>

      {/* Upcoming heads-up section */}
      <div className="px-4 mt-2">
        <p
          className="text-[9px] font-semibold tracking-widest uppercase mb-2"
          style={{ color: c.textSecondary }}
        >
          ⚠️ Heads Up
        </p>
        <div
          className="rounded-lg border overflow-hidden flex"
          style={{ borderColor: c.important, backgroundColor: c.importantBg }}
        >
          <div className="w-1" style={{ backgroundColor: c.important }} />
          <div className="p-3 flex-1">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[11px] font-bold" style={{ color: "#92400E" }}>
                Thursday, Jul 24
              </span>
              <span className="text-[9px] font-semibold" style={{ color: "#92400E" }}>
                Tomorrow
              </span>
            </div>
            <p className="text-[10px]" style={{ color: "#78350F" }}>
              Manila LGU · Typhoon Signal #2 · Full day
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-4 mt-5">
        <p
          className="text-[9px] font-semibold tracking-widest uppercase mb-2"
          style={{ color: c.textSecondary }}
        >
          Recent History
        </p>
        {[
          { date: "Jul 18, 2026", source: "Manila LGU" },
          { date: "Jul 10, 2026", source: "CHED Advisory" },
          { date: "Jun 28, 2026", source: "SSC-R President" },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-lg border flex overflow-hidden mb-2"
            style={{ borderColor: c.borderLight, backgroundColor: c.surface }}
          >
            <div className="w-1" style={{ backgroundColor: c.emergency }} />
            <div className="p-3 flex-1">
              <p className="text-[11px] font-semibold" style={{ color: c.text }}>
                {item.date}
              </p>
              <p className="text-[10px]" style={{ color: c.textSecondary }}>
                {item.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ─── Calendar Screen ─── */
const CalendarScreen = memo(function CalendarScreen() {
  const [selectedDay, setSelectedDay] = useState(22);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // July 2026 starts on Wednesday (offset 3)
  const offset = 3;
  const totalDays = 31;

  // Events with category colors matching the app's calendar categories
  const events: Record<number, { color: string; title: string; source: string }> = {
    15: { color: c.emergency, title: "Lockdown Drill", source: "📢 Announcement" },
    22: { color: c.green, title: "Foundation Day Prep", source: "📅 Event" },
    24: { color: c.emergency, title: "Classes Suspended", source: "🔴 Suspension" },
    28: { color: "#5E67C2", title: "Foundation Day", source: "📅 Event" },
  };

  const selectedEvent = events[selectedDay] ?? null;

  return (
    <div className="flex flex-col h-full overflow-y-auto overscroll-contain px-4 py-3">
      {/* Month header — matches CalendarGrid navigation */}
      <div className="flex items-center justify-between mb-3">
        <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: c.borderLight }}>
          <span className="text-[11px]" style={{ color: c.text }}>‹</span>
        </button>
        <span className="text-[14px] font-bold" style={{ color: c.text }}>
          July 2026
        </span>
        <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: c.borderLight }}>
          <span className="text-[11px]" style={{ color: c.text }}>›</span>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {days.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold" style={{ color: c.textTertiary }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-0.5 mb-4">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const event = events[day];
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="aspect-square rounded-lg flex flex-col items-center justify-center mx-0.5 transition-colors"
              style={{
                backgroundColor: isSelected ? c.primary : "transparent",
              }}
            >
              <span
                className="text-[10px]"
                style={{
                  color: isSelected ? "#fff" : c.text,
                  fontWeight: isSelected ? 700 : 400,
                }}
              >
                {day}
              </span>
              {event && (
                <div
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ backgroundColor: isSelected ? "#fff" : event.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date events — matches UnifiedItemCard */}
      <p className="text-[12px] font-semibold mb-2" style={{ color: c.text }}>
        {new Date(2026, 6, selectedDay).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>

      {selectedEvent ? (
        <div
          className="rounded-lg border overflow-hidden flex"
          style={{ borderColor: c.border, backgroundColor: c.surface }}
        >
          <div className="w-1" style={{ backgroundColor: selectedEvent.color }} />
          <div className="p-3 flex-1">
            <p className="text-[9px] mb-0.5" style={{ color: c.textTertiary }}>
              {selectedEvent.source}
            </p>
            <p className="text-[12px] font-semibold" style={{ color: c.text }}>
              {selectedEvent.title}
            </p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-lg border p-4 flex flex-col items-center"
          style={{ borderColor: c.border, backgroundColor: c.surface }}
        >
          <span className="text-xl mb-1">📅</span>
          <p className="text-[10px]" style={{ color: c.textSecondary }}>
            Nothing scheduled for this day
          </p>
        </div>
      )}
    </div>
  );
});

/* ─── Profile Screen ─── */
const ProfileScreen = memo(function ProfileScreen() {
  return (
    <div className="flex flex-col h-full overflow-y-auto overscroll-contain px-4 py-4">
      {/* Header card with banner + avatar overlap (matches profile.tsx) */}
      <div
        className="rounded-lg border overflow-hidden mb-5 shadow-sm"
        style={{ borderColor: c.border, backgroundColor: c.surface }}
      >
        {/* Banner */}
        <div className="h-14" style={{ backgroundColor: c.primaryBg }} />
        {/* Avatar + info */}
        <div className="flex flex-col items-center pb-4 -mt-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border-[3px] shadow-md"
            style={{ backgroundColor: c.primaryBg, borderColor: c.surface }}
          >
            <span className="text-[18px] font-bold" style={{ color: c.primary }}>JD</span>
          </div>
          <p className="mt-2 text-[13px] font-bold" style={{ color: c.text }}>
            Juan Dela Cruz
          </p>
          <p className="text-[10px]" style={{ color: c.textSecondary }}>
            2021-00123
          </p>
          <span
            className="mt-1.5 text-[9px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: c.primaryBg, color: c.primary }}
          >
            BSIT
          </span>
        </div>
      </div>

      {/* Academic Information section */}
      <p
        className="text-[9px] font-semibold tracking-widest uppercase mb-1.5 ml-1"
        style={{ color: c.textSecondary }}
      >
        Academic Information
      </p>
      <div
        className="rounded-lg border mb-5 shadow-sm"
        style={{ borderColor: c.border, backgroundColor: c.surface }}
      >
        {[
          { icon: "🎓", label: "Program", value: "BSIT" },
          { icon: "📚", label: "Year Level", value: "3" },
          { icon: "✉️", label: "Email", value: "jdelacruz@sscrmnl.edu.ph" },
        ].map((row, i, arr) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: c.primaryBg }}
              >
                <span className="text-[12px]">{row.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px]" style={{ color: c.textSecondary }}>{row.label}</p>
                <p className="text-[11px] font-semibold truncate" style={{ color: c.text }}>{row.value}</p>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div className="mx-3.5 h-px" style={{ backgroundColor: c.borderLight }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Preferences section */}
      <p
        className="text-[9px] font-semibold tracking-widest uppercase mb-1.5 ml-1"
        style={{ color: c.textSecondary }}
      >
        Preferences
      </p>
      <div
        className="rounded-lg border shadow-sm"
        style={{ borderColor: c.border, backgroundColor: c.surface }}
      >
        {[
          { icon: "✏️", label: "Edit Profile" },
          { icon: "🔔", label: "Notification Preferences" },
          { icon: "💬", label: "Send Feedback" },
          { icon: "🐛", label: "Report a Bug" },
        ].map((row, i, arr) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2.5 px-3.5 py-3">
              <span className="text-[12px]">{row.icon}</span>
              <span className="flex-1 text-[11px] font-medium" style={{ color: c.text }}>
                {row.label}
              </span>
              <span className="text-[10px]" style={{ color: c.textTertiary }}>›</span>
            </div>
            {i < arr.length - 1 && (
              <div className="mx-3.5 h-px" style={{ backgroundColor: c.borderLight }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Version */}
      <p className="text-[9px] text-center mt-4" style={{ color: c.textTertiary }}>
        CampusCurrents v1.0.0
      </p>
    </div>
  );
});

/* ─── Tab Bar Icons (FontAwesome-style, matching app's TabBarIcon) ─── */
function TabIcon({ tab, active }: { tab: Tab; active: boolean }) {
  const color = active ? c.tabActive : c.tabInactive;

  // SVG icons matching FontAwesome names from _layout.tsx: list-alt, graduation-cap, calendar, user
  const icons: Record<Tab, React.ReactNode> = {
    feed: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
        <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2zm0-3.5h12v2H3v-2zm0-7h18v2H3V7.5z" />
      </svg>
    ),
    status: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
      </svg>
    ),
    calendar: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
        <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
      </svg>
    ),
    profile: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  };

  return icons[tab];
}

/* ─── Main Component ─── */
export default function InteractivePhone({ defaultTab = "feed" }: { defaultTab?: Tab }) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const handleTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "feed", label: "Feed" },
    { key: "status", label: "Status" },
    { key: "calendar", label: "Calendar" },
    { key: "profile", label: "Profile" },
  ];

  // Tab titles matching the app's header
  const tabTitles: Record<Tab, string> = {
    feed: "Feed",
    status: "Status",
    calendar: "Calendar",
    profile: "Profile",
  };

  return (
    <div className="relative w-[280px] md:w-[300px] h-[560px] md:h-[600px] select-none interactive-phone">
      {/* Phone body */}
      <div
        className="absolute inset-0 rounded-[3rem] border-[8px] border-warm-900 overflow-hidden flex flex-col shadow-2xl shadow-warm-900/10"
        style={{ backgroundColor: c.background }}
      >
        {/* Notch */}
        <div className="shrink-0 h-7 bg-warm-950 flex items-center justify-center">
          <div className="w-16 h-4 rounded-full bg-warm-900" />
        </div>

        {/* Header bar — matches app's headerStyle */}
        <div
          className="shrink-0 flex items-center px-4 py-2.5 border-b"
          style={{
            backgroundColor: c.surface,
            borderBottomColor: c.borderLight,
          }}
        >
          <span className="text-[13px] font-bold" style={{ color: c.text }}>
            {tabTitles[activeTab]}
          </span>
        </div>

        {/* Screen content */}
        <div className="flex-1 min-h-0">
          {activeTab === "feed" && <FeedScreen />}
          {activeTab === "status" && <StatusScreen />}
          {activeTab === "calendar" && <CalendarScreen />}
          {activeTab === "profile" && <ProfileScreen />}
        </div>

        {/* Bottom tab bar — matches app's tabBarStyle exactly */}
        <div
          className="shrink-0 flex justify-around items-center pt-1.5 pb-2 border-t"
          style={{
            backgroundColor: c.background,
            borderTopColor: c.border,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTab(tab.key)}
                className="flex flex-col items-center gap-0.5 px-2 py-0.5"
                aria-label={tab.label}
              >
                <TabIcon tab={tab.key} active={isActive} />
                <span
                  className="text-[9px] font-semibold mt-0.5"
                  style={{ color: isActive ? c.tabActive : c.tabInactive }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
