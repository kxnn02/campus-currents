-- 1. Revoke direct execution of trigger functions from API roles
REVOKE EXECUTE ON FUNCTION public.auto_set_level_from_program() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_duplicate_active_emergency() FROM anon, authenticated;

-- 2. Revoke anon access to get_broadcasts_for_student (authenticated only)
REVOKE EXECUTE ON FUNCTION public.get_broadcasts_for_student(TEXT, TEXT, INT, INT, INT) FROM anon;

-- 3. Add RLS policies to push_tickets
-- Admins can read all push tickets
CREATE POLICY "Admins can read push_tickets"
  ON public.push_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Service role (Edge Functions) can insert push tickets
CREATE POLICY "Service role can insert push_tickets"
  ON public.push_tickets
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can update push tickets (for receipt checker)
CREATE POLICY "Service role can update push_tickets"
  ON public.push_tickets
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Service role can read push tickets
CREATE POLICY "Service role can read push_tickets"
  ON public.push_tickets
  FOR SELECT
  TO service_role
  USING (true);;
