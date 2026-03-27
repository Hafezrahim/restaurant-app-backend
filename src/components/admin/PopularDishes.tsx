import { TrendingUp } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

const dishes = [
  { 
    name: "برجر كلاسيك", 
    orders: 145, 
    revenue: 4350,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop",
    trend: "+12%"
  },
  { 
    name: "بيتزا مارغريتا", 
    orders: 128, 
    revenue: 5120,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=100&h=100&fit=crop",
    trend: "+8%"
  },
  { 
    name: "شاورما لحم", 
    orders: 112, 
    revenue: 2800,
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=100&h=100&fit=crop",
    trend: "+15%"
  },
  { 
    name: "سوشي رولز", 
    orders: 98, 
    revenue: 4900,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop",
    trend: "+5%"
  },
  { 
    name: "كباب مشوي", 
    orders: 87, 
    revenue: 3480,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=100&h=100&fit=crop",
    trend: "+10%"
  },
];

export const PopularDishes = () => {
  const { formatPrice } = useCurrency();
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">الأطباق الأكثر طلباً</h3>
          <p className="text-sm text-muted-foreground">هذا الأسبوع</p>
        </div>
        <TrendingUp className="w-5 h-5 text-accent" />
      </div>

      <div className="space-y-4">
        {dishes.map((dish, index) => (
          <div 
            key={dish.name} 
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
              {index + 1}
            </span>
            <img 
              src={dish.image} 
              alt={dish.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">{dish.name}</p>
              <p className="text-sm text-muted-foreground">{dish.orders} طلب</p>
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">{formatPrice(dish.revenue)}</p>
              <p className="text-xs text-accent">{dish.trend}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
