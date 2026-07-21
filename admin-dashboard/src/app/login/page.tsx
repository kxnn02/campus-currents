"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        const msg =
          signInError.message ||
          (signInError as unknown as Record<string, unknown>).error_description ||
          "Invalid email or password. Please try again.";
        setError(String(msg));
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          setError("Unable to verify your account. Please contact support.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (!profile) {
          setError("No profile found for this account. Please contact support to complete account setup.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (!["admin", "super_admin"].includes(profile.role)) {
          setError(
            "Access denied. This dashboard is for administrators only."
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#F9F9F9] relative overflow-hidden">
      {/* Subtle brand background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[20%] w-[600px] h-[600px] rounded-full bg-[#AF101A]/[0.03] blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[15%] w-[500px] h-[500px] rounded-full bg-[#F89C00]/[0.03] blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md shadow-[#AF101A]/[0.08] border border-[#F0DDD9] mb-5">
            <img
              src="/logo.png"
              alt="CampusCurrents"
              className="h-10 w-10 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1C1C]">Campus Currents</h1>
          <p className="text-sm text-[#5B403D] mt-1.5 font-medium">
            Admin Dashboard
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-[#F0DDD9] bg-white p-7 shadow-lg shadow-[#AF101A]/[0.04]">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div id="login-error" role="alert" className="rounded-lg bg-[#BA1A1A]/[0.06] border border-[#BA1A1A]/15 p-3.5 text-sm text-[#BA1A1A] font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#1A1C1C]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-[#E4BEBA] bg-[#F9F9F9] px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#5B403D]/50 focus:border-[#AF101A] focus:outline-none focus:ring-2 focus:ring-[#AF101A]/15 focus:bg-white transition-all duration-200"
                placeholder="admin@sscrmnl.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#1A1C1C]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setError("Enter your email first, then click Forgot Password.");
                      return;
                    }
                    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/login`,
                    });
                    if (resetError) {
                      setError(resetError.message);
                    } else {
                      setError("");
                      alert("Password reset email sent. Check your inbox.");
                    }
                  }}
                  className="text-xs text-[#AF101A] hover:text-[#8B0D15] font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                className="w-full rounded-xl border border-[#E4BEBA] bg-[#F9F9F9] px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#5B403D]/50 focus:border-[#AF101A] focus:outline-none focus:ring-2 focus:ring-[#AF101A]/15 focus:bg-white transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#AF101A] px-4 py-3 text-sm font-bold text-white hover:bg-[#8B0D15] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-[#AF101A]/20 hover:shadow-lg hover:shadow-[#AF101A]/25 active:scale-[0.98]"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#5B403D] mt-6 font-medium">
          San Sebastian College – Recoletos, Manila
        </p>
      </div>
    </div>
  );
}
