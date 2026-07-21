-- Fix the trigger to properly extract name from Google metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name_val TEXT;
  first_name_val TEXT;
  last_name_val TEXT;
BEGIN
  full_name_val := NEW.raw_user_meta_data->>'full_name';
  
  -- Split full name into first and last
  IF full_name_val IS NOT NULL AND full_name_val != '' THEN
    first_name_val := split_part(full_name_val, ' ', 1);
    last_name_val := CASE 
      WHEN position(' ' in full_name_val) > 0 
      THEN substring(full_name_val from position(' ' in full_name_val) + 1)
      ELSE NULL
    END;
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    first_name_val,
    last_name_val,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Also fix your existing profile
UPDATE public.profiles 
SET first_name = 'KENNETH', last_name = 'CLEIN T FERNANDEZ'
WHERE email = 'fernandez.kct@sscrmnl.edu.ph';

-- Revoke execute from public roles (security fix)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;;
