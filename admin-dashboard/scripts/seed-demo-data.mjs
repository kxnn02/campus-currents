/**
 * Seed Demo Data for Campus Currents Defense Presentation
 * 
 * This script:
 * 1. Deletes ALL existing data (broadcasts, suspensions, emergencies, events, receipts)
 * 2. Creates realistic demo data showcasing all app features
 * 
 * Run: node scripts/seed-demo-data.mjs
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
} catch { /* .env.local not found */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Admin IDs (these already exist — we preserve them)
const SUPER_ADMIN_ID = "a1000000-0000-0000-0000-000000000001";
const OSA_ADMIN_ID = "a1000000-0000-0000-0000-000000000002";
const IT_ADMIN_ID = "a1000000-0000-0000-0000-000000000003";

// ─── Helper: date offset from now ───────────────────────────────────────
function daysAgo(days, hours = 8) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

function daysFromNow(days, hours = 8) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

function today(hours = 8) {
  const d = new Date();
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function dateOnly(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

// ─── STEP 1: DELETE ALL EXISTING DATA ───────────────────────────────────
async function deleteAllData() {
  console.log("🗑️  Deleting all existing data...\n");

  // Order matters due to foreign keys
  const tables = [
    "delivery_receipts",
    "active_emergencies",
    "push_tickets",
    "class_suspensions",
    "calendar_events",
    "broadcasts",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.error(`  ❌ Error deleting ${table}: ${error.message}`);
    } else {
      console.log(`  ✓ Cleared ${table}`);
    }
  }
  console.log("");
}

// ─── STEP 2: SEED BROADCASTS (Announcements) ────────────────────────────
async function seedBroadcasts() {
  console.log("📢  Seeding broadcasts...\n");

  const broadcasts = [
    // --- EMERGENCY tier ---
    {
      sender_id: SUPER_ADMIN_ID,
      tier: "emergency",
      channel: "security",
      title: "EARTHQUAKE DRILL — All Students Report to Evacuation Areas",
      body: "An earthquake drill will commence at 10:00 AM today. All students, faculty, and staff must proceed to their designated evacuation areas immediately upon hearing the alarm. Do NOT use elevators. Follow your floor marshals. This is a DRILL.",
      target_audience: { all: true },
      is_pinned: true,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(1, 9),
    },
    // --- IMPORTANT tier ---
    {
      sender_id: OSA_ADMIN_ID,
      tier: "important",
      sub_priority: "urgent",
      channel: "academic",
      title: "Final Exam Schedule Released — 2nd Semester AY 2025-2026",
      body: "The final examination schedule for the 2nd Semester AY 2025-2026 has been posted. College students may view their individual schedules via the student portal. Conflicts must be reported to the Registrar's Office within 3 days. No make-up exams will be given without prior approval.",
      target_audience: { levels: ["college", "law"] },
      is_pinned: true,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(3, 14),
    },
    {
      sender_id: OSA_ADMIN_ID,
      tier: "important",
      sub_priority: "standard",
      channel: "academic",
      title: "Enrollment for Summer 2026 Now Open",
      body: "Online enrollment for Summer 2026 is now open for all programs. Students with outstanding balances must settle their accounts before enrolling. Visit the Finance Office or pay online via the student portal. Enrollment closes on August 1, 2026.",
      target_audience: { levels: ["college"] },
      is_pinned: false,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(2, 10),
    },
  ];

  const { data, error } = await supabase.from("broadcasts").insert(broadcasts).select("id, title");
  if (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return [];
  }
  console.log(`  ✓ Inserted ${data.length} broadcasts`);
  return data;
}

async function seedMoreBroadcasts() {
  const broadcasts = [
    // --- ROUTINE tier ---
    {
      sender_id: OSA_ADMIN_ID,
      tier: "routine",
      channel: "general",
      title: "Library Hours Extended for Finals Week",
      body: "The SSC-R De La Salle Library will extend its hours during finals week (July 28 – August 1). New hours: Monday-Friday 6:00 AM to 10:00 PM, Saturday 7:00 AM to 6:00 PM. Study rooms available on a first-come, first-served basis.",
      target_audience: { all: true },
      is_pinned: false,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(1, 8),
    },
    {
      sender_id: IT_ADMIN_ID,
      tier: "routine",
      channel: "general",
      title: "Wi-Fi Maintenance: Expect Intermittent Connection",
      body: "The IT Department will be performing routine maintenance on campus Wi-Fi infrastructure this Thursday from 11:00 PM to 5:00 AM. Internet connection may be intermittent during this period. Mobile data is advised as backup for late-night study sessions.",
      target_audience: { all: true },
      is_pinned: false,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(2, 16),
    },
    {
      sender_id: OSA_ADMIN_ID,
      tier: "routine",
      channel: "event",
      title: "SSC-R Foundation Day 2026 — Call for Volunteers",
      body: "The Office of Student Affairs is looking for volunteers for the upcoming SSC-R Foundation Day celebration on August 15, 2026. Interested students may sign up at the OSA office or via the Google Form link posted on the official SSC-R Facebook page. Volunteer hours count toward community service requirements.",
      target_audience: { all: true },
      is_pinned: false,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(5, 9),
    },
    {
      sender_id: OSA_ADMIN_ID,
      tier: "important",
      sub_priority: "urgent",
      channel: "general",
      title: "Uniform Policy Reminder — Strict Implementation Starting Monday",
      body: "This is a reminder that the prescribed school uniform must be worn at all times within campus premises starting Monday. Students without proper uniform or ID will not be allowed entry. PE uniforms are only permitted during PE class hours.",
      target_audience: { levels: ["senior_high", "junior_high"] },
      is_pinned: false,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(4, 7),
    },
    {
      sender_id: IT_ADMIN_ID,
      tier: "routine",
      channel: "academic",
      title: "Student Portal Password Reset Available",
      body: "If you are having trouble accessing your student portal account, you may now reset your password via the self-service page at portal.sscrmnl.edu.ph/reset. For further assistance, visit the IT Help Desk at Room 301, Main Building during office hours (8:00 AM – 5:00 PM, Mon-Fri).",
      target_audience: { all: true },
      is_pinned: false,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(6, 11),
    },
    {
      sender_id: SUPER_ADMIN_ID,
      tier: "important",
      sub_priority: "standard",
      channel: "security",
      title: "Lost and Found: Unclaimed Items Will Be Donated",
      body: "The Security Office has accumulated unclaimed items from the past semester including bags, water bottles, umbrellas, and calculators. Please claim your belongings at the Security Office (Ground Floor, Main Building) before July 31, 2026. Unclaimed items will be donated to charity.",
      target_audience: { all: true },
      is_pinned: false,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(7, 13),
    },
  ];

  const { data, error } = await supabase.from("broadcasts").insert(broadcasts).select("id, title");
  if (error) {
    console.error(`  ❌ Error (more broadcasts): ${error.message}`);
    return [];
  }
  console.log(`  ✓ Inserted ${data.length} more broadcasts`);
  return data;
}

// ─── STEP 3: SEED CLASS SUSPENSIONS ─────────────────────────────────────
async function seedSuspensions() {
  console.log("\n🚫  Seeding class suspensions...\n");

  // First create suspension broadcasts
  const suspBroadcasts = [
    {
      sender_id: SUPER_ADMIN_ID,
      tier: "important",
      sub_priority: "urgent",
      channel: "suspension",
      title: "CLASS SUSPENSION: All Levels — Typhoon Carina",
      body: "Classes at ALL levels are SUSPENDED today, July 21, 2026 due to Typhoon Carina (Signal No. 2 over Metro Manila). Stay indoors and monitor official advisories. Classes will resume once the signal is lifted. Stay safe, Stags!",
      target_audience: { all: true },
      is_pinned: true,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: today(5),
    },
    {
      sender_id: OSA_ADMIN_ID,
      tier: "important",
      sub_priority: "urgent",
      channel: "suspension",
      title: "CLASS SUSPENSION: College & Law — Heavy Flooding",
      body: "Due to heavy flooding along Taft Avenue and surrounding areas, classes for College and Law students are SUSPENDED for the PM session today, July 18, 2026. Grade school and high school students with morning classes are NOT affected. Be careful on your way home.",
      target_audience: { levels: ["college", "law"] },
      is_pinned: false,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(3, 11),
    },
    {
      sender_id: SUPER_ADMIN_ID,
      tier: "important",
      sub_priority: "urgent",
      channel: "suspension",
      title: "CLASS SUSPENSION: All Levels — Manila LGU Order",
      body: "Per order of the Manila City Mayor, classes at all levels in Manila (both public and private) are SUSPENDED tomorrow, July 16, 2026 due to inclement weather. Online classes are also suspended. Stay safe and monitor updates.",
      target_audience: { all: true },
      is_pinned: false,
      is_deleted: false,
      version: 1,
      school_id: "sscrmnl",
      sent_at: daysAgo(5, 20),
    },
  ];

  const { data: suspBroadcastData, error: sbErr } = await supabase
    .from("broadcasts")
    .insert(suspBroadcasts)
    .select("id, title");

  if (sbErr) {
    console.error(`  ❌ Error inserting suspension broadcasts: ${sbErr.message}`);
    return;
  }
  console.log(`  ✓ Inserted ${suspBroadcastData.length} suspension broadcasts`);

  // Now create the suspension records
  const suspensions = [
    {
      declared_by: SUPER_ADMIN_ID,
      source: "pagasa",
      reason: "weather_typhoon",
      scope: "all_levels",
      scope_detail: null,
      duration: "full_day",
      suspension_date: todayDate(),
      status: "active",
      broadcast_id: suspBroadcastData[0].id,
      school_id: "sscrmnl",
    },
    {
      declared_by: OSA_ADMIN_ID,
      source: "school_admin",
      reason: "weather_flooding",
      scope: "college_only",
      scope_detail: null,
      duration: "pm_only",
      suspension_date: dateOnly(-3),
      status: "lifted",
      broadcast_id: suspBroadcastData[1].id,
      school_id: "sscrmnl",
    },
    {
      declared_by: SUPER_ADMIN_ID,
      source: "manila_lgu",
      reason: "lgu_order",
      scope: "all_levels",
      scope_detail: null,
      duration: "full_day",
      suspension_date: dateOnly(-5),
      status: "lifted",
      broadcast_id: suspBroadcastData[2].id,
      school_id: "sscrmnl",
    },
  ];

  const { data, error } = await supabase.from("class_suspensions").insert(suspensions).select("id");
  if (error) {
    console.error(`  ❌ Error inserting suspensions: ${error.message}`);
  } else {
    console.log(`  ✓ Inserted ${data.length} class suspensions`);
  }
}

// ─── STEP 4: SEED CALENDAR EVENTS ───────────────────────────────────────
async function seedCalendarEvents() {
  console.log("\n📅  Seeding calendar events...\n");

  const events = [
    {
      title: "Final Examinations Week",
      description: "Final exams for all college programs. Check the student portal for your individual exam schedule. Bring your school ID and exam permits.",
      category: "academic",
      start_date: daysFromNow(7, 7),
      end_date: daysFromNow(12, 17),
      is_all_day: true,
      location: "All Campus Buildings",
      organizer_name: "Office of the Registrar",
      target_audience: { levels: ["college", "law"] },
      status: "active",
      is_deleted: false,
      created_by: OSA_ADMIN_ID,
      school_id: "sscrmnl",
    },
    {
      title: "SSC-R Foundation Day 2026",
      description: "Annual celebration of the founding of San Sebastian College – Recoletos de Manila. The day includes a thanksgiving mass, cultural performances, booth exhibitions, and the Mr. & Ms. SSC-R pageant.",
      category: "school_event",
      start_date: daysFromNow(25, 7),
      end_date: daysFromNow(25, 20),
      is_all_day: false,
      location: "SSC-R Gymnasium & Quadrangle",
      organizer_name: "Office of Student Affairs",
      target_audience: { all: true },
      status: "active",
      is_deleted: false,
      created_by: OSA_ADMIN_ID,
      school_id: "sscrmnl",
    },
    {
      title: "BSIT Capstone Defense — Batch 2026",
      description: "Final defense presentation for BS Information Technology graduating students. Panel evaluations from 8:00 AM to 5:00 PM. Defenders must arrive 30 minutes before their scheduled slot.",
      category: "academic",
      start_date: today(8),
      end_date: today(17),
      is_all_day: false,
      location: "Room 405-408, IT Building",
      organizer_name: "IT Department",
      target_audience: { programs: ["BSIT"] },
      status: "active",
      is_deleted: false,
      created_by: IT_ADMIN_ID,
      school_id: "sscrmnl",
    },
  ];

  const { data, error } = await supabase.from("calendar_events").insert(events).select("id, title");
  if (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return [];
  }
  console.log(`  ✓ Inserted ${data.length} calendar events`);
  return data;
}

async function seedMoreCalendarEvents() {
  const events = [
    {
      title: "Intramurals 2026 — Opening Ceremony",
      description: "Grand opening of the SSC-R Intramurals 2026 with the Parade of Athletes, oath-taking, and exhibition games. All students are encouraged to support their department teams!",
      category: "sports",
      start_date: daysFromNow(14, 8),
      end_date: daysFromNow(14, 12),
      is_all_day: false,
      location: "SSC-R Covered Court",
      organizer_name: "PE Department & SSG",
      target_audience: { all: true },
      status: "active",
      is_deleted: false,
      created_by: OSA_ADMIN_ID,
      school_id: "sscrmnl",
    },
    {
      title: "Industry Talk: AI in Philippine Business",
      description: "A seminar featuring industry leaders discussing the adoption of artificial intelligence in Philippine businesses. Open to BSIT, BSBA, and BSA students. Certificate of attendance will be provided.",
      category: "seminar",
      start_date: daysFromNow(5, 13),
      end_date: daysFromNow(5, 16),
      is_all_day: false,
      location: "AVR, 5th Floor Main Building",
      organizer_name: "College of Business & IT Department",
      target_audience: { programs: ["BSIT", "BSBA", "BSA"] },
      status: "active",
      is_deleted: false,
      created_by: IT_ADMIN_ID,
      school_id: "sscrmnl",
    },
    {
      title: "Ninoy Aquino Day — No Classes",
      description: "Regular holiday. No classes at all levels. Administrative offices closed.",
      category: "holiday",
      start_date: daysFromNow(30, 0),
      end_date: daysFromNow(30, 23),
      is_all_day: true,
      location: null,
      organizer_name: "Administration",
      target_audience: { all: true },
      status: "active",
      is_deleted: false,
      created_by: OSA_ADMIN_ID,
      school_id: "sscrmnl",
    },
    {
      title: "BSBA Org Activity: Business Plan Competition",
      description: "Annual business plan pitching competition for BSBA students. Teams of 3-5 may register at the JFINEX office. Cash prizes for top 3 teams. Registration deadline: July 28.",
      category: "org_activity",
      start_date: daysFromNow(10, 9),
      end_date: daysFromNow(10, 16),
      is_all_day: false,
      location: "Function Hall, 3rd Floor",
      organizer_name: "JFINEX Organization",
      target_audience: { programs: ["BSBA"] },
      status: "active",
      is_deleted: false,
      created_by: OSA_ADMIN_ID,
      school_id: "sscrmnl",
    },
    {
      title: "Parent-Teacher Conference — Senior High",
      description: "Quarterly Parent-Teacher Conference for all Senior High School students. Parents/guardians are required to attend. Report cards will be distributed.",
      category: "administrative",
      start_date: daysFromNow(3, 8),
      end_date: daysFromNow(3, 12),
      is_all_day: false,
      location: "SHS Building, Rooms 201-210",
      organizer_name: "Senior High School Department",
      target_audience: { levels: ["senior_high"] },
      status: "active",
      is_deleted: false,
      created_by: OSA_ADMIN_ID,
      school_id: "sscrmnl",
    },
  ];

  const { data, error } = await supabase.from("calendar_events").insert(events).select("id, title");
  if (error) {
    console.error(`  ❌ Error (more events): ${error.message}`);
    return [];
  }
  console.log(`  ✓ Inserted ${data.length} more calendar events`);
  return data;
}

// ─── STEP 5: SEED AN ACTIVE EMERGENCY (resolved — for history) ──────────
async function seedEmergencies() {
  console.log("\n🚨  Seeding emergency records...\n");

  // Create the emergency broadcast first
  const emergBroadcast = {
    sender_id: SUPER_ADMIN_ID,
    tier: "emergency",
    channel: "security",
    title: "⚠️ FIRE ALARM — Building B Evacuate Immediately",
    body: "A fire alarm has been triggered in Building B, 3rd Floor. ALL occupants of Building B must evacuate IMMEDIATELY using the nearest stairwell. Do NOT use elevators. Proceed to the parking lot evacuation assembly point. Fire department has been notified. Await further instructions.",
    target_audience: { all: true },
    is_pinned: false,
    is_deleted: false,
    version: 1,
    school_id: "sscrmnl",
    sent_at: daysAgo(10, 14),
  };

  const { data: broadcastData, error: bErr } = await supabase
    .from("broadcasts")
    .insert(emergBroadcast)
    .select("id")
    .single();

  if (bErr) {
    console.error(`  ❌ Error inserting emergency broadcast: ${bErr.message}`);
    return;
  }

  // Create the resolved emergency record
  const emergency = {
    broadcast_id: broadcastData.id,
    emergency_type: "fire",
    status: "false_alarm",
    resolved_at: daysAgo(10, 15),
    school_id: "sscrmnl",
  };

  const { error: eErr } = await supabase.from("active_emergencies").insert(emergency);
  if (eErr) {
    console.error(`  ❌ Error inserting emergency: ${eErr.message}`);
  } else {
    console.log("  ✓ Inserted 1 resolved emergency (fire — false alarm)");
  }

  // Create a second emergency — flooding (resolved)
  const floodBroadcast = {
    sender_id: SUPER_ADMIN_ID,
    tier: "emergency",
    channel: "security",
    title: "⚠️ FLOODING ALERT — Ground Floor Affected",
    body: "Due to continuous heavy rainfall, the ground floor of the Main Building is experiencing flooding. Students and staff on the ground floor should move to upper floors immediately. Avoid the basement parking area. Updates will follow.",
    target_audience: { all: true },
    is_pinned: false,
    is_deleted: false,
    version: 1,
    school_id: "sscrmnl",
    sent_at: daysAgo(5, 16),
  };

  const { data: floodBData, error: fbErr } = await supabase
    .from("broadcasts")
    .insert(floodBroadcast)
    .select("id")
    .single();

  if (fbErr) {
    console.error(`  ❌ Error inserting flood broadcast: ${fbErr.message}`);
    return;
  }

  const floodEmergency = {
    broadcast_id: floodBData.id,
    emergency_type: "flooding",
    status: "resolved",
    resolved_at: daysAgo(5, 20),
    school_id: "sscrmnl",
  };

  const { error: feErr } = await supabase.from("active_emergencies").insert(floodEmergency);
  if (feErr) {
    console.error(`  ❌ Error inserting flood emergency: ${feErr.message}`);
  } else {
    console.log("  ✓ Inserted 1 resolved emergency (flooding)");
  }
}

// ─── STEP 6: SEED STUDENT PROFILES (for demo) ───────────────────────────
async function seedStudentProfiles() {
  console.log("\n👤  Seeding demo student profiles...\n");

  // Check if demo students already exist
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "juan.delacruz@student.sscrmnl.edu.ph");

  if (existing && existing.length > 0) {
    console.log("  ⏭️  Demo students already exist, skipping...");
    return existing.map((e) => e.id);
  }

  // Create demo student users via Admin API
  const students = [
    {
      email: "juan.delacruz@student.sscrmnl.edu.ph",
      password: "DemoStudent#2026",
      first_name: "Juan",
      last_name: "Dela Cruz",
      student_id: "2022-00101",
      program: "BSIT",
      year_level: 4,
      level: "college",
      section: "4ITA",
    },
    {
      email: "maria.santos@student.sscrmnl.edu.ph",
      password: "DemoStudent#2026",
      first_name: "Maria",
      last_name: "Santos",
      student_id: "2023-00245",
      program: "BSBA",
      year_level: 3,
      level: "college",
      section: "3BMA",
    },
    {
      email: "carlo.reyes@student.sscrmnl.edu.ph",
      password: "DemoStudent#2026",
      first_name: "Carlo",
      last_name: "Reyes",
      student_id: "2024-00089",
      program: "STEM",
      year_level: 2,
      level: "senior_high",
      section: "12-STEM-A",
    },
    {
      email: "angela.garcia@student.sscrmnl.edu.ph",
      password: "DemoStudent#2026",
      first_name: "Angela",
      last_name: "Garcia",
      student_id: "2022-00333",
      program: "BSA",
      year_level: 4,
      level: "college",
      section: "4ACB",
    },
    {
      email: "mark.torres@student.sscrmnl.edu.ph",
      password: "DemoStudent#2026",
      first_name: "Mark",
      last_name: "Torres",
      student_id: "2023-00567",
      program: "AB_PSYCH",
      year_level: 3,
      level: "college",
      section: "3PSA",
    },
  ];

  const studentIds = [];

  for (const student of students) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: student.email,
      password: student.password,
      email_confirm: true,
      user_metadata: {
        first_name: student.first_name,
        last_name: student.last_name,
      },
    });

    if (error) {
      console.error(`  ❌ Error creating ${student.email}: ${error.message}`);
      continue;
    }

    studentIds.push(data.user.id);

    // Update the profile with student details
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        role: "student",
        first_name: student.first_name,
        last_name: student.last_name,
        student_id: student.student_id,
        program: student.program,
        year_level: student.year_level,
        level: student.level,
        section: student.section,
        school_id: "sscrmnl",
      })
      .eq("id", data.user.id);

    if (profileErr) {
      console.error(`  ⚠️  Profile update error for ${student.email}: ${profileErr.message}`);
    } else {
      console.log(`  ✓ Created student: ${student.first_name} ${student.last_name} (${student.program})`);
    }
  }

  return studentIds;
}

