"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Command Center",
  "/dashboard/broadcasts": "Broadcasts",
  "/dashboard/suspensions": "Class Suspensions",
  "/dashboard/calendar": "Calendar Events",
  "/dashboard/emergency": "Emergency Management",
  "/dashboard/analytics": "Analytics",
  "/dashboard/students": "Students",
  "/dashboard/history": "Broadcast History",
  "/dashboard/settings": "Settings",
  "/dashboard/delivery": "Delivery Monitor",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const segments = pathname.split("/");
  while (segments.length > 2) {
    segments.pop();
    const parent = segments.join("/");
    if (pageTitles[parent]) return pageTitles[parent];
  }
  return "Dashboard";
}

export function DashboardHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  const displayName = profile.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : profile.email;

  // Show current date for context — admins need to confirm what day's data they're seeing
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#C4C5D5] bg-white px-6">
      <div>
        <h2 className="text-xl font-semibold text-[#8D1515]">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        {/* Current date — important for suspension/event context */}
        <span className="hidden sm:block text-xs text-[#444653]">{dateStr}</span>
        {/* Notification bell — links to broadcasts for now */}
        <Link
          href="/dashboard/history"
          className="relative rounded-lg p-2 hover:bg-[#FFF1F1] transition-colors"
          title="Recent activity"
        >
          <Bell className="h-5 w-5 text-[#444653]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DC2626] border-2 border-white" />
        </Link>
        {/* Divider */}
        <div className="h-8 w-px bg-[#C4C5D5] hidden sm:block" />
        {/* Admin profile */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-[#141B2B]">{displayName}</p>
            <p className="text-xs text-[#444653] capitalize">{profile.role.replace("_", " ")}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#1E40AF] bg-[#F1F3FF] text-sm font-bold text-[#1E40AF]">
            {(profile.first_name?.[0] || profile.email[0]).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
