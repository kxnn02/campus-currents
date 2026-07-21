-- Create a secure config table only accessible by service_role and postgres
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- Disable RLS so only service_role/postgres can access (no public access)
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- No RLS policies = no access for anon/authenticated
-- Revoke all from public roles
REVOKE ALL ON public.app_config FROM anon, authenticated;

-- Insert the webhook secret (a random 64-char hex string)
INSERT INTO public.app_config (key, value)
VALUES ('WEBHOOK_SECRET', md5(random()::text) || md5(random()::text)
)
ON CONFLICT (key) DO NOTHING;

-- Recreate the function with search_path = '' and X-Webhook-Secret header
CREATE OR REPLACE FUNCTION public.handle_broadcast_push_notification()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $function$
DECLARE
  payload jsonb;
  webhook_secret text;
BEGIN
  -- Retrieve webhook secret from app_config
  SELECT value INTO webhook_secret
  FROM public.app_config
  WHERE key = 'WEBHOOK_SECRET';

  -- Build the webhook payload matching what the edge function expects
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW)::jsonb,
    'old_record', NULL
  );

  -- Make async HTTP POST to the edge function via pg_net
  PERFORM net.http_post(
    url := 'https://mpseammhlqonrkwvfvec.supabase.co/functions/v1/push',
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Webhook-Secret', webhook_secret
    ),
    timeout_milliseconds := 10000
  );

  RETURN NEW;
END;
$function$;

-- Re-apply REVOKE to ensure new version also has restricted access
REVOKE EXECUTE ON FUNCTION public.handle_broadcast_push_notification() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_broadcast_push_notification() FROM authenticated;;
