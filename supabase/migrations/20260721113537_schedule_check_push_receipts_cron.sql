SELECT cron.schedule(
  'check-push-receipts',
  '*/1 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpseammhlqonrkwvfvec.supabase.co/functions/v1/check-push-receipts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);;
