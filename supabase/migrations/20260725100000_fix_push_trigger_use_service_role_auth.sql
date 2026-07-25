-- Fix: Use Authorization Bearer token (service_role key) instead of custom WEBHOOK_SECRET.
-- The WEBHOOK_SECRET approach required manual syncing between app_config table and 
-- Edge Function env vars, which is the root cause of push notifications silently failing.
-- The service_role key is auto-available in Supabase Edge Functions as SUPABASE_SERVICE_ROLE_KEY.

CREATE OR REPLACE FUNCTION public.handle_broadcast_push_notification()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $function$
DECLARE
  payload jsonb;
  service_key text;
BEGIN
  -- Get the service role key (available in Supabase PostgreSQL as a GUC)
  service_key := current_setting('app.settings.service_role_key', true);

  -- Build the webhook payload matching what the edge function expects
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW)::jsonb,
    'old_record', NULL
  );

  -- Make async HTTP POST to the edge function via pg_net
  -- Uses Authorization Bearer token (same pattern as check-push-receipts cron)
  PERFORM net.http_post(
    url := 'https://mpseammhlqonrkwvfvec.supabase.co/functions/v1/push',
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    timeout_milliseconds := 10000
  );

  RETURN NEW;
END;
$function$;
