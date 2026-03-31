import { useState } from "react";
import { toast } from "sonner";
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
import {
  Search, Star, MessageSquare, ThumbsUp, Filter, Reply,
  CheckCircle, Clock, TrendingUp, Trash2, ShieldCheck,
} from "lucide-react";
import { useAdminReviews, useUpdateReviewApproval, useDeleteReview } from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminReviews = () => {
  const { data: reviews = [], isLoading } = useAdminReviews();
  const approveReview = useUpdateReviewApproval();
  const deleteReviewMut = useDeleteReview();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterApproved, setFilterApproved] = useState<boolean | null>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const filteredReviews = reviews.filter((review: any) => {
    const matchesSearch =
      review.reviewer_name?.includes(searchQuery) ||
      review.comment?.includes(searchQuery);
    const matchesRating = filterRating ? review.rating === filterRating : true;
    const matchesApproved = filterApproved !== null ? review.is_approved === filterApproved : true;
    return matchesSearch && matchesRating && matchesApproved;
  });

  const averageRating = reviews.length
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0";
  const pendingReviews = reviews.filter((r: any) => !r.is_approved).length;
  const positiveReviews = reviews.filter((r: any) => r.rating >= 4).length;

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة التقييمات</h1>
          <p className="text-muted-foreground">عرض ومراجعة تقييمات العملاء ({reviews.length} تقييم)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث في التقييمات..." className="pr-10 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
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
          <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">بانتظار الموافقة</span>
          </div>
          <p className="text-2xl font-bold text-secondary-foreground">{pendingReviews}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">تقييمات إيجابية</span>
          </div>
          <p className="text-2xl font-bold text-accent">
            {reviews.length ? Math.round((positiveReviews / reviews.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button variant={filterApproved === null ? "default" : "outline"} size="sm" onClick={() => setFilterApproved(null)}>
          الكل ({reviews.length})
        </Button>
        <Button variant={filterApproved === false ? "default" : "outline"} size="sm" onClick={() => setFilterApproved(false)}>
          بانتظار الموافقة ({pendingReviews})
        </Button>
        <Button variant={filterApproved === true ? "default" : "outline"} size="sm" onClick={() => setFilterApproved(true)}>
          معتمد ({reviews.length - pendingReviews})
        </Button>
      </div>

      {/* Rating Filter */}
      <div className="flex gap-2 mb-6">
        {[5, 4, 3, 2, 1].map((rating) => (
          <Button key={rating} variant={filterRating === rating ? "secondary" : "ghost"} size="sm" onClick={() => setFilterRating(filterRating === rating ? null : rating)} className="flex items-center gap-1">
            {rating}
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review: any) => (
            <div key={review.id} className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-elevated transition-all cursor-pointer" onClick={() => setSelectedReview(review)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {review.reviewer_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground">{review.reviewer_name || 'مجهول'}</h3>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">• {format(new Date(review.created_at), 'yyyy-MM-dd')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={review.is_approved ? "bg-accent/20 text-accent-foreground" : "bg-secondary/20 text-secondary-foreground"}>
                    {review.is_approved ? "معتمد" : "بانتظار الموافقة"}
                  </Badge>
                  {review.menu_items?.name && (
                    <Badge variant="outline">{review.menu_items.name}</Badge>
                  )}
                </div>
              </div>

              <p className="text-foreground mb-4">{review.comment || 'بدون تعليق'}</p>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {!review.is_approved && (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                    approveReview.mutate({ id: review.id, is_approved: true }, {
                      onSuccess: () => toast.success("تم اعتماد التقييم"),
                    });
                  }}>
                    <ShieldCheck className="w-4 h-4" />اعتماد
                  </Button>
                )}
                {review.is_approved && (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                    approveReview.mutate({ id: review.id, is_approved: false }, {
                      onSuccess: () => toast.success("تم إلغاء الاعتماد"),
                    });
                  }}>
                    إلغاء الاعتماد
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive gap-1" onClick={() => {
                  deleteReviewMut.mutate(review.id, {
                    onSuccess: () => toast.success("تم حذف التقييم"),
                    onError: () => toast.error("فشل حذف التقييم"),
                  });
                }}>
                  <Trash2 className="w-4 h-4" />حذف
                </Button>
              </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">لا توجد تقييمات</div>
          )}
        </div>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل التقييم - {selectedReview?.reviewer_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {selectedReview && renderStars(selectedReview.rating)}
              </div>
              <p className="text-foreground">{selectedReview?.comment}</p>
            </div>
            {selectedReview?.menu_items?.name && (
              <p className="text-sm text-muted-foreground">الطبق: {selectedReview.menu_items.name}</p>
            )}
            <Button variant="outline" onClick={() => setSelectedReview(null)}>إغلاق</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviews;
