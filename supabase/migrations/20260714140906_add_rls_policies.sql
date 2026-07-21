ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read broadcasts" ON public.broadcasts FOR SELECT USING (true);
CREATE POLICY "Admins can create broadcasts" ON public.broadcasts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

ALTER TABLE public.class_suspensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read suspensions" ON public.class_suspensions FOR SELECT USING (true);
CREATE POLICY "Admins can create suspensions" ON public.class_suspensions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read events" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.calendar_events FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

ALTER TABLE public.delivery_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can read their own receipts" ON public.delivery_receipts FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can update their own receipts" ON public.delivery_receipts FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "System can create receipts" ON public.delivery_receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read all receipts" ON public.delivery_receipts FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

ALTER PUBLICATION supabase_realtime ADD TABLE public.class_suspensions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_receipts;;
