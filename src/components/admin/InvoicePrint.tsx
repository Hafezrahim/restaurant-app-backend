import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, X } from "lucide-react";
import { forwardRef, useRef } from "react";
import logo from "@/assets/logo.png";
import { useCurrency } from "@/context/CurrencyContext";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  phone: string;
  items: OrderItem[];
  total: string;
  status: string;
  type: string;
  address: string;
  time: string;
  paymentMethod: string;
}

interface InvoicePrintProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(({ order, open, onClose }, _ref) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "", "width=400,height=600");
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl">
            <head>
              <title>فاتورة ${order?.id}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
                  padding: 20px; 
                  background: white;
                  color: #1a1a1a;
                  direction: rtl;
                }
                .invoice { max-width: 350px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 15px; margin-bottom: 15px; }
                .logo { font-size: 24px; font-weight: bold; color: #ea580c; margin-bottom: 5px; }
                .order-id { font-size: 14px; color: #666; }
                .section { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #eee; }
                .section-title { font-weight: bold; margin-bottom: 10px; font-size: 14px; color: #333; }
                .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px; }
                .row-label { color: #666; }
                .items { }
                .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
                .item-name { display: flex; align-items: center; gap: 8px; }
                .item-qty { background: #f5f5f5; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
                .total-section { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 15px; }
                .total-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px; }
                .grand-total { font-size: 18px; font-weight: bold; color: #ea580c; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
                .barcode { text-align: center; margin: 15px 0; font-family: monospace; font-size: 14px; letter-spacing: 3px; }
                @media print { body { padding: 10px; } }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  if (!order) return null;

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.15;
  const grandTotal = subtotal + tax;
  const orderDate = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>طباعة الفاتورة</DialogTitle>
        </DialogHeader>

        {/* Invoice Preview */}
        <div ref={printRef} className="bg-white p-6 rounded-lg border border-border">
          <div className="invoice">
            {/* Header */}
            <div className="header text-center border-b-2 border-dashed border-muted pb-4 mb-4">
              <div className="flex justify-center mb-3">
                <img src={logo} alt="مزاج" className="w-16 h-16 rounded-full object-cover" />
              </div>
              <div className="text-lg font-bold text-primary mb-1">MAZAG</div>
              <div className="text-sm text-muted-foreground">فاتورة ضريبية مبسطة</div>
              <div className="order-id text-sm text-muted-foreground mt-2">
                رقم الطلب: <span className="font-bold text-foreground">{order.id}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{orderDate}</div>
            </div>

            {/* Customer Info */}
            <div className="section mb-4 pb-4 border-b border-dashed border-muted">
              <div className="section-title font-bold mb-2 text-sm">معلومات العميل</div>
              <div className="row flex justify-between text-sm mb-1">
                <span className="row-label text-muted-foreground">الاسم:</span>
                <span className="font-medium">{order.customer}</span>
              </div>
              <div className="row flex justify-between text-sm mb-1">
                <span className="row-label text-muted-foreground">الهاتف:</span>
                <span className="font-medium" dir="ltr">{order.phone}</span>
              </div>
              {order.type === "delivery" && (
                <div className="row flex justify-between text-sm mb-1">
                  <span className="row-label text-muted-foreground">العنوان:</span>
                  <span className="font-medium text-left max-w-[180px]">{order.address}</span>
                </div>
              )}
              <div className="row flex justify-between text-sm mb-1">
                <span className="row-label text-muted-foreground">نوع الطلب:</span>
                <span className="font-medium">{order.type === "delivery" ? "توصيل" : "استلام"}</span>
              </div>
            </div>

            {/* Items */}
            <div className="section mb-4 pb-4 border-b border-dashed border-muted">
              <div className="section-title font-bold mb-3 text-sm">الأصناف</div>
              <div className="items space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="item flex justify-between py-2 border-b border-muted/50">
                    <div className="item-name flex items-center gap-2">
                      <span className="item-qty bg-muted px-2 py-0.5 rounded text-xs">{item.qty}x</span>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-medium text-sm">{formatPrice((item.price * item.qty).toFixed(2))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="total-section bg-muted/30 p-4 rounded-lg">
              <div className="total-row flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">المجموع الفرعي:</span>
                <span>{formatPrice(subtotal.toFixed(2))}</span>
              </div>
              <div className="total-row flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">ضريبة القيمة المضافة (15%):</span>
                <span>{formatPrice(tax.toFixed(2))}</span>
              </div>
              <div className="grand-total flex justify-between text-lg font-bold text-primary border-t border-border pt-3 mt-3">
                <span>الإجمالي:</span>
                <span>{formatPrice(grandTotal.toFixed(2))}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4 text-center">
              <div className="text-sm text-muted-foreground">
                طريقة الدفع: <span className="font-medium text-foreground">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Barcode */}
            <div className="barcode text-center mt-4 font-mono text-sm tracking-widest">
              ||| {order.id.replace("#", "")} |||
            </div>

            {/* Footer */}
            <div className="footer text-center mt-4 text-xs text-muted-foreground">
              <p>شكراً لزيارتكم!</p>
              <p className="mt-1">للاستفسارات: 920001234</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <Button onClick={handlePrint} className="w-full mt-4">
          <Printer className="w-4 h-4 ml-2" />
          طباعة الفاتورة
        </Button>
      </DialogContent>
    </Dialog>
  );
});
InvoicePrint.displayName = "InvoicePrint";
