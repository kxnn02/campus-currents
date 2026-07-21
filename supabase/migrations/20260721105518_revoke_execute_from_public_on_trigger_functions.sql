-- Revoke all execute privileges on trigger functions (they should only be invoked by triggers)
REVOKE ALL ON FUNCTION public.auto_set_level_from_program() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_duplicate_active_emergency() FROM PUBLIC, anon, authenticated;

-- For get_broadcasts_for_student: revoke from anon and public, keep authenticated
REVOKE ALL ON FUNCTION public.get_broadcasts_for_student(TEXT, TEXT, INT, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_broadcasts_for_student(TEXT, TEXT, INT, INT, INT) TO authenticated;;
