ALTER TABLE public.broadcasts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.class_suspensions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.calendar_events ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

CREATE TRIGGER broadcasts_updated_at BEFORE UPDATE ON public.broadcasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER class_suspensions_updated_at BEFORE UPDATE ON public.class_suspensions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.broadcasts ADD COLUMN is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.calendar_events ADD COLUMN is_deleted BOOLEAN DEFAULT false;

ALTER TABLE public.broadcasts DROP CONSTRAINT fk_broadcasts_suspension;
ALTER TABLE public.broadcasts DROP COLUMN linked_suspension_id;

ALTER TABLE public.profiles ADD COLUMN school_id TEXT DEFAULT 'sscrmnl';
ALTER TABLE public.broadcasts ADD COLUMN school_id TEXT DEFAULT 'sscrmnl';
ALTER TABLE public.class_suspensions ADD COLUMN school_id TEXT DEFAULT 'sscrmnl';
ALTER TABLE public.calendar_events ADD COLUMN school_id TEXT DEFAULT 'sscrmnl';

ALTER TABLE public.profiles ADD CONSTRAINT chk_program CHECK (program IS NULL OR program IN ('BSIT', 'BSBA', 'BSA', 'BSED', 'BEED', 'AB_PSYCH', 'AB_COMM', 'OTHER'));

ALTER TABLE public.delivery_receipts ADD COLUMN delivery_method TEXT DEFAULT 'push' CHECK (delivery_method IN ('push', 'sms', 'both'));

CREATE INDEX idx_broadcasts_is_deleted ON public.broadcasts(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_calendar_events_is_deleted ON public.calendar_events(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX idx_broadcasts_school_id ON public.broadcasts(school_id);

ALTER TABLE public.calendar_events ADD CONSTRAINT chk_event_dates CHECK (end_date >= start_date);

ALTER TABLE public.broadcasts ADD COLUMN version INTEGER DEFAULT 1;;
