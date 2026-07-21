-- Drop the existing check constraint on status
ALTER TABLE public.active_emergencies
  DROP CONSTRAINT IF EXISTS active_emergencies_status_check;

-- Re-add with false_alarm included
ALTER TABLE public.active_emergencies
  ADD CONSTRAINT active_emergencies_status_check
  CHECK (status = ANY (ARRAY['active'::text, 'resolved'::text, 'false_alarm'::text]));;
