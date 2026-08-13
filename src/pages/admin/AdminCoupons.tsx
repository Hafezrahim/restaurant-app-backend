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
import { useAdminCoupons, useUpsertCoupon, useDeleteCoupon } from "@/hooks/useAdminData";

const emptyForm = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: 0,
  min_order: 0,
  max_discount: null as number | null,
  expires_at: "",
  usage_limit: 1,
  description: "",
  is_active: true,
};

const AdminCoupons = () => {
  const { data: coupons = [], isLoading } = useAdminCoupons();
  const upsertCoupon = useUpsertCoupon();
  const deleteCouponMut = useDeleteCoupon();
  const { formatPrice, currency } = useCurrency();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = coupons.filter(
    (c: any) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.includes(search)
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      min_order: Number(coupon.min_order),
      max_discount: coupon.max_discount ? Number(coupon.max_discount) : null,
      expires_at: coupon.expires_at?.split('T')[0] || "",
      usage_limit: coupon.usage_limit,
      description: coupon.description || "",
      is_active: coupon.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code.trim()) return toast.error("يرجى إدخال كود الخصم");
    if (form.value <= 0) return toast.error("يرجى إدخال قيمة صحيحة");

    const payload: any = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: form.value,
      min_order: form.min_order,
      max_discount: form.max_discount,
      expires_at: form.expires_at || null,
      usage_limit: form.usage_limit,
      description: form.description,
      is_active: form.is_active,
    };
    if (editingId) payload.id = editingId;

    upsertCoupon.mutate(payload, {
      onSuccess: () => {
        toast.success(editingId ? "تم تحديث الكوبون" : "تم إنشاء الكوبون");
        setDialogOpen(false);
      },
      onError: () => toast.error("فشل حفظ الكوبون"),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCouponMut.mutate(deleteId, {
      onSuccess: () => { setDeleteId(null); toast.success("تم حذف الكوبون"); },
      onError: () => toast.error("فشل حذف الكوبون"),
    });
  };

  const toggleActive = (coupon: any) => {
    upsertCoupon.mutate({ id: coupon.id, is_active: !coupon.is_active });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("تم نسخ الكود");
  };

  const isExpired = (date: string | null) => date ? new Date(date) < new Date() : false;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            إدارة الكوبونات
          </h1>
          <p className="text-muted-foreground">إنشاء وتعديل وحذف كوبونات الخصم</p>
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
          <p className="text-2xl font-bold text-accent">
            {coupons.filter((c: any) => c.is_active && !isExpired(c.expires_at)).length}
          </p>
          <p className="text-sm text-muted-foreground">كوبونات نشطة</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold text-destructive">
            {coupons.filter((c: any) => isExpired(c.expires_at)).length}
          </p>
          <p className="text-sm text-muted-foreground">منتهية الصلاحية</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="بحث بالكود أو الوصف..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
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
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">لا توجد كوبونات</TableCell></TableRow>
            ) : (
              filtered.map((coupon: any) => (
                <TableRow key={coupon.id} className="cursor-pointer" onClick={() => openEdit(coupon)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary">{coupon.code}</code>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); copyCode(coupon.code); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{coupon.type === "percentage" ? "نسبة %" : "مبلغ ثابت"}</Badge></TableCell>
                  <TableCell>
                    {coupon.type === "percentage" ? `${coupon.value}%` : formatPrice(Number(coupon.value))}
                    {coupon.max_discount && <span className="text-xs text-muted-foreground block">حد أقصى: {formatPrice(Number(coupon.max_discount))}</span>}
                  </TableCell>
                  <TableCell>{formatPrice(Number(coupon.min_order))}</TableCell>
                  <TableCell>{coupon.used_count} / {coupon.usage_limit}</TableCell>
                  <TableCell>
                    <span className={isExpired(coupon.expires_at) ? "text-destructive" : "text-foreground"}>
                      {coupon.expires_at?.split('T')[0] || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch checked={coupon.is_active} onCheckedChange={() => toggleActive(coupon)} onClick={(e) => e.stopPropagation()} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(coupon)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(coupon.id)}>
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
            <DialogTitle>{editingId ? "تعديل الكوبون" : "إنشاء كوبون جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>كود الخصم</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="مثال: SAVE20" dir="ltr" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select value={form.type} onValueChange={(v: "percentage" | "fixed") => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>القيمة {form.type === "percentage" ? "(%)" : `(${currency.symbol})`}</Label>
                <Input type="number" value={form.value || ""} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الحد الأدنى ({currency.symbol})</Label>
                <Input type="number" value={form.min_order || ""} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })} />
              </div>
              {form.type === "percentage" && (
                <div className="space-y-2">
                  <Label>الحد الأقصى للخصم ({currency.symbol})</Label>
                  <Input type="number" value={form.max_discount || ""} onChange={(e) => setForm({ ...form, max_discount: Number(e.target.value) || null })} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ الانتهاء</Label>
                <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>حد الاستخدام</Label>
                <Input type="number" value={form.usage_limit || ""} onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف مختصر" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>نشط</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editingId ? "تحديث" : "إنشاء"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف الكوبون</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">هل أنت متأكد من حذف هذا الكوبون؟</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoupons;
