CREATE INDEX idx_push_tickets_status_created_at
  ON public.push_tickets (status, created_at);

COMMENT ON INDEX public.idx_push_tickets_status_created_at IS 'Supports the receipt checker query that filters by status and orders by created_at';;
