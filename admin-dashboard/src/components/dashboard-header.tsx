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
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#F0DDD9] bg-white/80 backdrop-blur-md px-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1C1C] tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {/* Current date */}
        <span className="hidden sm:block text-xs font-medium text-[#5B403D]">{dateStr}</span>

        {/* Notification bell */}
        <Link
          href="/dashboard/history"
          className="relative rounded-lg p-2 hover:bg-[#FFF1ED] transition-colors duration-150"
          title="Recent activity"
        >
          <Bell className="h-5 w-5 text-[#5B403D]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#AF101A] ring-2 ring-white" />
        </Link>

        {/* Divider */}
        <div className="h-8 w-px bg-[#F0DDD9] hidden sm:block" />

        {/* Admin profile */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-[#1A1C1C]">{displayName}</p>
            <p className="text-[11px] text-[#5B403D] capitalize">{profile.role.replace("_", " ")}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#AF101A] text-sm font-bold text-white shadow-sm">
            {(profile.first_name?.[0] || profile.email[0]).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
