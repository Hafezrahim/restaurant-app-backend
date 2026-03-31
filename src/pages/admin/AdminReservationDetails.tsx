import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, Clock, Users, Phone, Mail, MessageSquare, Check, X, Loader2 } from "lucide-react";
import { useAdminReservations, useUpdateReservationStatus } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { format } from "date-fns";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "في الانتظار", variant: "secondary" },
  confirmed: { label: "مؤكد", variant: "default" },
  completed: { label: "مكتمل", variant: "outline" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

const AdminReservationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: reservations = [], isLoading } = useAdminReservations();
  const updateStatus = useUpdateReservationStatus();

  const resIndex = reservations.findIndex((r: any) => r.id === id);
  const reservation = resIndex !== -1 ? reservations[resIndex] : undefined;
  const prevRes = resIndex > 0 ? reservations[resIndex - 1] : null;
  const nextRes = resIndex < reservations.length - 1 ? reservations[resIndex + 1] : null;

  const handleUpdateStatus = (newStatus: string) => {
    if (!reservation) return;
    updateStatus.mutate({ id: reservation.id, status: newStatus }, {
      onSuccess: () => toast.success("تم تحديث حالة الحجز"),
      onError: () => toast.error("فشل تحديث الحالة"),
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!reservation) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-foreground mb-2">الحجز غير موجود</h2>
          <Button onClick={() => navigate("/admin/reservations")}>العودة للحجوزات</Button>
        </div>
      </AdminLayout>
    );
  }

  const st = statusMap[reservation.status] || statusMap.pending;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/reservations")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">تفاصيل الحجز</h1>
          <p className="text-sm text-muted-foreground">تم الإنشاء: {format(new Date(reservation.created_at), 'yyyy-MM-dd HH:mm')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={st.variant} className="text-sm px-3 py-1">{st.label}</Badge>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={!prevRes} onClick={() => prevRes && navigate(`/admin/reservations/${prevRes.id}`)} title="السابق">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={!nextRes} onClick={() => nextRes && navigate(`/admin/reservations/${nextRes.id}`)} title="التالي">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
          <h3 className="font-bold text-foreground text-lg">معلومات العميل</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {reservation.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <span className="font-medium text-foreground text-base">{reservation.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /><span dir="ltr">{reservation.phone}</span></div>
            {reservation.email && (
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /><span>{reservation.email}</span></div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
          <h3 className="font-bold text-foreground text-lg">تفاصيل الحجز</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div><p className="text-muted-foreground">التاريخ</p><p className="font-medium text-foreground">{reservation.date}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div><p className="text-muted-foreground">الوقت</p><p className="font-medium text-foreground">{reservation.time}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div><p className="text-muted-foreground">عدد الأشخاص</p><p className="font-medium text-foreground">{reservation.guests}</p></div>
            </div>
          </div>
        </div>
      </div>

      {reservation.notes && (
        <div className="bg-card rounded-2xl p-6 border border-border/50 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-bold text-foreground">ملاحظات</h3>
          </div>
          <p className="text-muted-foreground">{reservation.notes}</p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {reservation.status === "pending" && (
          <>
            <Button onClick={() => handleUpdateStatus("confirmed")} className="gap-2" disabled={updateStatus.isPending}>
              <Check className="w-4 h-4" />تأكيد الحجز
            </Button>
            <Button variant="destructive" onClick={() => handleUpdateStatus("cancelled")} className="gap-2" disabled={updateStatus.isPending}>
              <X className="w-4 h-4" />إلغاء الحجز
            </Button>
          </>
        )}
        {reservation.status === "confirmed" && (
          <Button onClick={() => handleUpdateStatus("completed")} className="gap-2" disabled={updateStatus.isPending}>
            <Check className="w-4 h-4" />تم الاكتمال
          </Button>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReservationDetails;
