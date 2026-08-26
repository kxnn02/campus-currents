"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Megaphone,
  CloudOff,
  CalendarDays,
  AlertTriangle,
  LayoutDashboard,
  Settings,
  LogOut,
  Users,
  BarChart3,
  MessageSquare,
  Bug,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  adminOnly?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: "Monitor",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
    ],
  },
  {
    label: "Communicate",
    items: [
      { href: "/dashboard/broadcasts", label: "Broadcasts", icon: Megaphone },
      { href: "/dashboard/suspensions", label: "Suspensions", icon: CloudOff, adminOnly: true },
      { href: "/dashboard/calendar", label: "Events", icon: CalendarDays, adminOnly: true },
      { href: "/dashboard/emergency", label: "Emergency", icon: AlertTriangle, adminOnly: true },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/students", label: "Students", icon: Users, adminOnly: true },
      { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare, adminOnly: true },
      { href: "/dashboard/bugs", label: "Bug Reports", icon: Bug, adminOnly: true },
      { href: "/dashboard/settings", label: "Settings", icon: Settings, adminOnly: true },
    ],
  },
];

export function Sidebar({ profile: _profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isFaculty = _profile.role === "faculty";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B91C1C]">
            <img
              src="/logo.png"
              alt="CampusCurrents"
              className="h-5 w-5 object-contain brightness-0 invert"
            />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">
              CampusCurrents
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !isFaculty || !item.adminOnly);
          if (visibleItems.length === 0) return null;
          return (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {visibleItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-100",
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-white" : "text-zinc-500"
                    )} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B91C1C]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 border-t border-zinc-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors rounded-md hover:bg-white/[0.04] w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-md bg-white p-2 shadow-sm border border-zinc-200 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4 text-zinc-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col bg-[#18181B] transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-3 rounded-md p-1 hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="h-4 w-4 text-zinc-400" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col bg-[#18181B] border-r border-zinc-800">
        {sidebarContent}
      </aside>
    </>
  );
}
