import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shield, User, Users, BarChart3, Key } from "lucide-react";
import { ChangePinForm } from "./change-pin-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch all admin accounts
  const { data: admins } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, office, can_send_emergency")
    .in("role", ["admin", "super_admin"])
    .order("role", { ascending: false });

  // System stats
  const { count: totalStudents } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  const { count: totalBroadcasts } = await supabase
    .from("broadcasts")
    .select("*", { count: "exact", head: true })
    .eq("is_deleted", false);

  const { count: deliveredCount } = await supabase
    .from("push_tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "delivered");

  const { count: totalTickets } = await supabase
    .from("push_tickets")
    .select("*", { count: "exact", head: true });

  const deliveryRate = totalTickets && totalTickets > 0
    ? Math.round(((deliveredCount ?? 0) / totalTickets) * 100)
    : 0;

  const isSuperAdmin = profile?.role === "super_admin";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Settings</h2>
        <p className="text-[#5B403D] mt-1">
          Account and system configuration.
        </p>
      </div>

      {/* Your Account */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[#AF101A]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#5B403D]">
            Your Account
          </h3>
        </div>
        <div className="rounded-xl border border-[#E4BEBA] bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-[#5B403D] uppercase tracking-wide">Name</p>
              <p className="mt-1 text-sm font-semibold text-[#1A1C1C]">
                {profile?.first_name} {profile?.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#5B403D] uppercase tracking-wide">Email</p>
              <p className="mt-1 text-sm text-[#1A1C1C]">{profile?.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#5B403D] uppercase tracking-wide">Role</p>
              <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isSuperAdmin
                  ? "bg-[#AF101A]/10 text-[#AF101A]"
                  : "bg-[#5E67C2]/10 text-[#5E67C2]"
              }`}>
                <Shield className="h-3 w-3" />
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-[#5B403D] uppercase tracking-wide">Office</p>
              <p className="mt-1 text-sm text-[#1A1C1C]">{profile?.office || "—"}</p>
            </div>
          </div>
          {isSuperAdmin && (
            <div className="mt-4 pt-4 border-t border-[#F0DDD9]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-xs text-[#5B403D]">Emergency trigger permission enabled</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Change PIN — super_admin only */}
      {isSuperAdmin && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-[#AF101A]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#5B403D]">
              Emergency PIN
            </h3>
          </div>
          <div className="rounded-xl border border-[#E4BEBA] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#5B403D] mb-4">
              This PIN is required to trigger emergency alerts. Keep it confidential.
            </p>
            <ChangePinForm />
          </div>
        </section>
      )}

      {/* Admin Accounts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#AF101A]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#5B403D]">
            Admin Accounts
          </h3>
        </div>
        <div className="rounded-xl border border-[#E4BEBA] bg-white overflow-hidden shadow-sm">
          <div className="divide-y divide-[#F0DDD9]">
            {admins && admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    admin.role === "super_admin" ? "bg-[#AF101A]" : "bg-[#5E67C2]"
                  }`}>
                    {admin.first_name?.[0]}{admin.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1C1C]">
                      {admin.first_name} {admin.last_name}
                    </p>
                    <p className="text-xs text-[#5B403D]">{admin.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    admin.role === "super_admin"
                      ? "bg-[#AF101A]/10 text-[#AF101A]"
                      : "bg-[#5E67C2]/10 text-[#5E67C2]"
                  }`}>
                    {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span>
                  <p className="text-[10px] text-[#5B403D] mt-0.5">{admin.office || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Stats */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#AF101A]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#5B403D]">
            System Overview
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#5B403D] uppercase tracking-wide">Registered Students</p>
            <p className="mt-2 text-2xl font-bold text-[#1A1C1C] tabular-nums">{(totalStudents ?? 0).toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#5B403D] uppercase tracking-wide">Total Broadcasts</p>
            <p className="mt-2 text-2xl font-bold text-[#1A1C1C] tabular-nums">{(totalBroadcasts ?? 0).toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#5B403D] uppercase tracking-wide">Push Delivery Rate</p>
            <p className="mt-2 text-2xl font-bold text-[#16A34A] tabular-nums">{deliveryRate}%</p>
          </div>
          <div className="rounded-xl border border-[#E4BEBA] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#5B403D] uppercase tracking-wide">Admin Accounts</p>
            <p className="mt-2 text-2xl font-bold text-[#1A1C1C] tabular-nums">{admins?.length ?? 0}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
