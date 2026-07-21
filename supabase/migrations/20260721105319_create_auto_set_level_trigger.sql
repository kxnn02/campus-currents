CREATE OR REPLACE FUNCTION public.auto_set_level_from_program()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.program IS NOT NULL THEN
    NEW.level := CASE
      WHEN NEW.program IN ('STEM', 'ABM', 'HUMSS', 'GAS', 'TVL') THEN 'senior_high'
      WHEN NEW.program IN ('BSIT', 'BSBA', 'BSA', 'BSED', 'BEED', 'AB_PSYCH', 'AB_COMM') THEN 'college'
      WHEN NEW.program = 'JD' THEN 'law'
      WHEN NEW.program = 'ETEEAP' THEN 'eteeap'
      ELSE NEW.level  -- keep existing if program not recognized
    END;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.auto_set_level_from_program() IS 'Automatically derives the level column from the program column on INSERT or UPDATE';

CREATE TRIGGER trg_auto_set_level_from_program
  BEFORE INSERT OR UPDATE OF program
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_level_from_program();;
