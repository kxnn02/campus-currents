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

  const { data: admins } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, office, can_send_emergency")
    .in("role", ["admin", "super_admin"])
    .order("role", { ascending: false });

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
        <h2 className="text-lg font-semibold text-zinc-900">Settings</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Account and system configuration.</p>
      </div>

      {/* Your Account */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-zinc-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Your Account</h3>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Name</p>
              <p className="mt-1 text-sm font-medium text-zinc-900">{profile?.first_name} {profile?.last_name}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Email</p>
              <p className="mt-1 text-sm text-zinc-700">{profile?.email}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Role</p>
              <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isSuperAdmin ? "bg-red-50 text-red-700" : "bg-indigo-50 text-indigo-700"
              }`}>
                <Shield className="h-3 w-3" />
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Office</p>
              <p className="mt-1 text-sm text-zinc-700">{profile?.office || "—"}</p>
            </div>
          </div>
          {isSuperAdmin && (
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-500">Emergency trigger permission enabled</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Change PIN */}
      {isSuperAdmin && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Key className="h-3.5 w-3.5 text-zinc-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Emergency PIN</h3>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500 mb-4">
              This PIN is required to trigger emergency alerts. Keep it confidential.
            </p>
            <ChangePinForm />
          </div>
        </section>
      )}

      {/* Admin Accounts */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-zinc-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Admin Accounts</h3>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {admins && admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                    admin.role === "super_admin" ? "bg-[#B91C1C]" : "bg-indigo-600"
                  }`}>
                    {admin.first_name?.[0]}{admin.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{admin.first_name} {admin.last_name}</p>
                    <p className="text-xs text-zinc-500">{admin.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    admin.role === "super_admin" ? "bg-red-50 text-red-700" : "bg-indigo-50 text-indigo-700"
                  }`}>
                    {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{admin.office || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Stats */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-zinc-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">System Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase">Students</p>
            <p className="mt-1.5 text-xl font-semibold text-zinc-900 tabular-nums">{(totalStudents ?? 0).toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase">Broadcasts</p>
            <p className="mt-1.5 text-xl font-semibold text-zinc-900 tabular-nums">{(totalBroadcasts ?? 0).toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase">Delivery Rate</p>
            <p className="mt-1.5 text-xl font-semibold text-emerald-600 tabular-nums">{deliveryRate}%</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase">Admins</p>
            <p className="mt-1.5 text-xl font-semibold text-zinc-900 tabular-nums">{admins?.length ?? 0}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
