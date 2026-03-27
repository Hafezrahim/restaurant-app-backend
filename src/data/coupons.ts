// Coupon system for Mazaj restaurant
export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage (0-100) or fixed SAR amount
  minOrder: number;
  maxDiscount?: number; // max discount for percentage coupons
  expiresAt: string;
  usageLimit: number;
  description: string;
}

const COUPON_USAGE_KEY = 'mazaj_coupon_usage';

// Pre-defined coupons
export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrder: 50,
    maxDiscount: 30,
    expiresAt: '2027-12-31',
    usageLimit: 1,
    description: 'خصم 10% للطلب الأول (حتى 30 ر.س)',
  },
  {
    code: 'MAZAJ20',
    type: 'fixed',
    value: 20,
    minOrder: 100,
    expiresAt: '2027-06-30',
    usageLimit: 3,
    description: 'خصم 20 ر.س على الطلبات فوق 100 ر.س',
  },
  {
    code: 'FREE15',
    type: 'percentage',
    value: 15,
    minOrder: 80,
    maxDiscount: 50,
    expiresAt: '2027-12-31',
    usageLimit: 2,
    description: 'خصم 15% على الطلبات فوق 80 ر.س (حتى 50 ر.س)',
  },
];

function getCouponUsage(userId?: string): Record<string, number> {
  const key = userId ? `${COUPON_USAGE_KEY}_${userId}` : COUPON_USAGE_KEY;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : {};
}

function saveCouponUsage(usage: Record<string, number>, userId?: string) {
  const key = userId ? `${COUPON_USAGE_KEY}_${userId}` : COUPON_USAGE_KEY;
  localStorage.setItem(key, JSON.stringify(usage));
}

export interface CouponValidation {
  valid: boolean;
  error?: string;
  discount?: number;
  coupon?: Coupon;
}

export function validateCoupon(code: string, orderTotal: number, userId?: string): CouponValidation {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { valid: false, error: 'يرجى إدخال كود الخصم' };

  const coupon = AVAILABLE_COUPONS.find(c => c.code === trimmed);
  if (!coupon) return { valid: false, error: 'كود الخصم غير صالح' };

  if (new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: 'كود الخصم منتهي الصلاحية' };
  }

  if (orderTotal < coupon.minOrder) {
    return { valid: false, error: `الحد الأدنى للطلب ${coupon.minOrder} ر.س` };
  }

  const usage = getCouponUsage(userId);
  if ((usage[trimmed] || 0) >= coupon.usageLimit) {
    return { valid: false, error: 'تم استخدام هذا الكود بالحد الأقصى' };
  }

  let discount: number;
  if (coupon.type === 'percentage') {
    discount = (orderTotal * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }

  discount = Math.min(discount, orderTotal);

  return { valid: true, discount, coupon };
}

export function recordCouponUsage(code: string, userId?: string) {
  const usage = getCouponUsage(userId);
  usage[code.toUpperCase()] = (usage[code.toUpperCase()] || 0) + 1;
  saveCouponUsage(usage, userId);
}