// ─── STEP 7: SEED DELIVERY RECEIPTS (shows push notification delivery) ──
async function seedDeliveryReceipts(studentIds) {
  console.log("\n📬  Seeding delivery receipts...\n");

  if (!studentIds || studentIds.length === 0) {
    console.log("  ⏭️  No student IDs available, skipping receipts...");
    return;
  }

  // Get all broadcasts to create receipts for
  const { data: broadcasts, error: bErr } = await supabase
    .from("broadcasts")
    .select("id, sent_at")
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false })
    .limit(6);

  if (bErr || !broadcasts || broadcasts.length === 0) {
    console.error("  ❌ Could not fetch broadcasts for receipts");
    return;
  }

  const receipts = [];
  for (const broadcast of broadcasts) {
    for (const studentId of studentIds) {
      const sentTime = new Date(broadcast.sent_at);
      const deliveredAt = new Date(sentTime.getTime() + Math.random() * 30000); // within 30s
      const readAt = Math.random() > 0.3
        ? new Date(deliveredAt.getTime() + Math.random() * 3600000) // read within 1hr
        : null;

      receipts.push({
        broadcast_id: broadcast.id,
        student_id: studentId,
        delivery_method: "push",
        delivered_at: deliveredAt.toISOString(),
        read_at: readAt ? readAt.toISOString() : null,
        acknowledged_at: null,
        acknowledgment_type: null,
      });
    }
  }

  const { data, error } = await supabase.from("delivery_receipts").insert(receipts).select("id");
  if (error) {
    console.error(`  ❌ Error inserting receipts: ${error.message}`);
  } else {
    console.log(`  ✓ Inserted ${data.length} delivery receipts`);
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   Campus Currents — Defense Demo Data Seeder            ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // Step 1: Wipe existing data
  await deleteAllData();

  // Step 2: Seed broadcasts (announcements)
  await seedBroadcasts();
  await seedMoreBroadcasts();

  // Step 3: Seed class suspensions
  await seedSuspensions();

  // Step 4: Seed calendar events
  await seedCalendarEvents();
  await seedMoreCalendarEvents();

  // Step 5: Seed emergencies (resolved ones for history)
  await seedEmergencies();

  // Step 6: Seed student profiles
  const studentIds = await seedStudentProfiles();

  // Step 7: Seed delivery receipts
  await seedDeliveryReceipts(studentIds);

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   ✅ Demo data seeded successfully!                     ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║                                                          ║");
  console.log("║   Admin Login:                                           ║");
  console.log("║     superadmin@campuscurrents.app / CcSup3r@dm1n#2026!  ║");
  console.log("║                                                          ║");
  console.log("║   Demo Student Login:                                    ║");
  console.log("║     juan.delacruz@student.sscrmnl.edu.ph                ║");
  console.log("║     Password: DemoStudent#2026                           ║");
  console.log("║                                                          ║");
  console.log("║   Features showcased:                                    ║");
  console.log("║     • 12 broadcasts (emergency/important/routine)        ║");
  console.log("║     • 3 class suspensions (active + lifted)              ║");
  console.log("║     • 8 calendar events (all categories)                 ║");
  console.log("║     • 2 emergency records (resolved + false alarm)       ║");
  console.log("║     • 5 student profiles with delivery receipts          ║");
  console.log("║                                                          ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err.message);
  process.exit(1);
});
