-- 1. Remove duplicate RLS policies (keep the ones WITH with_check clause, drop the duplicates)
DROP POLICY IF EXISTS "Admins update emergencies" ON public.active_emergencies;
DROP POLICY IF EXISTS "Admins update broadcasts" ON public.broadcasts;
DROP POLICY IF EXISTS "Admins update events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admins update suspensions" ON public.class_suspensions;

-- 2. Add missing indexes on push_tickets foreign keys
CREATE INDEX IF NOT EXISTS idx_push_tickets_broadcast_id ON public.push_tickets (broadcast_id);
CREATE INDEX IF NOT EXISTS idx_push_tickets_student_id ON public.push_tickets (student_id);

-- 3. Fix RLS initplan issue on push_tickets — use (select auth.uid()) instead of auth.uid()
DROP POLICY IF EXISTS "Admins can read push_tickets" ON public.push_tickets;
CREATE POLICY "Admins can read push_tickets" ON public.push_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role IN ('admin', 'super_admin')
    )
  );
