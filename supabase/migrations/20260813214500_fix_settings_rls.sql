-- Fix public access to restaurant_settings so anon users can see the dynamic logo and name
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.restaurant_settings;

CREATE POLICY "Allow public read access to settings" 
ON public.restaurant_settings 
FOR SELECT 
USING (true);

-- Ensure anon has usage on schema and select on table
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.restaurant_settings TO anon;
