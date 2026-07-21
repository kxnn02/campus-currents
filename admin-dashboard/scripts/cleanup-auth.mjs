/**
 * Step 1: Delete broken auth.users rows via Supabase SQL editor equivalent
 * Step 2: Recreate accounts properly via Admin API
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = readFileSync(envPath, "utf-8");
const vars = {};
for (const line of env.split("\n")) {
  const eq = line.indexOf("=");
  if (eq > 0) vars[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}

const BASE = vars.NEXT_PUBLIC_SUPABASE_URL;
const KEY = vars.SUPABASE_SERVICE_ROLE_KEY;

const IDS = [
  "a1000000-0000-0000-0000-000000000001",
  "a1000000-0000-0000-0000-000000000002",
  "a1000000-0000-0000-0000-000000000003",
];

async function run() {
  console.log("=== Step 1: Delete broken profiles ===");
  for (const id of IDS) {
    const res = await fetch(
      `${BASE}/rest/v1/profiles?id=eq.${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${KEY}`,
          apikey: KEY,
          Prefer: "return=minimal",
        },
      }
    );
    console.log(`  Profile ${id.slice(-1)}: ${res.status}`);
  }

  console.log("\n=== Step 2: Delete broken auth rows via SQL ===");
  // Use Supabase's /pg endpoint (available on hosted projects)
  const sql = `
    DELETE FROM auth.identities WHERE user_id IN ('a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000003');
    DELETE FROM auth.users WHERE id IN ('a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000003');
  `;

  // Try the management API SQL endpoint
  let sqlWorked = false;
  
  // Approach 1: /pg/query endpoint (newer Supabase)
  let res = await fetch(`${BASE}/pg/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  console.log(`  /pg/query: ${res.status}`);
  if (res.status === 200 || res.status === 201) {
    sqlWorked = true;
    console.log("  SQL executed successfully.");
  } else {
    const body = await res.text();
    console.log(`  Response: ${body.slice(0, 200)}`);
  }

  // Approach 2: try via postgrest rpc if pg/query didn't work
  if (!sqlWorked) {
    console.log("  Trying via direct auth admin delete...");
    for (const id of IDS) {
      // Use undocumented but working direct auth admin endpoint
      const delRes = await fetch(`${BASE}/auth/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${KEY}`,
          apikey: KEY,
        },
      });
      console.log(`  Delete auth user ${id.slice(-1)}: ${delRes.status}`);
      if (delRes.status !== 200 && delRes.status !== 204) {
        const t = await delRes.text();
        console.log(`    ${t.slice(0, 150)}`);
      }
    }
  }

  console.log("\n=== Step 3: Verify auth is working ===");
  res = await fetch(`${BASE}/auth/v1/admin/users?page=1&per_page=1`, {
    headers: {
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
    },
  });
  console.log(`  List users: ${res.status}`);
  if (res.status === 200) {
    const data = await res.json();
    console.log(`  Total users in system: ${data.users?.length ?? "unknown"}`);
    console.log("  Auth is healthy!");
    sqlWorked = true;
  } else {
    const body = await res.text();
    console.log(`  Still broken: ${body.slice(0, 200)}`);
    console.log("\n  >>> You need to run this SQL manually in the Supabase Dashboard SQL Editor:");
    console.log("  >>> Go to: https://supabase.com/dashboard/project/mpseammhlqonrkwvfvec/sql/new");
    console.log(`  >>>\n${sql}\n  >>>`);
    return;
  }

  console.log("\n=== Step 4: Create accounts properly ===");
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(BASE, KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const accounts = [
    { id: IDS[0], email: "superadmin@campuscurrents.app", password: "CcSup3r@dm1n#2026!", first_name: "System", last_name: "Admin", role: "super_admin", can_send_emergency: true, office: "Security Office" },
    { id: IDS[1], email: "admin.osa@campuscurrents.app", password: "CcAdm1n_OSA#2026!!", first_name: "OSA", last_name: "Admin", role: "admin", can_send_emergency: false, office: "Office of Student Affairs" },
    { id: IDS[2], email: "admin.it@campuscurrents.app", password: "CcAdm1n_IT##2026!!", first_name: "IT", last_name: "Admin", role: "admin", can_send_emergency: false, office: "IT Department" },
  ];

  for (const acc of accounts) {
    console.log(`\n  Creating ${acc.email}...`);
    const { data, error } = await supabase.auth.admin.createUser({
      id: acc.id,
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: { first_name: acc.first_name, last_name: acc.last_name },
    });
    if (error) {
      console.log(`    Error: ${error.message || JSON.stringify(error)}`);
      continue;
    }
    console.log(`    Created: ${data.user.id}`);

    // Update profile
    const { error: pErr } = await supabase.from("profiles").update({
      role: acc.role,
      first_name: acc.first_name,
      last_name: acc.last_name,
      can_send_emergency: acc.can_send_emergency,
      office: acc.office,
    }).eq("id", acc.id);
    if (pErr) console.log(`    Profile update: ${pErr.message}`);
    else console.log("    Profile updated.");
  }

  console.log("\n=== Done! ===");
  console.log("Login with: superadmin@campuscurrents.app / CcSup3r@dm1n#2026!");
}

run().catch(console.error);
