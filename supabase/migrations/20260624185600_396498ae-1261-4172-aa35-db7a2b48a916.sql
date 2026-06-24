
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS per_user_limit integer NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(_coupon_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.coupons
     SET used_count = COALESCE(used_count, 0) + 1
   WHERE id = _coupon_id;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(uuid) TO service_role;
