-- Tighten order_items insert to require a valid order_id
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Insert order items for own orders"
  ON public.order_items FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id IS NULL OR orders.user_id = auth.uid())
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );