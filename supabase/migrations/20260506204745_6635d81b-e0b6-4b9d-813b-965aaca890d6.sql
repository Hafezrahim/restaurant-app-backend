-- 1) Coupons: require authentication to read
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;

CREATE POLICY "Authenticated users can view active coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2) Realtime channel authorization
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to their own channel" ON realtime.messages;
DROP POLICY IF EXISTS "Admins can subscribe to any channel" ON realtime.messages;

-- Allow each authenticated user to read realtime messages only on a topic
-- that is namespaced to their own auth.uid() (e.g. "user:<uid>" or "<uid>:orders").
CREATE POLICY "Users can subscribe to their own channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND realtime.topic() LIKE '%' || auth.uid()::text || '%'
);

-- Admins can subscribe to any topic for moderation/operations dashboards.
CREATE POLICY "Admins can subscribe to any channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
