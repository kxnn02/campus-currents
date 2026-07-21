DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;

-- Single simple policy: authenticated users can read all profiles
-- (profile data is not sensitive - name, program, section is school-public info)
CREATE POLICY "Authenticated can read profiles" ON public.profiles FOR SELECT USING (
  (select auth.uid()) IS NOT NULL
);;
