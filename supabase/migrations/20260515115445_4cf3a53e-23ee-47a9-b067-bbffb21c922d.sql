
-- 1. restaurant_settings: hide sensitive 'general' row from public
DROP POLICY IF EXISTS "Anyone can view settings" ON public.restaurant_settings;
CREATE POLICY "Public can view non-sensitive settings"
ON public.restaurant_settings
FOR SELECT
USING (key <> 'general');

-- 2. reservations: allow guest insert
DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;
CREATE POLICY "Users and guests can create reservations"
ON public.reservations
FOR INSERT
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() = user_id)
);

-- 3. Remove sensitive tables from realtime publication
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','user_roles','coupons','coupon_usage','rewards',
    'notifications','restaurant_settings','favorites',
    'categories','menu_items','delivery_zones'
  ]
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'skip %: %', t, SQLERRM;
    END;
  END LOOP;
END $$;
