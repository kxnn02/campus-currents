-- M1 fix: the faculty broadcast UPDATE policy checked ownership in USING (old row) but
-- not in WITH CHECK (new row). A faculty member could reassign sender_id to another user
-- in the same UPDATE, breaking the audit trail. Re-assert ownership + role in WITH CHECK.

DROP POLICY IF EXISTS "Faculty can update own broadcasts" ON public.broadcasts;

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
    sender_id = (SELECT auth.uid())
    AND tier = 'routine'
    AND channel IN ('academic', 'general')
  );
