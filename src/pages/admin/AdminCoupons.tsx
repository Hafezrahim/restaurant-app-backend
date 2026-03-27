import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ticket, Plus, Pencil, Trash2, Search, Copy } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext";

interface AdminCoupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  description: string;
  active: boolean;
}

const STORAGE_KEY = "mazaj_admin_coupons";

function loadCoupons(): AdminCoupon[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  // Seed from defaults
  const defaults: AdminCoupon[] = [
    {
      id: "1",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minOrder: 50,
      maxDiscount: 30,
      expiresAt: "2027-12-31",
      usageLimit: 1,
      usedCount: 0,
      description: "خصم 10% للطلب الأول (حتى 30 ر.س)",
      active: true,
    },
    {
      id: "2",
      code: "MAZAJ20",
      type: "fixed",
      value: 20,
      minOrder: 100,
      expiresAt: "2027-06-30",
      usageLimit: 3,
      usedCount: 0,
      description: "خصم 20 ر.س على الطلبات فوق 100 ر.س",
      active: true,
    },
    {
      id: "3",
      code: "FREE15",
      type: "percentage",
      value: 15,
      minOrder: 80,
      maxDiscount: 50,
      expiresAt: "2027-12-31",
      usageLimit: 2,
      usedCount: 0,
      description: "خصم 15% على الطلبات فوق 80 ر.س (حتى 50 ر.س)",
      active: true,
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveCoupons(coupons: AdminCoupon[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
}

const emptyCoupon: Omit<AdminCoupon, "id" | "usedCount"> = {
  code: "",
  type: "percentage",
  value: 0,
  minOrder: 0,
  maxDiscount: undefined,
  expiresAt: "",
  usageLimit: 1,
  description: "",
  active: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<AdminCoupon[]>(loadCoupons);
  const { formatPrice, currency } = useCurrency();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.includes(search)
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyCoupon);
    setDialogOpen(true);
  };

  const openEdit = (coupon: AdminCoupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount,
      expiresAt: coupon.expiresAt,
      usageLimit: coupon.usageLimit,
      description: coupon.description,
      active: coupon.active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code.trim()) {
      toast.error("يرجى إدخال كود الخصم");
      return;
    }
    if (form.value <= 0) {
      toast.error("يرجى إدخال قيمة صحيحة");
      return;
    }
    if (!form.expiresAt) {
      toast.error("يرجى تحديد تاريخ الانتهاء");
      return;
    }

    const code = form.code.trim().toUpperCase();

    // Check duplicate code
    const duplicate = coupons.find(
      (c) => c.code === code && c.id !== editingId
    );
    if (duplicate) {
      toast.error("هذا الكود مستخدم بالفعل");
      return;
    }

    let updated: AdminCoupon[];
    if (editingId) {
      updated = coupons.map((c) =>
        c.id === editingId ? { ...c, ...form, code } : c
      );
      toast.success("تم تحديث الكوبون بنجاح");
    } else {
      const newCoupon: AdminCoupon = {
        ...form,
        code,
        id: Date.now().toString(),
        usedCount: 0,
      };
      updated = [...coupons, newCoupon];
      toast.success("تم إنشاء الكوبون بنجاح");
    }

    setCoupons(updated);
    saveCoupons(updated);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const updated = coupons.filter((c) => c.id !== deleteId);
    setCoupons(updated);
    saveCoupons(updated);
    setDeleteId(null);
    toast.success("تم حذف الكوبون بنجاح");
  };

  const toggleActive = (id: string) => {
    const updated = coupons.map((c) =>
      c.id === id ? { ...c, active: !c.active } : c
    );
    setCoupons(updated);
    saveCoupons(updated);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("تم نسخ الكود");
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            إدارة الكوبونات
          </h1>
          <p className="text-muted-foreground">
            إنشاء وتعديل وحذف كوبونات الخصم
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 ml-2" />
          كوبون جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{coupons.length}</p>
          <p className="text-sm text-muted-foreground">إجمالي الكوبونات</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {coupons.filter((c) => c.active && !isExpired(c.expiresAt)).length}
          </p>
          <p className="text-sm text-muted-foreground">كوبونات نشطة</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold text-destructive">
            {coupons.filter((c) => isExpired(c.expiresAt)).length}
          </p>
          <p className="text-sm text-muted-foreground">منتهية الصلاحية</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالكود أو الوصف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الكود</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">القيمة</TableHead>
              <TableHead className="text-right">الحد الأدنى</TableHead>
              <TableHead className="text-right">الاستخدام</TableHead>
              <TableHead className="text-right">الانتهاء</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  لا توجد كوبونات
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((coupon) => (
                <TableRow key={coupon.id} className="cursor-pointer" onClick={() => openEdit(coupon)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyCode(coupon.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {coupon.type === "percentage" ? "نسبة %" : "مبلغ ثابت"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : formatPrice(coupon.value)}
                    {coupon.maxDiscount && (
                      <span className="text-xs text-muted-foreground block">
                        حد أقصى: {formatPrice(coupon.maxDiscount)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(coupon.minOrder)}</TableCell>
                  <TableCell>
                    {coupon.usedCount} / {coupon.usageLimit}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        isExpired(coupon.expiresAt)
                          ? "text-destructive"
                          : "text-foreground"
                      }
                    >
                      {coupon.expiresAt}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={() => toggleActive(coupon.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(coupon)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "تعديل الكوبون" : "إنشاء كوبون جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>كود الخصم</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="مثال: SAVE20"
                dir="ltr"
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select
                  value={form.type}
                  onValueChange={(v: "percentage" | "fixed") =>
                    setForm({ ...form, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  القيمة {form.type === "percentage" ? "(%)" : `(${currency.symbol})`}
                </Label>
                <Input
                  type="number"
                  value={form.value || ""}
                  onChange={(e) =>
                    setForm({ ...form, value: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الحد الأدنى للطلب ({currency.symbol})</Label>
                <Input
                  type="number"
                  value={form.minOrder || ""}
                  onChange={(e) =>
                    setForm({ ...form, minOrder: Number(e.target.value) })
                  }
                />
              </div>
              {form.type === "percentage" && (
                <div className="space-y-2">
                  <Label>الحد الأقصى للخصم ({currency.symbol})</Label>
                  <Input
                    type="number"
                    value={form.maxDiscount || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        maxDiscount: Number(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ الانتهاء</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>حد الاستخدام</Label>
                <Input
                  type="number"
                  value={form.usageLimit || ""}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="وصف مختصر للكوبون"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label>نشط</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "تحديث" : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف الكوبون</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            هل أنت متأكد من حذف هذا الكوبون؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoupons;
