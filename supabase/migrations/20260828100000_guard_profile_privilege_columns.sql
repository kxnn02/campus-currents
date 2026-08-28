-- C1/C3 fix: prevent privilege escalation via the self-service profile UPDATE.
--
-- The "Update own profile" policy is USING-only (no WITH CHECK, no column scope),
-- so a student holding the anon key can set their own role/can_send_emergency/pin_hash
-- to anything the CHECK constraint allows (e.g. role='super_admin'), then log into the
-- admin dashboard. RLS WITH CHECK cannot compare against the OLD row, so the correct
-- guard is a BEFORE UPDATE trigger that rejects changes to privileged columns unless
-- the caller is a privileged role (service_role, or an existing admin/super_admin).
--
-- This closes C1 (role/can_send_emergency escalation) and hardens C3 (pin_hash is now
-- only writable server-side, never by the owning client).

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
DECLARE
  caller_role text;
  is_privileged boolean;
BEGIN
  -- service_role (Edge Functions, admin scripts, migrations) bypasses the guard entirely.
  IF (SELECT auth.jwt()->>'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Nothing privileged changed → allow (covers the normal case: name/program/fcm_token/etc.)
  IF NEW.role IS NOT DISTINCT FROM OLD.role
     AND NEW.can_send_emergency IS NOT DISTINCT FROM OLD.can_send_emergency
     AND NEW.pin_hash IS NOT DISTINCT FROM OLD.pin_hash THEN
    RETURN NEW;
  END IF;

  -- A privileged column changed. Only an existing admin/super_admin may do this.
  SELECT p.role INTO caller_role
  FROM public.profiles p
  WHERE p.id = (SELECT auth.uid());

  is_privileged := caller_role IN ('admin', 'super_admin');

  IF NOT is_privileged THEN
    RAISE EXCEPTION 'Not authorized to modify role, can_send_emergency, or pin_hash'
      USING ERRCODE = '42501'; -- insufficient_privilege
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS profiles_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();
