
-- 1) Restaurant settings: replace exclusion policy with allowlist of truly public keys
DROP POLICY IF EXISTS "Public can view non-sensitive settings" ON public.restaurant_settings;
CREATE POLICY "Public can view safe settings"
ON public.restaurant_settings
FOR SELECT
USING (
  key IN ('general','working_hours','delivery')
  OR key LIKE 'seo_%'
);

-- 2) Remove reviews from Realtime broadcast (prevents leaking unapproved reviews)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reviews'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.reviews';
  END IF;
END $$;

-- 3) Strip ability for any client (anon or authenticated) to insert orders / order_items
--    directly. Only the service role (used by the create-order edge function) and admins
--    may create orders going forward. This eliminates the price-tampering attack path.
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Insert order items for own orders" ON public.order_items;

-- 4) Coupon usage: only service role / admins may record usage now (prevents bypass).
DROP POLICY IF EXISTS "Users can record coupon usage" ON public.coupon_usage;

-- 5) Make sure anon role cannot bypass via direct REST writes to these tables.
--    Service role (used by edge function) retains full access; admins via ALL policy.
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.coupon_usage FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.rewards FROM anon, authenticated;

-- Re-ensure SELECTs still work for the existing read policies
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT SELECT ON public.coupon_usage TO authenticated;
GRANT SELECT ON public.rewards TO authenticated;
GRANT ALL ON public.orders, public.order_items, public.coupon_usage, public.rewards TO service_role;
