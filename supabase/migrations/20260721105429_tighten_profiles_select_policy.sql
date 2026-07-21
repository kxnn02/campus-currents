-- Drop the overly permissive profiles SELECT policy
DROP POLICY "Authenticated can read profiles" ON public.profiles;

-- Create a tighter policy: students see own row + admin/super_admin rows; admins see all
CREATE POLICY "Profiles select policy" ON public.profiles
  FOR SELECT
  USING (
    id = (SELECT auth.uid())
    OR role IN ('admin', 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN ('admin', 'super_admin')
    )
  );;
