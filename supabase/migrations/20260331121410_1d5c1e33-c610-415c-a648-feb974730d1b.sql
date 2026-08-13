-- Allow guest orders (user_id is null) and authenticated user orders
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  TO public
  WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id
  );

-- Allow guest order items insertion
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items"
  ON public.order_items FOR INSERT
  TO public
  WITH CHECK (true);