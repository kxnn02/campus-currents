-- Revoke EXECUTE from PUBLIC pseudo-role (anon and authenticated inherit from PUBLIC)
REVOKE EXECUTE ON FUNCTION public.handle_broadcast_push_notification() FROM PUBLIC;;
