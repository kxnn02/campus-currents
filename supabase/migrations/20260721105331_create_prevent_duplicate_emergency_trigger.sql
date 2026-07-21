CREATE OR REPLACE FUNCTION public.prevent_duplicate_active_emergency()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.active_emergencies
    WHERE status = 'active'
  ) THEN
    RAISE EXCEPTION 'Cannot create a new emergency while another is still active'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_duplicate_active_emergency() IS 'Prevents inserting a new emergency if one with status=active already exists';

CREATE TRIGGER trg_prevent_duplicate_active_emergency
  BEFORE INSERT
  ON public.active_emergencies
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_active_emergency();;
