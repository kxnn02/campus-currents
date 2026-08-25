-- Add location_hint column to delivery_receipts
-- Stores free-text location provided by students who press "Need Help"
-- during an emergency (e.g., "3rd floor Library", "Room 204")
ALTER TABLE public.delivery_receipts
  ADD COLUMN location_hint TEXT;

COMMENT ON COLUMN public.delivery_receipts.location_hint IS 'Student-provided location text during emergency acknowledgment (Need Help only)';
