-- C3 fix: stop any client from ever reading pin_hash.
--
-- Before: emergency/actions.ts and settings/actions.ts SELECT pin_hash under the anon-key
-- SSR client and compare it with bcryptjs. That means the hash crosses the RLS boundary to
-- the client, and an admin can read other admins' pin_hash rows. bcrypt makes it slow to
-- crack, but a 4-6 digit PIN is brute-forceable offline once the hash leaks.
--
-- After: PIN verification happens entirely in the database via a SECURITY DEFINER RPC that
-- checks the CALLER'S OWN row and returns only a boolean. Client SELECT on pin_hash is
-- revoked. pgcrypto crypt() verifies bcrypt ($2) hashes made by either pgcrypto or bcryptjs.

-- verify_pin: true iff the given PIN matches the calling user's stored hash.
CREATE OR REPLACE FUNCTION public.verify_pin(pin text)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
DECLARE
  stored_hash text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN false;
  END IF;

  SELECT p.pin_hash INTO stored_hash
  FROM public.profiles p
  WHERE p.id = (SELECT auth.uid());

  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;

  -- pgcrypto's crypt() reliably verifies the $2a$ bcrypt variant. bcryptjs (used by the
  -- admin dashboard's change-PIN flow) emits $2b$, and older seeds used $2a$. The three
  -- variants ($2a$/$2b$/$2y$) are byte-identical apart from the version tag and produce
  -- the same derived key, so normalise the tag to $2a$ before verifying. This makes a
  -- hash created by EITHER path verify correctly — critical, since a false negative here
  -- would reject a valid PIN during a real emergency.
  IF stored_hash LIKE '$2b$%' OR stored_hash LIKE '$2y$%' THEN
    stored_hash := '$2a$' || substr(stored_hash, 5);
  END IF;

  RETURN extensions.crypt(pin, stored_hash) = stored_hash;
END;
$$;

-- Only logged-in users may call it, and only ever for their own row (enforced inside).
REVOKE EXECUTE ON FUNCTION public.verify_pin(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.verify_pin(text) TO authenticated;

-- Revoke client read access to the hash column. UPDATE (changing the PIN) is unaffected;
-- the C1 trigger still gates who may write it. service_role bypasses column grants entirely.
REVOKE SELECT (pin_hash) ON public.profiles FROM anon, authenticated;
