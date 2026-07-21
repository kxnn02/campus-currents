CREATE TABLE public.push_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id),
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  expo_ticket_id TEXT,
  expo_token TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'invalid_token')),
  error_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_at TIMESTAMPTZ NULL
);

ALTER TABLE public.push_tickets ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.push_tickets IS 'Stores Expo push ticket IDs for two-phase delivery tracking';;
