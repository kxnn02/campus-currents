SELECT cron.schedule(
  'check-push-receipts',
  '*/1 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpseammhlqonrkwvfvec.supabase.co/functions/v1/check-push-receipts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2VhbW1obHFvbnJrd3ZmdmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzE5NzcsImV4cCI6MjA5OTYwNzk3N30.ReAkQSoEuBGQvgBWXmsKf2w4NpTwKCXAZaxUaGkBmmM"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);;
