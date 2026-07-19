"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Megaphone,
  CloudOff,
  CalendarDays,
  AlertTriangle,
  BarChart3,
  Users,
  History,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

const navItems = [
  { href: "/dashboard/broadcasts", label: "Broadcasts", icon: Megaphone },
  { href: "/dashboard/suspensions", label: "Suspensions", icon: CloudOff },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/emergency", label: "Emergency", icon: AlertTriangle },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/history", label: "History", icon: History },
];

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = profile.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`
    : profile.email;

  return (
    <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Brand Header */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="CampusCurrents"
            className="h-10 w-10 rounded"
          />
          <div>
            <h1 className="text-[15px] font-bold leading-tight text-[#8E0002]">
              CampusCurrents
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Emergency Systems
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Emergency Alert — Always visible, high priority placement */}
      <div className="p-2">
        <Button
          variant="destructive"
          className="w-full font-bold shadow-md bg-[#DC2626] hover:bg-[#DC2626]/90"
          onClick={() => router.push("/dashboard/emergency")}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Emergency Alert
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded-[4px] px-4 py-2 text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-[#8D1515] text-white shadow-sm"
                  : "text-[#444653] hover:bg-[#8D1515]/10 hover:text-[#8D1515]"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom section */}
      <div className="p-4 space-y-3">
        {/* User info */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8E0002]/10 text-xs font-bold text-[#8E0002]">
            {(profile.first_name?.[0] || profile.email[0]).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground capitalize">
              {profile.role.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-1 py-1 text-sm font-semibold text-[#BA1A1A] hover:text-[#8E0002] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
