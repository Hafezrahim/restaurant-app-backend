import React, { useState, useRef } from 'react';
import { CreditCard, Banknote, Building2, Upload, X, Check, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card_on_delivery';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  receiptFile: File | null;
  onReceiptChange: (file: File | null) => void;
  receiptPreview: string | null;
}

const paymentMethods = [
  {
    id: 'cash' as PaymentMethod,
    name: 'الدفع عند الاستلام',
    description: 'ادفع نقداً للمندوب',
    icon: Banknote,
  },
  {
    id: 'bank_transfer' as PaymentMethod,
    name: 'تحويل بنكي',
    description: 'حوّل المبلغ وارفق الإيصال',
    icon: Building2,
  },
  {
    id: 'card_on_delivery' as PaymentMethod,
    name: 'بطاقة عند الاستلام',
    description: 'ادفع بالبطاقة للمندوب',
    icon: CreditCard,
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  receiptFile,
  onReceiptChange,
  receiptPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار صورة فقط');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      onReceiptChange(file);
      toast.success('تم رفع صورة الإيصال بنجاح');
    }
  };

  const handleRemoveReceipt = () => {
    onReceiptChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-primary" />
        طريقة الدفع
      </h3>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onMethodChange(method.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-right flex items-center gap-4 ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {method.name}
                </p>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bank Transfer Receipt Upload */}
      {selectedMethod === 'bank_transfer' && (
        <div className="mt-4 p-4 bg-muted/30 rounded-xl space-y-3 animate-fade-in">
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
            <p className="text-sm font-medium text-foreground mb-2">معلومات الحساب البنكي:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>البنك: بنك الراجحي</p>
              <p>اسم الحساب: مطعم مزاج</p>
              <p className="font-mono" dir="ltr">رقم الحساب: SA00 0000 0000 0000 0000 0000</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!receiptFile ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-dashed border-2 h-24 flex flex-col gap-2"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-muted-foreground">اضغط لرفع صورة الإيصال</span>
            </Button>
          ) : (
            <div className="relative">
              <div className="rounded-xl overflow-hidden border border-border bg-card">
                {receiptPreview && (
                  <img
                    src={receiptPreview}
                    alt="صورة الإيصال"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Image className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{receiptFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveReceipt}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                تم الرفع
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            يرجى رفع صورة واضحة لإيصال التحويل البنكي
          </p>
        </div>
      )}
    </div>
  );
};
