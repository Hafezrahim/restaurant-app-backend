import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Users, Phone, Search, Check, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  tableNumber: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string;
  createdAt: string;
}

const mockReservations: Reservation[] = [
  {
    id: "RES001",
    customerName: "أحمد محمد",
    phone: "0501234567",
    email: "ahmed@email.com",
    date: "2024-01-15",
    time: "20:00",
    guests: 4,
    tableNumber: 5,
    status: "pending",
    notes: "يفضل طاولة بجانب النافذة",
    createdAt: "2024-01-10",
  },
  {
    id: "RES002",
    customerName: "سارة علي",
    phone: "0559876543",
    email: "sara@email.com",
    date: "2024-01-15",
    time: "19:00",
    guests: 2,
    tableNumber: 3,
    status: "confirmed",
    notes: "",
    createdAt: "2024-01-09",
  },
  {
    id: "RES003",
    customerName: "خالد العتيبي",
    phone: "0567891234",
    email: "khaled@email.com",
    date: "2024-01-16",
    time: "21:00",
    guests: 6,
    tableNumber: 8,
    status: "confirmed",
    notes: "مناسبة عيد ميلاد",
    createdAt: "2024-01-08",
  },
  {
    id: "RES004",
    customerName: "نورة السعيد",
    phone: "0512345678",
    email: "noura@email.com",
    date: "2024-01-14",
    time: "18:00",
    guests: 3,
    tableNumber: 2,
    status: "completed",
    notes: "",
    createdAt: "2024-01-07",
  },
  {
    id: "RES005",
    customerName: "محمد الحربي",
    phone: "0598765432",
    email: "mohammed@email.com",
    date: "2024-01-14",
    time: "20:30",
    guests: 5,
    tableNumber: 7,
    status: "cancelled",
    notes: "تم الإلغاء بسبب ظروف طارئة",
    createdAt: "2024-01-06",
  },
];

const AdminReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.customerName.includes(searchTerm) ||
      res.phone.includes(searchTerm) ||
      res.id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Reservation["status"]) => {
    const config = {
      pending: { label: "في الانتظار", variant: "secondary" as const },
      confirmed: { label: "مؤكد", variant: "default" as const },
      completed: { label: "مكتمل", variant: "outline" as const },
      cancelled: { label: "ملغي", variant: "destructive" as const },
    };
    return (
      <Badge variant={config[status].variant}>{config[status].label}</Badge>
    );
  };

  const updateStatus = (id: string, newStatus: Reservation["status"]) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
    );
    toast({
      title: "تم تحديث الحالة",
      description: `تم تحديث حالة الحجز بنجاح`,
    });
  };

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    today: reservations.filter((r) => r.date === "2024-01-15").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">إدارة الحجوزات</h1>
          <p className="text-muted-foreground">إدارة ومتابعة حجوزات الطاولات</p>
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
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">في الانتظار</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-sm text-muted-foreground">مؤكد</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
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
                <TableHead className="text-right">رقم الحجز</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">التاريخ والوقت</TableHead>
                <TableHead className="text-right">عدد الأشخاص</TableHead>
                <TableHead className="text-right">الطاولة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id} className="cursor-pointer" onClick={() => navigate(`/admin/reservations/${reservation.id}`)}>
                  <TableCell className="font-medium">{reservation.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{reservation.customerName}</p>
                      <p className="text-sm text-muted-foreground">{reservation.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{reservation.date}</span>
                      <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                      <span>{reservation.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{reservation.guests}</span>
                    </div>
                  </TableCell>
                  <TableCell>طاولة {reservation.tableNumber}</TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {reservation.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600"
                            onClick={() => updateStatus(reservation.id, "confirmed")}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => updateStatus(reservation.id, "cancelled")}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Reservation Details Dialog */}
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تفاصيل الحجز</DialogTitle>
            </DialogHeader>
            {selectedReservation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الحجز</p>
                    <p className="font-medium">{selectedReservation.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الحالة</p>
                    {getStatusBadge(selectedReservation.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">اسم العميل</p>
                  <p className="font-medium">{selectedReservation.customerName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {selectedReservation.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium text-sm">{selectedReservation.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">التاريخ</p>
                    <p className="font-medium">{selectedReservation.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الوقت</p>
                    <p className="font-medium">{selectedReservation.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">عدد الأشخاص</p>
                    <p className="font-medium">{selectedReservation.guests}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رقم الطاولة</p>
                  <p className="font-medium">طاولة {selectedReservation.tableNumber}</p>
                </div>
                {selectedReservation.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">ملاحظات</p>
                    <p className="font-medium">{selectedReservation.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminReservations;
