"use client";

import { usePathname } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/broadcasts": "Broadcasts",
  "/dashboard/suspensions": "Suspensions",
  "/dashboard/calendar": "Events",
  "/dashboard/emergency": "Emergency",
  "/dashboard/analytics": "Analytics",
  "/dashboard/students": "Students",
  "/dashboard/history": "Broadcast History",
  "/dashboard/settings": "Settings",
  "/dashboard/delivery": "Delivery Monitor",
  "/dashboard/feedback": "Feedback",
  "/dashboard/bugs": "Bug Reports",
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

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 backdrop-blur-sm px-6">
      <h1 className="text-sm font-semibold text-zinc-900">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-xs text-zinc-500">{dateStr}</span>
        <div className="h-5 w-px bg-zinc-200 hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-zinc-900">{displayName}</p>
            <p className="text-[10px] text-zinc-500 capitalize">{profile.role.replace("_", " ")}</p>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
            {(profile.first_name?.[0] || profile.email[0]).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
