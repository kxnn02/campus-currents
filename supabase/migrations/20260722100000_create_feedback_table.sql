CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  liked_features TEXT[] DEFAULT '{}',
  improvement_areas TEXT[] DEFAULT '{}',
  comment TEXT,
  would_recommend TEXT CHECK (would_recommend IN ('yes', 'no', 'maybe')),
  device_info JSONB DEFAULT '{}'::jsonb,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Students can insert their own feedback
CREATE POLICY "Users insert own feedback" ON public.feedback
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Students can read their own feedback
CREATE POLICY "Users read own feedback" ON public.feedback
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Admins can read all feedback
CREATE POLICY "Admins read all feedback" ON public.feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role IN ('admin', 'super_admin'))
  );

CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX idx_feedback_rating ON public.feedback(rating);
