/**
 * Fix admin accounts that were created via raw SQL INSERT.
 * 
 * Supabase Auth (GoTrue) requires accounts to be created through
 * its API — raw inserts into auth.users won't have valid password hashes.
 * 
 * This script:
 * 1. Deletes the broken auth.users rows via the Admin API
 * 2. Recreates them properly via supabase.auth.admin.createUser()
 * 3. Updates profile roles afterward
 * 
 * Run: node scripts/fix-admin-accounts.mjs
 * 
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 * (NOT the anon key — needs service_role to use admin API)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local manually (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch { /* .env.local not found, rely on existing env vars */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing environment variables.");
  console.error("Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY");
  console.error("");
  console.error("Example:");
  console.error("  $env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'");
  console.error("  node scripts/fix-admin-accounts.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_ACCOUNTS = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    email: "superadmin@campuscurrents.app",
    password: "CcSup3r@dm1n#2026!",
    first_name: "System",
    last_name: "Admin",
    role: "super_admin",
    can_send_emergency: true,
    office: "Security Office",
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    email: "admin.osa@campuscurrents.app",
    password: "CcAdm1n_OSA#2026!!",
    first_name: "OSA",
    last_name: "Admin",
    role: "admin",
    can_send_emergency: false,
    office: "Office of Student Affairs",
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    email: "admin.it@campuscurrents.app",
    password: "CcAdm1n_IT##2026!!",
    first_name: "IT",
    last_name: "Admin",
    role: "admin",
    can_send_emergency: false,
    office: "IT Department",
  },
];

async function fixAccounts() {
  console.log("Fixing admin accounts...\n");

  for (const account of ADMIN_ACCOUNTS) {
    console.log(`--- ${account.email} ---`);

    // Step 1: Try to delete existing broken user
    console.log("  Deleting existing user (if any)...");
    const { error: deleteError } = await supabase.auth.admin.deleteUser(account.id);
    if (deleteError) {
      // Might not exist, that's fine
      console.log(`  (Delete skipped: ${deleteError.message})`);
    } else {
      console.log("  Deleted.");
    }

    // Step 2: Create user properly via Admin API
    console.log("  Creating user via Admin API...");
    const { data, error: createError } = await supabase.auth.admin.createUser({
      id: account.id,
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        first_name: account.first_name,
        last_name: account.last_name,
      },
    });

    if (createError) {
      console.error(`  FAILED: ${createError.message}`);
      continue;
    }
    console.log(`  Created: ${data.user.id}`);

    // Step 3: Update profile role
    console.log("  Updating profile role...");
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: account.role,
        first_name: account.first_name,
        last_name: account.last_name,
        can_send_emergency: account.can_send_emergency,
        office: account.office,
      })
      .eq("id", account.id);

    if (profileError) {
      console.error(`  Profile update error: ${profileError.message}`);
    } else {
      console.log("  Profile updated.");
    }

    console.log("");
  }

  // Set PIN for super_admin
  console.log("Setting PIN for super_admin...");
  const { error: pinError } = await supabase.rpc("set_pin_hash", {
    user_id: "a1000000-0000-0000-0000-000000000001",
    pin: "142857",
  });
  if (pinError) {
    // Fallback: set via raw update if RPC doesn't exist
    console.log(`  PIN RPC not available (${pinError.message}), skipping PIN setup.`);
    console.log("  You can set the PIN manually via the Supabase SQL editor.");
  } else {
    console.log("  PIN set.");
  }

  console.log("\nDone! Try logging in with:");
  console.log("  Email: superadmin@campuscurrents.app");
  console.log("  Password: CcSup3r@dm1n#2026!");
}

fixAccounts().catch(console.error);
