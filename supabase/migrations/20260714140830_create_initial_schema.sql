CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin')),
  student_id TEXT UNIQUE,
  program TEXT,
  year_level INTEGER,
  section TEXT,
  phone_number TEXT,
  fcm_token TEXT,
  office TEXT,
  can_send_emergency BOOLEAN DEFAULT false,
  pin_hash TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  tier TEXT NOT NULL CHECK (tier IN ('routine', 'important', 'emergency')),
  sub_priority TEXT CHECK (sub_priority IN ('urgent', 'standard')),
  channel TEXT NOT NULL CHECK (channel IN ('suspension', 'event', 'academic', 'security', 'general')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_audience JSONB DEFAULT '{"all": true}'::jsonb,
  is_pinned BOOLEAN DEFAULT false,
  linked_event_id UUID,
  linked_suspension_id UUID,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.class_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  declared_by UUID NOT NULL REFERENCES public.profiles(id),
  source TEXT NOT NULL CHECK (source IN ('manila_lgu', 'pagasa', 'deped', 'school_admin')),
  reason TEXT NOT NULL CHECK (reason IN ('weather_flooding', 'weather_typhoon', 'lgu_order', 'facilities', 'security', 'other')),
  scope TEXT NOT NULL CHECK (scope IN ('all_levels', 'college_only', 'specific_programs')),
  scope_detail JSONB,
  duration TEXT NOT NULL CHECK (duration IN ('full_day', 'am_only', 'pm_only')),
  suspension_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lifted')),
  broadcast_id UUID REFERENCES public.broadcasts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('academic', 'school_event', 'org_activity', 'administrative', 'holiday', 'sports', 'seminar')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  location TEXT,
  organizer_name TEXT NOT NULL,
  target_audience JSONB DEFAULT '{"all": true}'::jsonb,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.delivery_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledgment_type TEXT CHECK (acknowledgment_type IN ('safe', 'need_help')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(broadcast_id, student_id)
);

ALTER TABLE public.broadcasts
  ADD CONSTRAINT fk_broadcasts_event FOREIGN KEY (linked_event_id) REFERENCES public.calendar_events(id),
  ADD CONSTRAINT fk_broadcasts_suspension FOREIGN KEY (linked_suspension_id) REFERENCES public.class_suspensions(id);

CREATE INDEX idx_broadcasts_tier ON public.broadcasts(tier);
CREATE INDEX idx_broadcasts_sent_at ON public.broadcasts(sent_at DESC);
CREATE INDEX idx_broadcasts_channel ON public.broadcasts(channel);
CREATE INDEX idx_suspensions_date ON public.class_suspensions(suspension_date DESC);
CREATE INDEX idx_suspensions_status ON public.class_suspensions(status);
CREATE INDEX idx_calendar_events_dates ON public.calendar_events(start_date, end_date);
CREATE INDEX idx_calendar_events_category ON public.calendar_events(category);
CREATE INDEX idx_delivery_receipts_broadcast ON public.delivery_receipts(broadcast_id);
CREATE INDEX idx_delivery_receipts_student ON public.delivery_receipts(student_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_program ON public.profiles(program);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NULL,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();;
