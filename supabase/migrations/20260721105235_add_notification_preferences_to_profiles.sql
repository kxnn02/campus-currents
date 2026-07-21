ALTER TABLE public.profiles
  ADD COLUMN notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.notification_preferences IS 'Per-channel notification preferences. Keys: general, event, academic. Values: {muted: bool}';;
