
-- 1) Extend app_role enum with new RBAC roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cashier';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'kitchen';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

-- 2) Add free-delivery threshold to delivery settings (idempotent)
UPDATE public.restaurant_settings
   SET value = jsonb_set(
                 COALESCE(value, '{}'::jsonb),
                 '{freeDeliveryThreshold}',
                 to_jsonb(200),
                 true)
 WHERE key = 'delivery'
   AND NOT (COALESCE(value, '{}'::jsonb) ? 'freeDeliveryThreshold');
