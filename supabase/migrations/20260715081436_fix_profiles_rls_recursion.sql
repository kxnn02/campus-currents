-- Drop the problematic policy
DROP POLICY IF EXISTS "Select own or admin sees all" ON public.profiles;

-- Create a simple policy: users can always read their own profile
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (
  (select auth.uid()) = id
);

-- Separate policy for admins (uses auth.jwt() to avoid recursion)
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT USING (
  (select auth.jwt()->>'role') = 'service_role'
  OR (select auth.uid()) = id
);;
