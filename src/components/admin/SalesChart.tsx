import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';

const fallbackData = [
  { day: 'السبت', sales: 0, orders: 0 },
  { day: 'الأحد', sales: 0, orders: 0 },
  { day: 'الإثنين', sales: 0, orders: 0 },
  { day: 'الثلاثاء', sales: 0, orders: 0 },
  { day: 'الأربعاء', sales: 0, orders: 0 },
  { day: 'الخميس', sales: 0, orders: 0 },
  { day: 'الجمعة', sales: 0, orders: 0 },
];

interface SalesChartProps {
  data?: { day: string; sales: number; orders: number }[];
}

export const SalesChart = ({ data }: SalesChartProps) => {
  const { currency } = useCurrency();
  const chartData = data?.length ? data : fallbackData;

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">المبيعات الأسبوعية</h3>
          <p className="text-sm text-muted-foreground">آخر 7 أيام</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span className="text-sm text-muted-foreground">المبيعات</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} ${currency.symbol}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-elevated)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`${value} ${currency.symbol}`, 'المبيعات']}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
