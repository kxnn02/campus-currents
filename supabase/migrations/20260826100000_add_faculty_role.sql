-- Add 'faculty' to the profiles role CHECK constraint
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'admin', 'super_admin', 'faculty'));

-- Faculty can INSERT broadcasts but only routine tier + academic/general channel
CREATE POLICY "Faculty can create routine broadcasts" ON public.broadcasts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'faculty'
    )
    AND tier = 'routine'
    AND channel IN ('academic', 'general')
  );

-- Faculty can read all broadcasts (same as students — already covered by existing SELECT policy)
-- No additional SELECT policy needed.

-- Faculty can UPDATE their own broadcasts only (for editing)
CREATE POLICY "Faculty can update own broadcasts" ON public.broadcasts
  FOR UPDATE
  USING (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'faculty'
    )
  )
  WITH CHECK (
    tier = 'routine'
    AND channel IN ('academic', 'general')
  );

-- Faculty can read delivery_receipts for their own broadcasts
CREATE POLICY "Faculty can read receipts for own broadcasts" ON public.delivery_receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.broadcasts
      WHERE broadcasts.id = delivery_receipts.broadcast_id
        AND broadcasts.sender_id = (SELECT auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'faculty'
    )
  );

-- Faculty can insert audit_log entries
CREATE POLICY "Faculty can insert audit logs" ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'faculty'
    )
  );
