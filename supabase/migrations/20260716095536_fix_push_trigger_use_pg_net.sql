CREATE OR REPLACE FUNCTION public.handle_broadcast_push_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload jsonb;
BEGIN
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
      'Content-Type', 'application/json'
    ),
    timeout_milliseconds := 10000
  );

  RETURN NEW;
END;
$$;;
