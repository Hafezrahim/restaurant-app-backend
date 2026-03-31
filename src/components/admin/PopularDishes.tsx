import { TrendingUp } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface PopularDishesProps {
  items?: { name: string; orders: number; revenue: number }[];
}

export const PopularDishes = ({ items }: PopularDishesProps) => {
  const { formatPrice } = useCurrency();
  const dishes = items?.length ? items : [];

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">الأطباق الأكثر طلباً</h3>
          <p className="text-sm text-muted-foreground">حسب عدد الطلبات</p>
        </div>
        <TrendingUp className="w-5 h-5 text-accent" />
      </div>

      <div className="space-y-4">
        {dishes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد بيانات بعد</p>
        ) : (
          dishes.map((dish, index) => (
            <div 
              key={dish.name} 
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-foreground">{dish.name}</p>
                <p className="text-sm text-muted-foreground">{dish.orders} طلب</p>
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{formatPrice(dish.revenue)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
