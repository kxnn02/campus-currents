-- Fix missing FK indexes
CREATE INDEX idx_broadcasts_sender_id ON public.broadcasts(sender_id);
CREATE INDEX idx_broadcasts_linked_event_id ON public.broadcasts(linked_event_id);
CREATE INDEX idx_calendar_events_created_by ON public.calendar_events(created_by);
CREATE INDEX idx_class_suspensions_broadcast_id ON public.class_suspensions(broadcast_id);
CREATE INDEX idx_class_suspensions_declared_by ON public.class_suspensions(declared_by);

-- Drop all existing RLS policies and recreate with optimized (select auth.uid()) pattern
-- PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Select own or admin sees all" ON public.profiles FOR SELECT USING (
  (select auth.uid()) = id
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (
  (select auth.uid()) = id
);

-- BROADCASTS
DROP POLICY IF EXISTS "Everyone can read broadcasts" ON public.broadcasts;
DROP POLICY IF EXISTS "Admins can create broadcasts" ON public.broadcasts;

CREATE POLICY "Read broadcasts" ON public.broadcasts FOR SELECT USING (true);

CREATE POLICY "Admins insert broadcasts" ON public.broadcasts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin'))
);

-- CLASS_SUSPENSIONS
DROP POLICY IF EXISTS "Everyone can read suspensions" ON public.class_suspensions;
DROP POLICY IF EXISTS "Admins can create suspensions" ON public.class_suspensions;

CREATE POLICY "Read suspensions" ON public.class_suspensions FOR SELECT USING (true);

CREATE POLICY "Admins insert suspensions" ON public.class_suspensions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin'))
);

-- CALENDAR_EVENTS
DROP POLICY IF EXISTS "Everyone can read events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.calendar_events;

CREATE POLICY "Read events" ON public.calendar_events FOR SELECT USING (true);

CREATE POLICY "Admins manage events" ON public.calendar_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "Admins update events" ON public.calendar_events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "Admins delete events" ON public.calendar_events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin'))
);

-- DELIVERY_RECEIPTS
DROP POLICY IF EXISTS "Students can read their own receipts" ON public.delivery_receipts;
DROP POLICY IF EXISTS "Students can update their own receipts" ON public.delivery_receipts;
DROP POLICY IF EXISTS "Authenticated users can create receipts" ON public.delivery_receipts;
DROP POLICY IF EXISTS "Admins can read all receipts" ON public.delivery_receipts;

CREATE POLICY "Read own or admin reads all" ON public.delivery_receipts FOR SELECT USING (
  student_id = (select auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "Update own receipts" ON public.delivery_receipts FOR UPDATE USING (
  student_id = (select auth.uid())
);

CREATE POLICY "Authenticated insert receipts" ON public.delivery_receipts FOR INSERT WITH CHECK (
  (select auth.uid()) IS NOT NULL
);;
