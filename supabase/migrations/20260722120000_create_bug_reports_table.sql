CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  screen TEXT,
  severity TEXT NOT NULL DEFAULT 'minor' CHECK (severity IN ('critical', 'major', 'minor')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'fixed')),
  device_info JSONB DEFAULT '{}'::jsonb,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own bug reports" ON public.bug_reports
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users read own bug reports" ON public.bug_reports
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins read all bug reports" ON public.bug_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins update bug reports" ON public.bug_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role IN ('admin', 'super_admin'))
  );

CREATE INDEX idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_created_at ON public.bug_reports(created_at DESC);
