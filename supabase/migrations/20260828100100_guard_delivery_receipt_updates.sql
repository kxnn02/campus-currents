-- H2 fix: the delivery_receipts self-UPDATE policy is USING-only, so a student can
-- rewrite delivered_at/read_at/acknowledged_at on their own receipts to arbitrary values.
-- delivered_at is the honest, Expo-confirmed delivery metric (set only by the
-- check-push-receipts Edge Function running as service_role) and is a headline Chapter 4
-- result — it must never be client-writable. read_at/acknowledged_at/acknowledgment_type/
-- location_hint are legitimately client-set, but only forward from NULL (a student can mark
-- read/acknowledged once; they can't un-acknowledge or rewrite history).
--
-- RLS WITH CHECK can't see the OLD row, so this is a BEFORE UPDATE trigger.

CREATE OR REPLACE FUNCTION public.guard_delivery_receipt_update()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
BEGIN
  -- service_role (push + receipt-check Edge Functions) may set anything.
  IF (SELECT auth.jwt()->>'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Identity columns are immutable from the client — no re-pointing a receipt.
  IF NEW.broadcast_id IS DISTINCT FROM OLD.broadcast_id
     OR NEW.student_id IS DISTINCT FROM OLD.student_id THEN
    RAISE EXCEPTION 'Cannot change broadcast_id or student_id on a receipt'
      USING ERRCODE = '42501';
  END IF;

  -- delivered_at is server-owned (honest delivery tracking) — client cannot touch it.
  IF NEW.delivered_at IS DISTINCT FROM OLD.delivered_at THEN
    RAISE EXCEPTION 'delivered_at is set by the system only'
      USING ERRCODE = '42501';
  END IF;

  -- Client-settable fields may only transition forward from NULL (write-once).
  IF OLD.read_at IS NOT NULL AND NEW.read_at IS DISTINCT FROM OLD.read_at THEN
    RAISE EXCEPTION 'read_at cannot be changed once set' USING ERRCODE = '42501';
  END IF;
  IF OLD.acknowledged_at IS NOT NULL AND NEW.acknowledged_at IS DISTINCT FROM OLD.acknowledged_at THEN
    RAISE EXCEPTION 'acknowledged_at cannot be changed once set' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_delivery_receipt_update() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS delivery_receipts_guard_update ON public.delivery_receipts;
CREATE TRIGGER delivery_receipts_guard_update
  BEFORE UPDATE ON public.delivery_receipts
  FOR EACH ROW EXECUTE FUNCTION public.guard_delivery_receipt_update();
