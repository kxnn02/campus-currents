-- Drop the overly permissive delivery_receipts INSERT policy
DROP POLICY "Authenticated insert receipts" ON public.delivery_receipts;

-- Create tighter INSERT policy: user can only insert receipts for themselves
CREATE POLICY "Insert own receipts only" ON public.delivery_receipts
  FOR INSERT
  WITH CHECK (
    student_id = (SELECT auth.uid())
  );;
