import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Reply,
  Flag,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";

// Mock reviews data
const reviews = [
  {
    id: 1,
    customerName: "محمد أحمد",
    customerEmail: "mohamed@email.com",
    rating: 5,
    comment: "طعام ممتاز وخدمة رائعة! الكبسة كانت لذيذة جداً والتوصيل سريع.",
    dish: "كبسة لحم",
    orderId: "ORD-001",
    date: "2024-01-15",
    status: "published",
    helpful: 12,
    reply: null,
  },
  {
    id: 2,
    customerName: "سارة خالد",
    customerEmail: "sara@email.com",
    rating: 4,
    comment: "الطعام لذيذ لكن التوصيل تأخر قليلاً. أتمنى تحسين وقت التوصيل.",
    dish: "برياني دجاج",
    orderId: "ORD-045",
    date: "2024-01-14",
    status: "pending",
    helpful: 5,
    reply: null,
  },
  {
    id: 3,
    customerName: "أحمد علي",
    customerEmail: "ahmed@email.com",
    rating: 5,
    comment: "أفضل مطعم للأكل السعودي! الجريش كان رائعاً والموظفين ودودين جداً.",
    dish: "جريش",
    orderId: "ORD-078",
    date: "2024-01-13",
    status: "published",
    helpful: 23,
    reply: "شكراً لك أحمد! نسعد بخدمتك دائماً 🙏",
  },
  {
    id: 4,
    customerName: "فاطمة محمد",
    customerEmail: "fatima@email.com",
    rating: 3,
    comment: "الطعام جيد لكن الكمية قليلة مقارنة بالسعر.",
    dish: "مندي لحم",
    orderId: "ORD-102",
    date: "2024-01-12",
    status: "flagged",
    helpful: 8,
    reply: null,
  },
  {
    id: 5,
    customerName: "عبدالله سعيد",
    customerEmail: "abdullah@email.com",
    rating: 2,
    comment: "للأسف الطلب وصل بارداً والتغليف لم يكن جيداً.",
    dish: "سمك مقلي",
    orderId: "ORD-156",
    date: "2024-01-11",
    status: "pending",
    helpful: 2,
    reply: null,
  },
  {
    id: 6,
    customerName: "نورة عبدالرحمن",
    customerEmail: "noura@email.com",
    rating: 5,
    comment: "تجربة رائعة! الطعام طازج ولذيذ والخدمة ممتازة.",
    dish: "مظبي دجاج",
    orderId: "ORD-189",
    date: "2024-01-10",
    status: "published",
    helpful: 18,
    reply: "شكراً نورة! نتشرف بزيارتك دائماً ❤️",
  },
];

// Reviews over time data
const reviewsOverTime = [
  { month: "يناير", reviews: 45, avgRating: 4.2 },
  { month: "فبراير", reviews: 52, avgRating: 4.4 },
  { month: "مارس", reviews: 48, avgRating: 4.1 },
  { month: "أبريل", reviews: 61, avgRating: 4.5 },
  { month: "مايو", reviews: 55, avgRating: 4.3 },
  { month: "يونيو", reviews: 67, avgRating: 4.6 },
];

// Rating distribution data
const ratingDistribution = [
  { rating: "5 نجوم", count: 120, percentage: 45 },
  { rating: "4 نجوم", count: 85, percentage: 32 },
  { rating: "3 نجوم", count: 35, percentage: 13 },
  { rating: "2 نجوم", count: 18, percentage: 7 },
  { rating: "1 نجم", count: 8, percentage: 3 },
];

// Dish ratings data
const dishRatings = [
  { dish: "كبسة لحم", rating: 4.8, reviews: 45 },
  { dish: "برياني دجاج", rating: 4.6, reviews: 38 },
  { dish: "مندي لحم", rating: 4.5, reviews: 32 },
  { dish: "جريش", rating: 4.7, reviews: 28 },
  { dish: "مظبي دجاج", rating: 4.4, reviews: 25 },
];

const chartConfig = {
  reviews: { label: "التقييمات", color: "hsl(var(--primary))" },
  avgRating: { label: "متوسط التقييم", color: "hsl(142, 76%, 36%)" },
  count: { label: "العدد", color: "hsl(var(--primary))" },
  rating: { label: "التقييم", color: "hsl(45, 93%, 47%)" },
};

const COLORS = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"];

const statusConfig = {
  published: { label: "منشور", color: "bg-green-100 text-green-700" },
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700" },
  flagged: { label: "مُبلغ عنه", color: "bg-red-100 text-red-700" },
};

