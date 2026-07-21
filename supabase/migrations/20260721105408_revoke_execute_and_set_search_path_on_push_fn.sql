-- Revoke EXECUTE on handle_broadcast_push_notification from anon and authenticated
REVOKE EXECUTE ON FUNCTION public.handle_broadcast_push_notification() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_broadcast_push_notification() FROM authenticated;

-- Set search_path = '' on the function to prevent search_path hijacking
ALTER FUNCTION public.handle_broadcast_push_notification() SET search_path = '';;
