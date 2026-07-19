import { createClient } from "@/lib/supabase/server";
import { Shield, Bell, Building2, Phone } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Settings</h2>
        <p className="text-[#444653] mt-1">
          Administrative configuration for CampusCurrents.
        </p>
      </div>

      {/* Critical Systems Control */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#141B2B]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#444653]">
            Critical Systems Control
          </h3>
        </div>
        <div className="rounded-lg border border-[#C4C5D5] bg-white shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-[#C4C5D5]">
            <div>
              <p className="text-sm font-semibold text-[#141B2B]">Emergency Mode</p>
              <p className="text-xs text-[#444653] mt-0.5">Override all notifications with emergency broadcasts</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked="false"
              aria-label="Toggle emergency mode"
              className="h-6 w-11 rounded-full bg-[#C4C5D5] relative cursor-not-allowed opacity-60"
              title="Coming soon — configure via Supabase"
              disabled
            >
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold text-[#141B2B]">SMS Gateway Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-xs text-[#444653]">Connected — Primary route active</span>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md border border-[#C4C5D5] px-3 py-1.5 text-xs font-medium text-[#444653] opacity-60 cursor-not-allowed"
              disabled
              title="SMS testing not yet configured"
            >
              Test SMS
            </button>
          </div>
        </div>
      </section>

      {/* Notification Protocols */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#141B2B]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#444653]">
            Notification Protocols
          </h3>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="rounded-lg border border-[#C4C5D5] bg-white p-5">
            <Phone className="h-5 w-5 text-[#1E40AF] mb-3" />
            <p className="text-sm font-semibold text-[#141B2B]">SMS Blast</p>
            <p className="text-xs text-[#444653] mt-0.5">Active</p>
            <button type="button" role="switch" aria-checked="true" aria-label="SMS Blast enabled" disabled className="mt-3 h-5 w-11 rounded-full bg-[#16A34A] relative cursor-not-allowed">
              <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
            </button>
          </div>
          <div className="rounded-lg border border-[#C4C5D5] bg-white p-5">
            <Bell className="h-5 w-5 text-[#1E40AF] mb-3" />
            <p className="text-sm font-semibold text-[#141B2B]">Push Notifications</p>
            <p className="text-xs text-[#444653] mt-0.5">Active</p>
            <button type="button" role="switch" aria-checked="true" aria-label="Push Notifications enabled" disabled className="mt-3 h-5 w-11 rounded-full bg-[#16A34A] relative cursor-not-allowed">
              <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
            </button>
          </div>
          <div className="rounded-lg border border-[#C4C5D5] bg-white p-5">
            <Building2 className="h-5 w-5 text-[#1E40AF] mb-3" />
            <p className="text-sm font-semibold text-[#141B2B]">Email Digest</p>
            <p className="text-xs text-[#444653] mt-0.5">Enabled for routine tier</p>
            <button type="button" role="switch" aria-checked="true" aria-label="Email Digest enabled" disabled className="mt-3 h-5 w-11 rounded-full bg-[#16A34A] relative cursor-not-allowed">
              <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Profile */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#141B2B]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#444653]">
            Institutional Profile
          </h3>
        </div>
        <div className="rounded-lg border border-[#C4C5D5] bg-white overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-[#8E0002]/10 to-[#1E40AF]/10" />
          <div className="p-5 space-y-5">
            <div>
              <label className="text-xs font-medium text-[#444653] uppercase tracking-wide">School Name</label>
              <input
                type="text"
                defaultValue="San Sebastian College — Recoletos"
                className="mt-1.5 w-full rounded-md border border-[#C4C5D5] bg-white px-3 py-2.5 text-sm text-[#141B2B] focus:border-[#8E0002] focus:outline-none focus:ring-2 focus:ring-[#8E0002]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#444653] uppercase tracking-wide">City/State</label>
                <p className="mt-1.5 text-sm font-medium text-[#141B2B]">Mendiola, Manila, PH</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#444653] uppercase tracking-wide">Admin Zone</label>
                <p className="mt-1.5 text-sm font-medium text-[#141B2B]">Central-Alpha</p>
              </div>
            </div>
            <div className="border-t border-[#C4C5D5] pt-4">
              <label className="text-xs font-bold text-[#444653] uppercase tracking-wide">Emergency Hotlines</label>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3 rounded-md border border-[#C4C5D5] px-3 py-2.5">
                  <Phone className="h-4 w-4 text-[#444653]" />
                  <span className="text-sm text-[#141B2B]">Security: (02) 8241-3421</span>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-[#C4C5D5] px-3 py-2.5">
                  <Phone className="h-4 w-4 text-[#444653]" />
                  <span className="text-sm text-[#141B2B]">Clinic: (02) 8241-3422</span>
                </div>
              </div>
            </div>
            <button className="w-full rounded-lg border border-[#C4C5D5] py-3 text-sm font-semibold text-[#444653] hover:bg-[#F9FAFB] transition-colors">
              Save Institutional Settings
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
