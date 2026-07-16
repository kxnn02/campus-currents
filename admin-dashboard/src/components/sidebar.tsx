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
  LogOut,
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
    <aside className="flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <h1 className="text-lg font-bold">Campus Currents</h1>
        <p className="text-xs text-muted-foreground">Admin Dashboard</p>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4">
        <div className="mb-3">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground capitalize">{profile.role.replace("_", " ")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
