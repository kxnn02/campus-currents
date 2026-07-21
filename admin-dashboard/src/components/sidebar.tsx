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

export function Sidebar({ profile: _profile }: { profile: Profile }) {
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
      <div className="px-5 pt-7 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
            <img
              src="/logo.png"
              alt="CampusCurrents"
              className="h-8 w-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-[17px] font-bold leading-tight text-white tracking-tight">
              CampusCurrents
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#E4BEBA]/70">
              Emergency Systems
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-[#AF101A] text-white shadow-md shadow-[#AF101A]/20"
                  : "text-[#F0DDD9]/80 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-white" : "text-[#E4BEBA]/60")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 pt-4">
        {/* Emergency Alert Button */}
        <button
          onClick={() => router.push("/dashboard/emergency")}
          className="w-full rounded-lg bg-[#BA1A1A] py-3 text-center text-sm font-bold text-white shadow-lg shadow-[#BA1A1A]/25 transition-all duration-200 hover:bg-[#DC2626] hover:shadow-[#DC2626]/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Emergency Alert
        </button>

        {/* Divider */}
        <div className="my-4 border-t border-white/[0.08]" />

        {/* Help & Support links */}
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 text-[13px] font-normal text-[#F0DDD9]/60 hover:text-[#F0DDD9] transition-colors rounded-lg hover:bg-white/[0.04]"
        >
          <HelpCircle className="h-4 w-4" />
          Help Center
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 text-[13px] font-normal text-[#F0DDD9]/60 hover:text-[#F0DDD9] transition-colors rounded-lg hover:bg-white/[0.04]"
        >
          <Headphones className="h-4 w-4" />
          Support
        </Link>

        {/* Sign Out */}
        <div className="mt-4 pt-4 border-t border-white/[0.08]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-[#E4BEBA]/70 hover:text-[#FF8A8A] transition-colors rounded-lg hover:bg-white/[0.04] w-full"
          >
            <LogOut className="h-4 w-4" />
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
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md border border-[#E4BEBA] md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-[#1A1C1C]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-[#1A1C1C] transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-4 rounded-md p-1 hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="h-5 w-5 text-[#F0DDD9]/70" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[264px] flex-col bg-[#1A1C1C] shadow-xl shadow-black/10">
        {sidebarContent}
      </aside>
    </>
  );
}
