-- Migration: Create individual admin accounts for CampusCurrents
-- These accounts are created directly in auth.users (Supabase allows raw inserts 
-- for seed/migration purposes). The handle_new_user trigger will auto-create profiles.
--
-- After this migration, manually update passwords via Supabase Dashboard > Auth 
-- if you prefer dashboard-generated passwords. These use bcrypt-hashed passwords.

-- Enable pgcrypto for crypt() and gen_salt() if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Admin Account 1: Super Admin (campus security head)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  'a1000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'superadmin@campuscurrents.app',
  extensions.crypt('CcSup3r@dm1n#2026!', extensions.gen_salt('bf', 10)),
  now(),
  'authenticated',
  'authenticated',
  now(),
  now(),
  '{"first_name": "System", "last_name": "Admin"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Admin Account 2: Regular Admin (OSA staff)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  'a1000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'admin.osa@campuscurrents.app',
  extensions.crypt('CcAdm1n_OSA#2026!!', extensions.gen_salt('bf', 10)),
  now(),
  'authenticated',
  'authenticated',
  now(),
  now(),
  '{"first_name": "OSA", "last_name": "Admin"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Admin Account 3: Regular Admin (IT staff)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  'a1000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'admin.it@campuscurrents.app',
  extensions.crypt('CcAdm1n_IT##2026!!', extensions.gen_salt('bf', 10)),
  now(),
  'authenticated',
  'authenticated',
  now(),
  now(),
  '{"first_name": "IT", "last_name": "Admin"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create identities for each user (required for email/password login)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   '{"sub": "a1000000-0000-0000-0000-000000000001", "email": "superadmin@campuscurrents.app"}'::jsonb,
   'email', 'a1000000-0000-0000-0000-000000000001', now(), now(), now()),
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002',
   '{"sub": "a1000000-0000-0000-0000-000000000002", "email": "admin.osa@campuscurrents.app"}'::jsonb,
   'email', 'a1000000-0000-0000-0000-000000000002', now(), now(), now()),
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003',
   '{"sub": "a1000000-0000-0000-0000-000000000003", "email": "admin.it@campuscurrents.app"}'::jsonb,
   'email', 'a1000000-0000-0000-0000-000000000003', now(), now(), now())
ON CONFLICT DO NOTHING;

-- Now set profile roles (the trigger creates profiles, but we need to update roles)
-- Wait for trigger to fire, then update:
UPDATE public.profiles
SET
  role = 'super_admin',
  first_name = 'System',
  last_name = 'Admin',
  can_send_emergency = true,
  office = 'Security Office'
WHERE id = 'a1000000-0000-0000-0000-000000000001';

UPDATE public.profiles
SET
  role = 'admin',
  first_name = 'OSA',
  last_name = 'Admin',
  can_send_emergency = false,
  office = 'Office of Student Affairs'
WHERE id = 'a1000000-0000-0000-0000-000000000002';

UPDATE public.profiles
SET
  role = 'admin',
  first_name = 'IT',
  last_name = 'Admin',
  can_send_emergency = false,
  office = 'IT Department'
WHERE id = 'a1000000-0000-0000-0000-000000000003';

-- Set PIN hash for super_admin account (PIN: 142857)
-- This uses bcrypt via pgcrypto so the admin-dashboard compare() works correctly
UPDATE public.profiles
SET pin_hash = extensions.crypt('142857', extensions.gen_salt('bf', 10))
WHERE id = 'a1000000-0000-0000-0000-000000000001';