const AdminReviews = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<typeof reviews[0] | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.customerName.includes(searchQuery) ||
      review.comment.includes(searchQuery) ||
      review.dish.includes(searchQuery);
    const matchesRating = filterRating ? review.rating === filterRating : true;
    const matchesStatus = filterStatus ? review.status === filterStatus : true;
    return matchesSearch && matchesRating && matchesStatus;
  });

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة التقييمات</h1>
          <p className="text-muted-foreground">عرض ومراجعة تقييمات العملاء</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث في التقييمات..."
              className="pr-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 ml-2" />
            فلتر
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="w-4 h-4" />
            <span className="text-sm">متوسط التقييم</span>
          </div>
          <p className="text-2xl font-bold text-foreground flex items-center gap-1">
            {averageRating}
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">إجمالي التقييمات</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalReviews}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">قيد المراجعة</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendingReviews}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">تقييمات إيجابية</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {Math.round((positiveReviews / totalReviews) * 100)}%
          </p>
        </div>
      </div>

      {/* Advanced Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Reviews Over Time Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              توزيع التقييمات حسب الشهر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={reviewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="reviews"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="التقييمات"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Average Rating Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              تطور متوسط التقييم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <LineChart data={reviewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis domain={[3, 5]} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2 }}
                  name="متوسط التقييم"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              توزيع التقييمات حسب النجوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ChartContainer config={chartConfig} className="h-[220px] w-[220px]">
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="rating"
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="flex-1 space-y-2">
                {ratingDistribution.map((item, index) => (
                  <div key={item.rating} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm">{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Rated Dishes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              أعلى الأطباق تقييماً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dishRatings.map((dish, index) => (
                <div key={dish.dish} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{dish.dish}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{dish.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(dish.rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{dish.reviews} تقييم</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={filterStatus === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus(null)}
        >
          الكل ({reviews.length})
        </Button>
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("pending")}
        >
          قيد المراجعة ({reviews.filter((r) => r.status === "pending").length})
        </Button>
        <Button
          variant={filterStatus === "published" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("published")}
        >
          منشور ({reviews.filter((r) => r.status === "published").length})
        </Button>
        <Button
          variant={filterStatus === "flagged" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("flagged")}
        >
          مُبلغ عنه ({reviews.filter((r) => r.status === "flagged").length})
        </Button>
      </div>

      {/* Rating Filter */}
      <div className="flex gap-2 mb-6">
        {[5, 4, 3, 2, 1].map((rating) => (
          <Button
            key={rating}
            variant={filterRating === rating ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterRating(filterRating === rating ? null : rating)}
            className="flex items-center gap-1"
          >
            {rating}
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const status = statusConfig[review.status as keyof typeof statusConfig];
          return (
            <div
              key={review.id}
              className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-elevated transition-all cursor-pointer"
              onClick={() => setSelectedReview(review)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {review.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground">{review.customerName}</h3>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">• {review.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={status.color}>{status.label}</Badge>
                  <Badge variant="outline">{review.dish}</Badge>
                </div>
              </div>

              <p className="text-foreground mb-4">{review.comment}</p>

              {review.reply && (
                <div className="bg-muted/50 rounded-xl p-4 mb-4 mr-8 border-r-2 border-primary">
                  <p className="text-sm text-muted-foreground mb-1">رد المطعم:</p>
                  <p className="text-foreground">{review.reply}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {review.helpful} مفيد
                  </span>
                  <span>طلب #{review.orderId}</span>
                </div>

                <div className="flex items-center gap-2">
                  {!review.reply && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review);
                        setReplyText("");
                      }}
                    >
                      <Reply className="w-4 h-4 ml-1" />
                      رد
                    </Button>
                  )}
                  {review.status === "pending" && (
                    <Button variant="default" size="sm">
                      <CheckCircle className="w-4 h-4 ml-1" />
                      نشر
                    </Button>
                  )}
                  {review.status !== "flagged" && (
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Flag className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>الرد على تقييم {selectedReview?.customerName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {selectedReview && renderStars(selectedReview.rating)}
              </div>
              <p className="text-foreground">{selectedReview?.comment}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                ردك على التقييم
              </label>
              <Textarea
                placeholder="اكتب ردك هنا..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" disabled={!replyText.trim()}>
                إرسال الرد
              </Button>
              <Button variant="outline" onClick={() => setSelectedReview(null)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviews;
