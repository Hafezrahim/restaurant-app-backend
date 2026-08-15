-- Fix anon_orders RLS issue
-- Revoke public select from orders if it exists, or create a policy
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policy for anon if it exists
DO $$
BEGIN
    BEGIN
        DROP POLICY IF EXISTS "Allow public read access" ON public.orders;
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
END $$;

-- Only authenticated users (like clients or admins) should read orders
CREATE POLICY "Users can read own orders" 
ON public.orders 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Fix settings_allowlist
-- Remove the sensitive 'payments' key from restaurant_settings to prevent exposure
DELETE FROM public.restaurant_settings WHERE key ILIKE '%payment%' OR key ILIKE '%secret%' OR key ILIKE '%stripe%' OR key ILIKE '%api%';
