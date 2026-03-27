import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, Clock, Users, Phone, Mail, MessageSquare, Check, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const mockReservations = [
  { id: "RES001", customerName: "أحمد محمد", phone: "0501234567", email: "ahmed@email.com", date: "2024-01-15", time: "20:00", guests: 4, tableNumber: 5, status: "pending" as const, notes: "يفضل طاولة بجانب النافذة", createdAt: "2024-01-10" },
  { id: "RES002", customerName: "سارة علي", phone: "0559876543", email: "sara@email.com", date: "2024-01-15", time: "19:00", guests: 2, tableNumber: 3, status: "confirmed" as const, notes: "", createdAt: "2024-01-09" },
  { id: "RES003", customerName: "خالد العتيبي", phone: "0567891234", email: "khaled@email.com", date: "2024-01-16", time: "21:00", guests: 6, tableNumber: 8, status: "confirmed" as const, notes: "مناسبة عيد ميلاد", createdAt: "2024-01-08" },
  { id: "RES004", customerName: "نورة السعيد", phone: "0512345678", email: "noura@email.com", date: "2024-01-14", time: "18:00", guests: 3, tableNumber: 2, status: "completed" as const, notes: "", createdAt: "2024-01-07" },
  { id: "RES005", customerName: "محمد الحربي", phone: "0598765432", email: "mohammed@email.com", date: "2024-01-14", time: "20:30", guests: 5, tableNumber: 7, status: "cancelled" as const, notes: "تم الإلغاء بسبب ظروف طارئة", createdAt: "2024-01-06" },
];

const statusMap = {
  pending: { label: "في الانتظار", variant: "secondary" as const },
  confirmed: { label: "مؤكد", variant: "default" as const },
  completed: { label: "مكتمل", variant: "outline" as const },
  cancelled: { label: "ملغي", variant: "destructive" as const },
};

const AdminReservationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const resIndex = mockReservations.findIndex((r) => r.id === id);
  const [reservation, setReservation] = useState(() => resIndex !== -1 ? mockReservations[resIndex] : null);

  const prevRes = resIndex > 0 ? mockReservations[resIndex - 1] : null;
  const nextRes = resIndex < mockReservations.length - 1 ? mockReservations[resIndex + 1] : null;
  const goTo = (r: typeof mockReservations[0]) => navigate(`/admin/reservations/${r.id}`);

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

  const updateStatus = (newStatus: typeof reservation.status) => {
    setReservation((prev) => prev ? { ...prev, status: newStatus } : null);
    toast({ title: "تم تحديث الحالة", description: "تم تحديث حالة الحجز بنجاح" });
  };

  const st = statusMap[reservation.status];

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/reservations")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">تفاصيل الحجز {reservation.id}</h1>
          <p className="text-sm text-muted-foreground">تم الإنشاء: {reservation.createdAt}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={st.variant} className="text-sm px-3 py-1">{st.label}</Badge>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={!prevRes} onClick={() => prevRes && goTo(prevRes)} title="السابق">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={!nextRes} onClick={() => nextRes && goTo(nextRes)} title="التالي">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
          <h3 className="font-bold text-foreground text-lg">معلومات العميل</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {reservation.customerName.split(" ").map((n) => n[0]).join("")}
              </div>
              <span className="font-medium text-foreground text-base">{reservation.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /><span dir="ltr">{reservation.phone}</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /><span>{reservation.email}</span></div>
          </div>
        </div>

        {/* Reservation info */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
          <h3 className="font-bold text-foreground text-lg">تفاصيل الحجز</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><div><p className="text-muted-foreground">التاريخ</p><p className="font-medium text-foreground">{reservation.date}</p></div></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><div><p className="text-muted-foreground">الوقت</p><p className="font-medium text-foreground">{reservation.time}</p></div></div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><div><p className="text-muted-foreground">عدد الأشخاص</p><p className="font-medium text-foreground">{reservation.guests}</p></div></div>
            <div><p className="text-muted-foreground">رقم الطاولة</p><p className="font-medium text-foreground">طاولة {reservation.tableNumber}</p></div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {reservation.notes && (
        <div className="bg-card rounded-2xl p-6 border border-border/50 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-bold text-foreground">ملاحظات</h3>
          </div>
          <p className="text-muted-foreground">{reservation.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        {reservation.status === "pending" && (
          <>
            <Button onClick={() => updateStatus("confirmed")} className="gap-2"><Check className="w-4 h-4" />تأكيد الحجز</Button>
            <Button variant="destructive" onClick={() => updateStatus("cancelled")} className="gap-2"><X className="w-4 h-4" />إلغاء الحجز</Button>
          </>
        )}
        {reservation.status === "confirmed" && (
          <Button onClick={() => updateStatus("completed")} className="gap-2"><Check className="w-4 h-4" />تم الاكتمال</Button>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReservationDetails;
