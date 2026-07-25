DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;

CREATE POLICY "Profiles select policy" ON public.profiles
  FOR SELECT USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('admin', 'super_admin')
    )
  );;
