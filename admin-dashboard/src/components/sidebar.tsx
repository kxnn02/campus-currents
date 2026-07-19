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
  History,
  Settings,
  LogOut,
  HelpCircle,
  Headphones,
  Radio,
  Users,
  BarChart3,
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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/broadcasts", label: "New Broadcast", icon: Megaphone },
  { href: "/dashboard/suspensions", label: "Post Suspension", icon: CloudOff },
  { href: "/dashboard/calendar", label: "New Event", icon: CalendarDays },
  { href: "/dashboard/emergency", label: "Emergency", icon: AlertTriangle },
  { href: "/dashboard/history", label: "Broadcast History", icon: History },
  { href: "/dashboard/delivery", label: "Delivery Monitor", icon: Radio },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape key
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
      {/* Brand Header */}
      <div className="px-4 pt-6 pb-9">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded">
            <img
              src="/logo.png"
              alt="CampusCurrents"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-[20px] font-bold leading-7 text-[#8E0002]">
              CampusCurrents
            </h1>
            <p className="text-[12px] font-normal uppercase tracking-[0.6px] text-[#444653]">
              Emergency Systems
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded px-4 py-2 text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-[#8D1515] text-white"
                  : "text-[#444653] hover:bg-[#8D1515]/10 hover:text-[#8D1515]"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#C4C5D5] px-4 pt-4 pb-4">
        <div className="border-t border-[#C4C5D5] pt-6 space-y-1">
          {/* Emergency Alert Button */}
          <button
            onClick={() => router.push("/dashboard/emergency")}
            className="w-full rounded bg-[#DC2626] py-4 text-center text-base font-bold text-white shadow-lg transition-colors hover:bg-[#DC2626]/90 flex items-center justify-center gap-2"
          >
            <AlertTriangle className="h-[17px] w-[17px]" />
            Emergency Alert
          </button>

          {/* Help & Support links */}
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-4 px-2 pt-7 pb-2 text-base font-normal text-[#444653] hover:text-[#8D1515] transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            Help Center
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-4 px-2 py-2 text-base font-normal text-[#444653] hover:text-[#8D1515] transition-colors"
          >
            <Headphones className="h-[17px] w-5" />
            Support
          </Link>
        </div>

        {/* Sign Out */}
        <div className="pt-8">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 text-sm font-semibold text-[#BA1A1A] hover:text-[#8E0002] transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md border border-[#C4C5D5] md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-[#444653]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[#C4C5D5] bg-[#FFF1F1] transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 rounded-md p-1 hover:bg-[#8D1515]/10"
          aria-label="Close menu"
        >
          <X className="h-5 w-5 text-[#444653]" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[280px] flex-col border-r border-[#C4C5D5] bg-[#FFF1F1]">
        {sidebarContent}
      </aside>
    </>
  );
}
