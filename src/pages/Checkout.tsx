import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Receipt, MapPin, Phone, Clock, Truck, Copy, Check, Map, CreditCard, User, UserPlus, LogIn, Tag, ChevronDown, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { fetchDeliveryZones, defaultDeliveryZones, DeliveryZone } from '@/data/deliveryZones';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { CartItem } from '@/types';
import { LocationPicker } from '@/components/checkout/LocationPicker';
import { PaymentMethodSelector, PaymentMethod } from '@/components/checkout/PaymentMethodSelector';
import { useClientAuth } from '@/context/ClientAuthContext';
import { useRewards, MIN_REDEEM, SAR_PER_POINT } from '@/context/RewardsContext';
import { useNotifications } from '@/context/NotificationsContext';
import { validateCoupon } from '@/data/coupons';
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const CUSTOMER_STORAGE_KEY = 'mazaj_customer_data';

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'الدفع عند الاستلام',
  bank_transfer: 'تحويل بنكي',
  card_on_delivery: 'بطاقة عند الاستلام',
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useClientAuth();
  const { points, canRedeem, pointsValue, redeemPoints, refresh: refreshRewards } = useRewards();
  const { addNotification } = useNotifications();
  const { formatPrice, currency } = useCurrency();
  const [redeemingPoints, setRedeemingPoints] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [step, setStep] = useState<'mode' | 'form' | 'receipt'>('mode');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const receiptCardRef = useRef<HTMLDivElement>(null);
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<PaymentMethod>('cash');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    lat: 0,
    lng: 0,
  });

  // Delivery zones + free-delivery threshold — loaded from the database
  // (never from localStorage) so the customer cannot tamper with the fee.
  // The edge function also re-reads the chosen zone's price server-side
  // for authoritative totals.
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(defaultDeliveryZones);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    fetchDeliveryZones().then((zones) => {
      if (cancelled) return;
      setDeliveryZones(zones);
      setSelectedZoneId((prev) => prev || zones[0]?.id || '');
    });
    // Free-delivery threshold lives in restaurant_settings.delivery.freeDeliveryThreshold
    supabase
      .from('restaurant_settings')
      .select('value')
      .eq('key', 'delivery')
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const v = (data?.value as { freeDeliveryThreshold?: number } | null)?.freeDeliveryThreshold;
        if (typeof v === 'number' && v > 0) setFreeDeliveryThreshold(v);
      });
    return () => { cancelled = true; };
  }, []);

  const selectedZone = useMemo(
    () => deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0],
    [deliveryZones, selectedZoneId],
  );

  // Check for stored customer data (UI convenience only — NOT used for pricing)
  const storedData = localStorage.getItem(CUSTOMER_STORAGE_KEY);
  const hasStoredData = !!storedData;

  // Totals are recomputed on every render from DB-backed inputs:
  // selected zone fee, free-delivery threshold, cart subtotal, discounts.
  // No price input is ever read from localStorage.
  const currentTotal = step === 'receipt' ? orderTotal : totalPrice;
  const isFreeDelivery = useMemo(
    () => freeDeliveryThreshold > 0 && currentTotal >= freeDeliveryThreshold,
    [freeDeliveryThreshold, currentTotal],
  );
  const deliveryFee = useMemo(
    () => (isFreeDelivery ? 0 : selectedZone?.price || 0),
    [isFreeDelivery, selectedZone],
  );
  const tax = useMemo(() => currentTotal * 0.15, [currentTotal]);
  const grandTotal = useMemo(
    () => currentTotal + deliveryFee + tax - pointsDiscount - couponDiscount,
    [currentTotal, deliveryFee, tax, pointsDiscount, couponDiscount],
  );
  const displayItems = step === 'receipt' ? orderItems : items;

  const handleApplyCoupon = async () => {
    setCouponError('');
    const result = await validateCoupon(couponCode, totalPrice);
    if (result.valid && result.discount) {
      setCouponDiscount(result.discount);
      setCouponApplied(true);
      toast.success(`تم تطبيق الكوبون! خصم ${formatPrice(result.discount.toFixed(1))}`);
    } else {
      setCouponError(result.error || 'كود غير صالح');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponError('');
  };

  // Handle receipt file preview
  useEffect(() => {
    if (receiptFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(receiptFile);
    } else {
      setReceiptPreview(null);
    }
  }, [receiptFile]);

  useEffect(() => {
    if (items.length === 0 && step !== 'receipt') {
      navigate('/cart');
    }
  }, [items, navigate, step]);

  // Handle customer mode selection
  const handleSelectGuest = () => {
    setStep('form');
  };

  const handleSelectReturning = () => {
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setFormData({
        name: parsed.name || '',
        phone: parsed.phone || '',
        address: parsed.address || '',
        notes: '',
        lat: parsed.lat || 0,
        lng: parsed.lng || 0,
      });
    }
    setStep('form');
  };

  const handleSelectRegistered = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        notes: '',
        lat: user.lat || 0,
        lng: user.lng || 0,
      });
    }
    setStep('form');
  };

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    setFormData({ ...formData, address, lat, lng });
    setShowLocationPicker(false);
    toast.success('تم تحديد الموقع بنجاح');
  };

  const generateTrackingNumber = () => {
    const prefix = 'MZJ';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (paymentMethod === 'bank_transfer' && !receiptFile) {
      toast.error('يرجى رفع صورة إيصال التحويل البنكي');
      return;
    }

    // Persist customer data for future orders
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify({
      name: formData.name, phone: formData.phone, address: formData.address,
      lat: formData.lat, lng: formData.lng,
    }));

    // Map UI payment method to DB enum
    const dbPaymentMethod = paymentMethod === 'card_on_delivery' ? 'card' : paymentMethod;

    // Call the trusted edge function — it recomputes prices, taxes,
    // coupon discount, and points redemption from the database.
    const { data: result, error: fnError } = await supabase.functions.invoke('create-order', {
      body: {
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        customer: {
          name: formData.name, phone: formData.phone, address: formData.address,
          lat: formData.lat || undefined, lng: formData.lng || undefined,
        },
        delivery_zone_id: selectedZone?.id,
        payment_method: dbPaymentMethod,
        notes: formData.notes || undefined,
        coupon_code: couponApplied ? couponCode : undefined,
        redeem_points: pointsDiscount > 0,
      },
    });

    if (fnError || !result?.tracking_number) {
      const msg = (() => {
        try { return JSON.parse((fnError as any)?.context?.body)?.error; } catch { return null; }
      })();
      console.error('Order create error:', fnError);
      toast.error(msg || 'حدث خطأ أثناء حفظ الطلب');
      return;
    }

    const tracking = result.tracking_number as string;
    const orderGrandTotal = Number(result.total);

    // Store order data before clearing
    setOrderItems([...items]);
    setOrderTotal(Number(result.subtotal));
    setOrderPaymentMethod(paymentMethod);
    setTrackingNumber(tracking);
    setCouponDiscount(Number(result.coupon_discount) || 0);
    setPointsDiscount(Number(result.points_discount) || 0);

    // Save order to local client history (UI cache only — DB is source of truth)
    if (isAuthenticated) {
      const existingOrders = JSON.parse(localStorage.getItem('mazaj_client_orders') || '[]');
      existingOrders.unshift({
        trackingNumber: tracking,
        date: new Date().toISOString(),
        dateFormatted: new Date().toLocaleDateString('ar-SA'),
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
        total: orderGrandTotal,
        subtotal: Number(result.subtotal),
        deliveryFee: Number(result.delivery_fee),
        tax: Number(result.tax),
        status: 'pending',
        items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        customer: { name: formData.name, phone: formData.phone, address: formData.address },
        paymentMethod: paymentMethodLabels[paymentMethod],
        deliveryZone: selectedZone?.name || '',
        estimatedTime: selectedZone?.estimatedTime || '30 - 45',
      });
      localStorage.setItem('mazaj_client_orders', JSON.stringify(existingOrders));

      // Refresh server-backed rewards (points were updated server-side)
      refreshRewards();

      const earnedPts = Math.floor(orderGrandTotal);
      addNotification({
        title: 'تم استلام طلبك',
        message: `طلبك رقم ${tracking} قيد المراجعة وسيتم تجهيزه قريباً`,
        type: 'order',
      });
      if (earnedPts > 0) {
        addNotification({
          title: `حصلت على ${earnedPts} نقطة!`,
          message: `تم إضافة ${earnedPts} نقطة مكافآت لحسابك`,
          type: 'reward',
        });
      }
    }

    setStep('receipt');
    clearCart();
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    toast.success('تم نسخ رقم التتبع');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = useCallback(async () => {
    if (!receiptCardRef.current) return;
    try {
      const canvas = await html2canvas(receiptCardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `فاتورة-${trackingNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('تم تحميل الفاتورة بنجاح');
    } catch {
      toast.error('فشل تحميل الفاتورة');
    }
  }, [trackingNumber]);

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (step === 'receipt') {
    return (
      <>
        <Helmet>
          <title>تأكيد الطلب - مطعم مزاج</title>
        </Helmet>
        <AppLayout title="تأكيد الطلب" showSearch={false}>
          <div className="max-w-md mx-auto">
            {/* Success Animation */}
            <div className="text-center mb-6 animate-scale-in">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">تم استلام طلبك!</h1>
              <p className="text-muted-foreground">شكراً لك، سيتم تجهيز طلبك قريباً</p>
            </div>

            {/* Receipt Card */}
            <div ref={receiptCardRef} className="bg-card rounded-3xl shadow-elegant overflow-hidden animate-fade-in" dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
              {/* Receipt Header */}
              <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center">
                <img src={logo} alt="مزاج" className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-white/30" />
                <h2 className="text-white font-bold text-lg">مطعم مزاج</h2>
                <p className="text-white/70 text-xs mt-1">MAZAG Restaurant</p>
                <p className="text-white/80 text-sm mt-2">فاتورة الطلب</p>
              </div>

              {/* Tracking Number */}
              <div className="p-4 bg-secondary/30 border-b border-border">
                <p className="text-sm text-muted-foreground mb-2 text-center">رقم التتبع</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-lg font-mono font-bold text-primary tracking-wider">
                    {trackingNumber}
                  </code>
                  <button
                    onClick={handleCopyTracking}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-4 space-y-4">
                {/* Date & Time */}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{currentDate}</span>
                </div>

                {/* Delivery Info */}
                <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{formData.name}</p>
                      <p className="text-sm text-muted-foreground">{formData.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground" dir="ltr">{formData.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">{paymentMethodLabels[orderPaymentMethod]}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-border my-4" />

                {/* Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">تفاصيل الطلب</h3>
                  {displayItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <span className="text-foreground">{item.name}</span>
                      </div>
                      <span className="text-foreground font-medium">
                        {formatPrice((item.price * item.quantity).toFixed(2))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-border my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="text-foreground">{formatPrice(currentTotal.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">رسوم التوصيل ({selectedZone?.name})</span>
                    <span className="text-foreground">{formatPrice(deliveryFee.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الضريبة (15%)</span>
                    <span className="text-foreground">{formatPrice(tax.toFixed(2))}</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">الإجمالي</span>
                      <span className="font-bold text-xl text-primary">{formatPrice(grandTotal.toFixed(2))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="p-4 bg-gradient-to-r from-accent/20 to-secondary/20 border-t border-border">
                <div className="flex items-center justify-center gap-3">
                  <Truck className="w-5 h-5 text-accent" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">الوقت المتوقع للتوصيل</p>
                    <p className="font-bold text-foreground">{selectedZone?.estimatedTime || '30 - 45'} دقيقة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={handleDownloadPNG}
                variant="outline"
                className="w-full rounded-full"
                size="lg"
              >
                <Download className="w-4 h-4 ml-2" />
                تحميل الفاتورة كصورة
              </Button>
              <Button
                onClick={() => navigate(`/track-order?order=${trackingNumber}`)}
                className="w-full btn-primary rounded-full"
                size="lg"
              >
                تتبع الطلب
              </Button>
              <Button
                onClick={() => navigate('/menu')}
                variant="outline"
                className="w-full rounded-full"
                size="lg"
              >
                طلب المزيد
              </Button>
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  // Mode selection screen
  if (step === 'mode') {
    return (
      <>
        <Helmet>
          <title>إتمام الطلب - مطعم مزاج</title>
        </Helmet>
        <AppLayout title="إتمام الطلب" showSearch={false}>
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-2xl p-5 shadow-card space-y-4">
              <h2 className="font-bold text-lg text-foreground text-center mb-4">مرحباً بك في مطعم مزاج</h2>
              <p className="text-muted-foreground text-center text-sm mb-6">كيف تريد إتمام طلبك؟</p>

              <div className="grid gap-3">
                {/* Registered Client */}
                {isAuthenticated && (
                  <button onClick={handleSelectRegistered} className="w-full p-4 bg-primary/10 hover:bg-primary/20 border-2 border-primary rounded-2xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="text-right flex-1">
                        <h3 className="font-bold text-foreground">حسابي ({user?.name})</h3>
                        <p className="text-sm text-muted-foreground">استخدم بيانات حسابك المسجل</p>
                      </div>
                    </div>
                  </button>
                )}

                {!isAuthenticated && (
                  <button onClick={() => navigate('/client/login')} className="w-full p-4 bg-primary/10 hover:bg-primary/20 border-2 border-primary rounded-2xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <LogIn className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="text-right flex-1">
                        <h3 className="font-bold text-foreground">تسجيل دخول</h3>
                        <p className="text-sm text-muted-foreground">سجّل دخولك أو أنشئ حساباً</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Returning Guest */}
                {hasStoredData && (
                  <button onClick={handleSelectReturning} className="w-full p-4 bg-accent/10 hover:bg-accent/20 border-2 border-accent rounded-2xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div className="text-right flex-1">
                        <h3 className="font-bold text-foreground">بياناتي المحفوظة</h3>
                        <p className="text-sm text-muted-foreground">استخدم بياناتك من الطلب السابق</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Guest */}
                <button onClick={handleSelectGuest} className="w-full p-4 bg-muted/50 hover:bg-muted border-2 border-border hover:border-primary/50 rounded-2xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="font-bold text-foreground">زائر</h3>
                      <p className="text-sm text-muted-foreground">أدخل بياناتك يدوياً</p>
                    </div>
                  </div>
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">سيتم حفظ بياناتك لتسهيل طلباتك القادمة</p>
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>إتمام الطلب - مطعم مزاج</title>
      </Helmet>
      <AppLayout title="إتمام الطلب" showSearch={false}>
        {showLocationPicker && (
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationPicker(false)}
          />
        )}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {/* Delivery Information */}
          <div className="bg-card rounded-2xl p-5 shadow-card space-y-4">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              معلومات التوصيل
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">الاسم الكامل *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك"
                  className="rounded-xl"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">رقم الهاتف *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  type="tel"
                  dir="ltr"
                  className="rounded-xl"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">العنوان *</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="المدينة، الحي، الشارع"
                    className="rounded-xl flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowLocationPicker(true)}
                    className="rounded-xl shrink-0"
                  >
                    <Map className="w-5 h-5 text-primary" />
                  </Button>
                </div>
                {formData.lat !== 0 && formData.lng !== 0 && (
                  <p className="text-xs text-accent mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    تم تحديد الموقع على الخريطة
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ملاحظات إضافية</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات خاصة بالطلب"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Delivery Zone Selector */}
          <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              منطقة التوصيل
            </h2>
            <div className="space-y-2">
              {deliveryZones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-right flex items-center gap-3 ${
                    selectedZoneId === zone.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                    <MapPin className={`w-5 h-5 ${selectedZoneId === zone.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${selectedZoneId === zone.id ? 'text-primary' : 'text-foreground'}`}>
                      {zone.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{zone.estimatedTime} دقيقة</p>
                  </div>
                  <span className={`font-bold text-sm ${selectedZoneId === zone.id ? 'text-primary' : 'text-muted-foreground'}`}>
                    {formatPrice(zone.price)}
                  </span>
                  {selectedZoneId === zone.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-primary" />
              ملخص الطلب
            </h2>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-foreground">{formatPrice((item.price * item.quantity).toFixed(2))}</span>
                </div>
              ))}
              
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{formatPrice(totalPrice.toFixed(2))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">رسوم التوصيل ({selectedZone?.name})</span>
                  <span>{formatPrice(deliveryFee.toFixed(2))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الضريبة (15%)</span>
                  <span>{formatPrice(tax.toFixed(2))}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">الإجمالي</span>
                  <span className="font-bold text-xl text-primary">{formatPrice(grandTotal.toFixed(2))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
              receiptFile={receiptFile}
              onReceiptChange={setReceiptFile}
              receiptPreview={receiptPreview}
            />
          </div>

          {/* Coupon Code */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-primary" />
              كود الخصم
            </h3>
            {!couponApplied ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    placeholder="أدخل كود الخصم"
                    className="rounded-xl flex-1 font-mono"
                    dir="ltr"
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl px-4"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim()}
                  >
                    تطبيق
                  </Button>
                </div>
                {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                <p className="text-[11px] text-muted-foreground">جرّب: WELCOME10, MAZAJ20, FREE15</p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                <div>
                  <p className="text-sm font-bold text-green-600">✅ {couponCode}</p>
                  <p className="text-xs text-muted-foreground">خصم {formatPrice(couponDiscount.toFixed(1))}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="text-xs text-destructive" onClick={handleRemoveCoupon}>
                  إزالة
                </Button>
              </div>
            )}
          </div>

          {/* Rewards Points Redemption */}
          {isAuthenticated && canRedeem && pointsDiscount === 0 && (
            <div className="bg-card rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-sm">🎁 نقاط المكافآت</h3>
                  <p className="text-xs text-muted-foreground">لديك {points} نقطة ({formatPrice(pointsValue.toFixed(1))})</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => {
                    const discount = redeemPoints(points);
                    if (discount > 0) {
                      setPointsDiscount(discount);
                      toast.success(`تم خصم ${formatPrice(discount.toFixed(1))} من نقاطك`);
                    }
                  }}
                >
                  استبدال الكل
                </Button>
              </div>
            </div>
          )}

          {(pointsDiscount > 0 || couponDiscount > 0) && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 space-y-1">
              {pointsDiscount > 0 && <p className="text-sm font-bold text-green-600">🎁 خصم نقاط: -{formatPrice(pointsDiscount.toFixed(1))}</p>}
              {couponDiscount > 0 && <p className="text-sm font-bold text-green-600">🏷️ خصم كوبون: -{formatPrice(couponDiscount.toFixed(1))}</p>}
            </div>
          )}

          {isAuthenticated && !canRedeem && points > 0 && (
            <div className="bg-card rounded-2xl p-4 shadow-card text-center">
              <p className="text-xs text-muted-foreground">🎁 لديك {points} نقطة - تحتاج {MIN_REDEEM} نقطة للاستبدال</p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full btn-primary rounded-full" size="lg">
            تأكيد الطلب
          </Button>
        </form>
      </AppLayout>
    </>
  );
};

export default Checkout;
