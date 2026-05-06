import { useState, useEffect } from "react";
import { useCurrency, CURRENCIES } from "@/context/CurrencyContext";
import { useRestaurantSettings, useSaveSettings, useDeliveryZones, useUpsertDeliveryZone, useDeleteDeliveryZone, useUsersWithRoles } from "@/hooks/useSettingsData";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Store, MapPin, Clock, CreditCard, Bell, Shield, Mail, Phone, Save,
  Upload, Truck, Users, Key, Plus, Trash2, Coins, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const defaultWorkingHours = {
  saturday: { open: "10:00", close: "23:00", closed: false },
  sunday: { open: "10:00", close: "23:00", closed: false },
  monday: { open: "10:00", close: "23:00", closed: false },
  tuesday: { open: "10:00", close: "23:00", closed: false },
  wednesday: { open: "10:00", close: "23:00", closed: false },
  thursday: { open: "10:00", close: "00:00", closed: false },
  friday: { open: "13:00", close: "00:00", closed: false },
};

const defaultNotifications = {
  orderNotifications: true,
  reviewNotifications: true,
  reservationNotifications: true,
  lowStockNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
};

const defaultPayments = {
  cashEnabled: true,
  cardEnabled: true,
  applePayEnabled: true,
  stcPayEnabled: true,
  customMethods: [] as { id: string; name: string; description: string; emoji: string; enabled: boolean }[],
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { currency, setCurrency } = useCurrency();

  // Supabase data
  const { data: settings, isLoading: settingsLoading } = useRestaurantSettings();
  const saveSettings = useSaveSettings();
  const { data: dbZones, isLoading: zonesLoading } = useDeliveryZones();
  const upsertZone = useUpsertDeliveryZone();
  const deleteZone = useDeleteDeliveryZone();
  const { data: usersWithRoles } = useUsersWithRoles();

  // Local form state
  const [restaurantName, setRestaurantName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [workingHours, setWorkingHours] = useState(defaultWorkingHours);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [minimumOrder, setMinimumOrder] = useState("50");
  const [estimatedTime, setEstimatedTime] = useState("30-45");
  const [payments, setPayments] = useState(defaultPayments);
  const [notifications, setNotifications] = useState(defaultNotifications);

  // Zone dialog
  const [newZoneName, setNewZoneName] = useState("");
  const [newZonePrice, setNewZonePrice] = useState("");
  const [newZoneTime, setNewZoneTime] = useState("");
  const [addZoneOpen, setAddZoneOpen] = useState(false);

  // Payment dialog
  const [newMethodName, setNewMethodName] = useState("");
  const [newMethodDesc, setNewMethodDesc] = useState("");
  const [newMethodEmoji, setNewMethodEmoji] = useState("💰");
  const [addMethodOpen, setAddMethodOpen] = useState(false);

  // Populate form from DB
  useEffect(() => {
    if (!settings) return;
    const g = settings.general as any;
    if (g) {
      setRestaurantName(g.name || "");
      setDescription(g.description || "");
      setEmail(g.email || "");
      setPhone(g.phone || "");
      setAddress(g.address || "");
    }
    if (settings.working_hours) setWorkingHours(settings.working_hours as any);
    const d = settings.delivery as any;
    if (d) {
      setDeliveryEnabled(d.enabled ?? true);
      setMinimumOrder(String(d.minimumOrder || "50"));
      setEstimatedTime(d.estimatedTime || "30-45");
    }
    if (settings.payments) setPayments({ ...defaultPayments, ...(settings.payments as any) });
    if (settings.notifications) setNotifications({ ...defaultNotifications, ...(settings.notifications as any) });
  }, [settings]);

  const handleSave = async () => {
    try {
      await saveSettings.mutateAsync({
        general: { name: restaurantName, description, email, phone, address },
        working_hours: workingHours,
        delivery: { enabled: deliveryEnabled, minimumOrder: Number(minimumOrder), estimatedTime },
        payments,
        notifications,
      });
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  const handleAddZone = async () => {
    if (!newZoneName.trim() || !newZonePrice.trim()) {
      toast.error("يرجى إدخال اسم المنطقة والسعر");
      return;
    }
    try {
      await upsertZone.mutateAsync({
        name: newZoneName.trim(),
        price: Number(newZonePrice),
        estimated_time: newZoneTime.trim() || "30-45",
        sort_order: (dbZones?.length || 0),
      });
      setNewZoneName("");
      setNewZonePrice("");
      setNewZoneTime("");
      setAddZoneOpen(false);
      toast.success("تم إضافة منطقة التوصيل بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء إضافة المنطقة");
    }
  };

  const handleDeleteZone = async (id: string) => {
    if ((dbZones?.length || 0) <= 1) {
      toast.error("يجب أن تبقى منطقة توصيل واحدة على الأقل");
      return;
    }
    try {
      await deleteZone.mutateAsync(id);
      toast.success("تم حذف منطقة التوصيل");
    } catch {
      toast.error("حدث خطأ أثناء حذف المنطقة");
    }
  };

  const handleAddPaymentMethod = () => {
    if (!newMethodName.trim()) {
      toast.error("يرجى إدخال اسم طريقة الدفع");
      return;
    }
    setPayments((prev) => ({
      ...prev,
      customMethods: [
        ...prev.customMethods,
        {
          id: Date.now().toString(),
          name: newMethodName.trim(),
          description: newMethodDesc.trim() || newMethodName.trim(),
          emoji: newMethodEmoji || "💰",
          enabled: true,
        },
      ],
    }));
    setNewMethodName("");
    setNewMethodDesc("");
    setNewMethodEmoji("💰");
    setAddMethodOpen(false);
    toast.success("تم إضافة طريقة الدفع - اضغط حفظ لتأكيد التغييرات");
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPayments((prev) => ({
      ...prev,
      customMethods: prev.customMethods.filter((m) => m.id !== id),
    }));
    toast.success("تم حذف طريقة الدفع - اضغط حفظ لتأكيد التغييرات");
  };

  const dayNames: Record<string, string> = {
    saturday: "السبت", sunday: "الأحد", monday: "الاثنين",
    tuesday: "الثلاثاء", wednesday: "الأربعاء",
    thursday: "الخميس", friday: "الجمعة",
  };

  if (settingsLoading || zonesLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة إعدادات المطعم والنظام</p>
        </div>
        <Button onClick={handleSave} disabled={saveSettings.isPending}>
          {saveSettings.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
          حفظ التغييرات
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border/50 p-1 rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="flex items-center gap-2"><Store className="w-4 h-4" />عام</TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2"><Clock className="w-4 h-4" />ساعات العمل</TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2"><Truck className="w-4 h-4" />التوصيل</TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2"><CreditCard className="w-4 h-4" />الدفع</TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2"><Bell className="w-4 h-4" />الإشعارات</TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2"><Coins className="w-4 h-4" />العملات</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2"><Shield className="w-4 h-4" />الأمان</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              معلومات المطعم
            </h2>

            <div className="flex items-center gap-6 pb-6 border-b border-border/50">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/src/assets/logo.png" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">أ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground mb-2">شعار المطعم</h3>
                <p className="text-sm text-muted-foreground mb-3">يُفضل صورة بحجم 200x200 بكسل</p>
                <Button variant="outline" size="sm"><Upload className="w-4 h-4 ml-2" />تغيير الشعار</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المطعم</Label>
                <Input id="name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="text-right" dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-10 text-right" dir="rtl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pr-10 text-right" dir="rtl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="pr-10 text-right" dir="rtl" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">وصف المطعم</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="text-right" dir="rtl" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Working Hours */}
        <TabsContent value="hours">
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              ساعات العمل
            </h2>
            <div className="space-y-4">
              {Object.entries(workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="w-24 font-medium text-foreground">{dayNames[day]}</div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) =>
                        setWorkingHours({ ...workingHours, [day]: { ...hours, closed: !checked } })
                      }
                    />
                    <span className="text-sm text-muted-foreground">{hours.closed ? "مغلق" : "مفتوح"}</span>
                  </div>
                  {!hours.closed && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">من</Label>
                        <Input type="time" value={hours.open} onChange={(e) => setWorkingHours({ ...workingHours, [day]: { ...hours, open: e.target.value } })} className="w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">إلى</Label>
                        <Input type="time" value={hours.close} onChange={(e) => setWorkingHours({ ...workingHours, [day]: { ...hours, close: e.target.value } })} className="w-32" />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              إعدادات التوصيل
            </h2>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <h3 className="font-medium text-foreground">تفعيل خدمة التوصيل</h3>
                <p className="text-sm text-muted-foreground">السماح للعملاء بطلب التوصيل للمنزل</p>
              </div>
              <Switch checked={deliveryEnabled} onCheckedChange={setDeliveryEnabled} />
            </div>

            {deliveryEnabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>الحد الأدنى للطلب ({currency.symbol})</Label>
                    <Input type="number" value={minimumOrder} onChange={(e) => setMinimumOrder(e.target.value)} className="text-right" dir="rtl" />
                  </div>
                  <div className="space-y-2">
                    <Label>الوقت الافتراضي للتوصيل (دقيقة)</Label>
                    <Input value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="مثال: 30-45" className="text-right" dir="rtl" />
                  </div>
                </div>

                {/* Delivery Zones from DB */}
                <div className="space-y-3 mt-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    مناطق التوصيل والأسعار
                  </h3>
                  {(dbZones || []).map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{zone.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {zone.price} {currency.symbol} • {zone.estimated_time} دقيقة
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteZone(zone.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Dialog open={addZoneOpen} onOpenChange={setAddZoneOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full rounded-xl border-dashed border-2 h-12 gap-2">
                        <Plus className="w-5 h-5" />
                        إضافة منطقة توصيل جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md" dir="rtl">
                      <DialogHeader><DialogTitle>إضافة منطقة توصيل</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                          <Label>اسم المنطقة *</Label>
                          <Input value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} placeholder="مثال: حي النخيل، شمال الرياض" className="text-right" dir="rtl" />
                        </div>
                        <div className="space-y-2">
                          <Label>رسوم التوصيل ({currency.symbol}) *</Label>
                          <Input type="number" value={newZonePrice} onChange={(e) => setNewZonePrice(e.target.value)} placeholder="مثال: 15" className="text-right" dir="rtl" />
                        </div>
                        <div className="space-y-2">
                          <Label>الوقت المتوقع (دقيقة)</Label>
                          <Input value={newZoneTime} onChange={(e) => setNewZoneTime(e.target.value)} placeholder="مثال: 20-30" className="text-right" dir="rtl" />
                        </div>
                        <Button onClick={handleAddZone} className="w-full" disabled={upsertZone.isPending}>
                          {upsertZone.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                          إضافة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              طرق الدفع
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">💵</div>
                  <div>
                    <h3 className="font-medium text-foreground">الدفع نقداً</h3>
                    <p className="text-sm text-muted-foreground">الدفع عند الاستلام</p>
                  </div>
                </div>
                <Switch checked={payments.cashEnabled} onCheckedChange={(v) => setPayments((p) => ({ ...p, cashEnabled: v }))} />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">💳</div>
                  <div>
                    <h3 className="font-medium text-foreground">البطاقة البنكية</h3>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, مدى</p>
                  </div>
                </div>
                <Switch checked={payments.cardEnabled} onCheckedChange={(v) => setPayments((p) => ({ ...p, cardEnabled: v }))} />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">🍎</div>
                  <div>
                    <h3 className="font-medium text-foreground">Apple Pay</h3>
                    <p className="text-sm text-muted-foreground">الدفع عبر Apple Pay</p>
                  </div>
                </div>
                <Switch checked={payments.applePayEnabled} onCheckedChange={(v) => setPayments((p) => ({ ...p, applePayEnabled: v }))} />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">📱</div>
                  <div>
                    <h3 className="font-medium text-foreground">STC Pay</h3>
                    <p className="text-sm text-muted-foreground">الدفع عبر تطبيق STC Pay</p>
                  </div>
                </div>
                <Switch checked={payments.stcPayEnabled} onCheckedChange={(v) => setPayments((p) => ({ ...p, stcPayEnabled: v }))} />
              </div>

              {/* Custom Payment Methods */}
              {payments.customMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-lg">{method.emoji}</div>
                    <div>
                      <h3 className="font-medium text-foreground">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={method.enabled}
                      onCheckedChange={(checked) =>
                        setPayments((prev) => ({
                          ...prev,
                          customMethods: prev.customMethods.map((m) => (m.id === method.id ? { ...m, enabled: checked } : m)),
                        }))
                      }
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePaymentMethod(method.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Dialog open={addMethodOpen} onOpenChange={setAddMethodOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full rounded-xl border-dashed border-2 h-14 gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة طريقة دفع جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md" dir="rtl">
                  <DialogHeader><DialogTitle>إضافة طريقة دفع جديدة</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <Label>الرمز التعبيري</Label>
                      <div className="flex gap-2 flex-wrap">
                        {["💰", "👛", "💸", "🏦", "📲", "💳", "🪙", "💵"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setNewMethodEmoji(emoji)}
                            className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center border-2 transition-all ${
                              newMethodEmoji === emoji ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>اسم طريقة الدفع *</Label>
                      <Input value={newMethodName} onChange={(e) => setNewMethodName(e.target.value)} placeholder="مثال: محفظة إلكترونية، InstaPay" />
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف</Label>
                      <Input value={newMethodDesc} onChange={(e) => setNewMethodDesc(e.target.value)} placeholder="مثال: الدفع عبر المحفظة الإلكترونية" />
                    </div>
                    <Button onClick={handleAddPaymentMethod} className="w-full">إضافة</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              إعدادات الإشعارات
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-4">إشعارات التطبيق</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div><h4 className="font-medium text-foreground">الطلبات الجديدة</h4><p className="text-sm text-muted-foreground">إشعار عند استلام طلب جديد</p></div>
                    <Switch checked={notifications.orderNotifications} onCheckedChange={(v) => setNotifications((n) => ({ ...n, orderNotifications: v }))} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div><h4 className="font-medium text-foreground">التقييمات الجديدة</h4><p className="text-sm text-muted-foreground">إشعار عند استلام تقييم جديد</p></div>
                    <Switch checked={notifications.reviewNotifications} onCheckedChange={(v) => setNotifications((n) => ({ ...n, reviewNotifications: v }))} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div><h4 className="font-medium text-foreground">الحجوزات الجديدة</h4><p className="text-sm text-muted-foreground">إشعار عند استلام حجز جديد</p></div>
                    <Switch checked={notifications.reservationNotifications} onCheckedChange={(v) => setNotifications((n) => ({ ...n, reservationNotifications: v }))} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div><h4 className="font-medium text-foreground">تنبيه انخفاض المخزون</h4><p className="text-sm text-muted-foreground">إشعار عند انخفاض مخزون أي صنف</p></div>
                    <Switch checked={notifications.lowStockNotifications} onCheckedChange={(v) => setNotifications((n) => ({ ...n, lowStockNotifications: v }))} />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-4">طريقة الإرسال</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div><h4 className="font-medium text-foreground">البريد الإلكتروني</h4><p className="text-sm text-muted-foreground">إرسال الإشعارات عبر البريد</p></div>
                    </div>
                    <Switch checked={notifications.emailNotifications} onCheckedChange={(v) => setNotifications((n) => ({ ...n, emailNotifications: v }))} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div><h4 className="font-medium text-foreground">رسائل SMS</h4><p className="text-sm text-muted-foreground">إرسال الإشعارات عبر الرسائل النصية</p></div>
                    </div>
                    <Switch checked={notifications.smsNotifications} onCheckedChange={(v) => setNotifications((n) => ({ ...n, smsNotifications: v }))} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              العملة الافتراضية
            </h2>
            <p className="text-sm text-muted-foreground">اختر العملة التي سيتم عرضها في جميع أنحاء التطبيق</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { setCurrency(c); toast.success(`تم تغيير العملة إلى ${c.nameAr}`); }}
                  className={`p-4 rounded-xl border-2 transition-all text-right ${
                    currency.code === c.code ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{c.symbol}</p>
                      <p className="text-sm text-foreground mt-1">{c.nameAr}</p>
                      <p className="text-xs text-muted-foreground">{c.nameEn} ({c.code})</p>
                    </div>
                    {currency.code === c.code && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 bg-muted/30 rounded-xl">
              <p className="text-sm text-muted-foreground">
                العملة الحالية: <span className="font-bold text-foreground">{currency.nameAr} ({currency.symbol})</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">سيتم تطبيق هذه العملة على جميع الأسعار والمبالغ في التطبيق</p>
            </div>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                تغيير كلمة المرور
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label>كلمة المرور الحالية</Label><Input type="password" placeholder="••••••••" className="text-right" dir="rtl" /></div>
                <div></div>
                <div className="space-y-2"><Label>كلمة المرور الجديدة</Label><Input type="password" placeholder="••••••••" className="text-right" dir="rtl" /></div>
                <div className="space-y-2"><Label>تأكيد كلمة المرور الجديدة</Label><Input type="password" placeholder="••••••••" className="text-right" dir="rtl" /></div>
              </div>
              <Button variant="outline">تحديث كلمة المرور</Button>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                إدارة المستخدمين
              </h2>
              <p className="text-muted-foreground">إدارة حسابات المستخدمين والصلاحيات للوصول إلى لوحة التحكم.</p>
              <div className="space-y-3">
                {(usersWithRoles || []).map((user) => {
                  const isAdmin = user.roles.includes('admin');
                  const isMod = user.roles.includes('moderator');
                  const initials = user.name ? user.name.charAt(0) : user.email?.charAt(0) || '?';
                  const roleLabel = isAdmin ? 'مدير' : isMod ? 'مشرف' : 'مستخدم';
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-foreground">{user.name || 'بدون اسم'}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={isAdmin ? 'default' : 'outline'}>{roleLabel}</Badge>
                    </div>
                  );
                })}
                {(!usersWithRoles || usersWithRoles.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا يوجد مستخدمين</p>
                )}
              </div>
              <Button variant="outline"><Users className="w-4 h-4 ml-2" />إضافة مستخدم</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
