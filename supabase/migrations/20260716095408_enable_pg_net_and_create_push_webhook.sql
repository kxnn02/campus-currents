-- Enable pg_net extension for making HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the webhook trigger function
CREATE OR REPLACE FUNCTION public.handle_broadcast_push_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload jsonb;
  edge_function_url text;
  service_role_key text;
BEGIN
  -- Build the webhook payload matching what the edge function expects
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW)::jsonb,
    'old_record', NULL
  );

  -- Get the project URL and service role key from vault or hardcode
  edge_function_url := 'https://mpseammhlqonrkwvfvec.supabase.co/functions/v1/push';
  
  -- Use the service_role key to authenticate the request
  service_role_key := current_setting('supabase.service_role_key', true);
  
  -- Make async HTTP POST to the edge function
  PERFORM extensions.http_post(
    edge_function_url,
    payload::text,
    'application/json'
  );

  RETURN NEW;
END;
$$;

-- Create the trigger on broadcasts table
DROP TRIGGER IF EXISTS on_broadcast_insert_push ON public.broadcasts;
CREATE TRIGGER on_broadcast_insert_push
  AFTER INSERT ON public.broadcasts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_broadcast_push_notification();;
