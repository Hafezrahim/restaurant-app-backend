// Server-side coupon validation. Hardcoded coupons & localStorage usage
// counters have been removed for security — validation now hits the
// `validate-coupon` Supabase edge function which consults the `public.coupons`
// table. The authoritative discount is recomputed inside the `create-order`
// function when the order is placed.
import { supabase } from '@/integrations/supabase/client';

export interface CouponValidation {
  valid: boolean;
  error?: string;
  discount?: number;
  code?: string;
}

export async function validateCoupon(
  code: string,
  orderTotal: number,
): Promise<CouponValidation> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { valid: false, error: 'يرجى إدخال كود الخصم' };

  const { data, error } = await supabase.functions.invoke('validate-coupon', {
    body: { code: trimmed, subtotal: orderTotal },
  });

  if (error) {
    // Edge function returned non-2xx; the body usually contains { error }
    const msg = (error as any)?.context?.body
      ? (() => { try { return JSON.parse((error as any).context.body).error; } catch { return null; } })()
      : null;
    return { valid: false, error: msg || 'تعذّر التحقق من الكود' };
  }
  if (!data?.valid) return { valid: false, error: data?.error || 'كود غير صالح' };
  return { valid: true, discount: Number(data.discount) || 0, code: data.code };
}

// Recording usage is now performed server-side by create-order. Kept as a
// no-op for backward compatibility with any straggling callers.
export function recordCouponUsage(_code: string, _userId?: string) {
  /* server-side only */
}
