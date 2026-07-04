import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Users, Phone, Search, Check, X, RefreshCw, UserCircle2, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { useAdminReservations, useUpdateReservationStatus } from "@/hooks/useAdminData";
import { format, formatDistanceToNow, isAfter, subMinutes } from "date-fns";
import { ar } from "date-fns/locale";


const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "في الانتظار", variant: "secondary" },
  confirmed: { label: "مؤكد", variant: "default" },
  completed: { label: "مكتمل", variant: "outline" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

const AdminReservations = () => {
  const { data: reservations = [], isLoading, isFetching, refetch, dataUpdatedAt } = useAdminReservations();
  const updateStatus = useUpdateReservationStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const filteredReservations = reservations.filter((res: any) => {
    const matchesSearch =
      res.name?.includes(searchTerm) ||
      res.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => toast.success("تم تحديث حالة الحجز"),
      onError: () => toast.error("فشل تحديث الحالة"),
    });
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const newThreshold = subMinutes(new Date(), 30);
  const isNewBooking = (r: any) => r.created_at && isAfter(new Date(r.created_at), newThreshold);
  const stats = {
    total: reservations.length,
    pending: reservations.filter((r: any) => r.status === "pending").length,
    confirmed: reservations.filter((r: any) => r.status === "confirmed").length,
    today: reservations.filter((r: any) => r.date === todayStr).length,
    new: reservations.filter(isNewBooking).length,
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              إدارة الحجوزات
              {stats.new > 0 && (
                <Badge className="bg-primary text-primary-foreground animate-pulse">
                  {stats.new} جديد
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              إدارة ومتابعة حجوزات الطاولات ({reservations.length} حجز)
              {dataUpdatedAt ? ` • آخر تحديث ${formatDistanceToNow(new Date(dataUpdatedAt), { locale: ar, addSuffix: true })}` : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 ml-2 ${isFetching ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>


        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي الحجوزات</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">في الانتظار</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-sm text-muted-foreground">مؤكد</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-sm text-muted-foreground">حجوزات اليوم</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">في الانتظار</SelectItem>
              <SelectItem value="confirmed">مؤكد</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reservations Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">التاريخ والوقت</TableHead>
                <TableHead className="text-right">عدد الأشخاص</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                        <CalendarPlus className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {reservations.length === 0 ? 'لا توجد حجوزات بعد' : 'لا توجد نتائج مطابقة'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reservations.length === 0
                            ? 'ستظهر حجوزات العملاء والزوار هنا فور استلامها.'
                            : 'جرّب تعديل البحث أو تصفية الحالة.'}
                        </p>
                      </div>
                      {reservations.length > 0 && (
                        <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                          مسح الفلاتر
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((res: any) => {
                  const badge = statusBadge[res.status] || statusBadge.pending;
                  const isGuest = !res.user_id;
                  const isNew = isNewBooking(res);
                  return (
                    <TableRow
                      key={res.id}
                      className={`cursor-pointer ${isNew ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                      onClick={() => navigate(`/admin/reservations/${res.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{res.name}</p>
                            {isNew && <Badge variant="default" className="text-[10px] px-1.5 py-0">جديد</Badge>}
                            {isGuest ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                                <UserCircle2 className="w-3 h-3" /> زائر
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">مسجّل</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {res.phone}
                          </p>
                          {res.created_at && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(res.created_at), { locale: ar, addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{res.date}</span>
                          <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                          <span>{res.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{res.guests}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">{res.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {res.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="text-accent" onClick={() => handleUpdateStatus(res.id, "confirmed")}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleUpdateStatus(res.id, "cancelled")}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReservations;
