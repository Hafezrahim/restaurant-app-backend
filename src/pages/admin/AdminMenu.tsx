import { useState, useRef, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Plus, Edit, Trash2, ImagePlus, UtensilsCrossed, FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext";
import { 
  useAdminMenuItems, useAdminCategories, 
  useUpsertMenuItem, useDeleteMenuItem,
  useUpsertCategory, useDeleteCategory 
} from "@/hooks/useAdminData";

const emojiOptions = ["🍔", "🍕", "🍖", "🍣", "🍹", "🍰", "🥗", "🍗", "🥘", "🧁", "☕", "🥤", "🌮", "🍝", "🥙"];

const AdminMenu = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { formatPrice, currency } = useCurrency();
  
  const { data: items = [], isLoading: itemsLoading } = useAdminMenuItems();
  const { data: categories = [], isLoading: catsLoading } = useAdminCategories();
  const upsertItem = useUpsertMenuItem();
  const deleteItem = useDeleteMenuItem();
  const upsertCat = useUpsertCategory();
  const deleteCat = useDeleteCategory();
  
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Product dialog state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: "", name_ar: "", description: "", price: "", category_id: "", image: "", is_available: true, is_popular: false });

  // Category dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", name_ar: "", icon: "🍔", color: "primary", slug: "" });

  const allCategories = [{ id: "all", name_ar: "الكل" }, ...categories];

  const filteredItems = items.filter((item: any) => {
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
    const matchesSearch = item.name?.includes(searchQuery) || item.name_ar?.includes(searchQuery) || item.description?.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Product CRUD
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", name_ar: "", description: "", price: "", category_id: categories[0]?.id || "", image: "", is_available: true, is_popular: false });
    setIsProductDialogOpen(true);
  };

  const openEditProduct = (item: any) => {
    setEditingProduct(item);
    setProductForm({
      name: item.name, name_ar: item.name_ar || "", description: item.description,
      price: String(item.price), category_id: item.category_id || "",
      image: item.image || "", is_available: item.is_available, is_popular: item.is_popular,
    });
    setIsProductDialogOpen(true);
  };

  const saveProduct = () => {
    if (!productForm.name || !productForm.price) return toast.error("يرجى ملء الحقول المطلوبة");
    
    const payload: any = {
      name: productForm.name,
      name_ar: productForm.name_ar || null,
      description: productForm.description,
      price: Number(productForm.price),
      category_id: productForm.category_id || null,
      image: productForm.image || null,
      is_available: productForm.is_available,
      is_popular: productForm.is_popular,
    };
    if (editingProduct) payload.id = editingProduct.id;

    upsertItem.mutate(payload, {
      onSuccess: () => {
        toast.success(editingProduct ? "تم تحديث المنتج" : "تمت إضافة المنتج");
        setIsProductDialogOpen(false);
      },
      onError: () => toast.error("فشل حفظ المنتج"),
    });
  };

  const handleDeleteProduct = (id: string) => {
    deleteItem.mutate(id, {
      onSuccess: () => toast.success("تم حذف المنتج"),
      onError: () => toast.error("فشل حذف المنتج"),
    });
  };

  const toggleAvailability = (item: any) => {
    upsertItem.mutate({ id: item.id, is_available: !item.is_available });
  };

  // Category CRUD
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", name_ar: "", icon: "🍔", color: "primary", slug: "" });
    setIsCategoryDialogOpen(true);
  };

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, name_ar: cat.name_ar, icon: cat.icon, color: cat.color, slug: cat.slug });
    setIsCategoryDialogOpen(true);
  };

  const saveCategory = () => {
    if (!categoryForm.name_ar) return toast.error("يرجى إدخال اسم التصنيف");
    
    const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-') || categoryForm.name_ar;
    const payload: any = {
      name: categoryForm.name || categoryForm.name_ar,
      name_ar: categoryForm.name_ar,
      icon: categoryForm.icon,
      color: categoryForm.color,
      slug,
    };
    if (editingCategory) payload.id = editingCategory.id;

    upsertCat.mutate(payload, {
      onSuccess: () => {
        toast.success(editingCategory ? "تم تحديث التصنيف" : "تمت إضافة التصنيف");
        setIsCategoryDialogOpen(false);
      },
      onError: () => toast.error("فشل حفظ التصنيف"),
    });
  };

  const handleDeleteCategory = (id: string) => {
    const hasProducts = items.some((i: any) => i.category_id === id);
    if (hasProducts) return toast.error("لا يمكن حذف تصنيف يحتوي على منتجات");
    deleteCat.mutate(id, {
      onSuccess: () => toast.success("تم حذف التصنيف"),
      onError: () => toast.error("فشل حذف التصنيف"),
    });
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
    const reader = new FileReader();
    reader.onload = (event) => setProductForm(p => ({ ...p, image: event.target?.result as string }));
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة القائمة</h1>
          <p className="text-muted-foreground">إدارة المنتجات والتصنيفات</p>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="gap-2"><UtensilsCrossed className="w-4 h-4" />المنتجات</TabsTrigger>
          <TabsTrigger value="categories" className="gap-2"><FolderOpen className="w-4 h-4" />التصنيفات</TabsTrigger>
        </TabsList>

        {/* PRODUCTS TAB */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن منتج..." className="pr-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button size="sm" onClick={openAddProduct}><Plus className="w-4 h-4 ml-1" /> إضافة منتج</Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {allCategories.map((cat: any) => (
              <Button key={cat.id} variant={selectedCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat.id)} className="whitespace-nowrap">
                {cat.icon && cat.id !== "all" ? `${cat.icon} ` : ''}{cat.name_ar || cat.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-foreground mt-1">{items.length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">متاح</p>
              <p className="text-2xl font-bold text-accent mt-1">{items.filter((i: any) => i.is_available).length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">غير متاح</p>
              <p className="text-2xl font-bold text-destructive mt-1">{items.filter((i: any) => !i.is_available).length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">الأكثر طلباً</p>
              <p className="text-2xl font-bold text-secondary mt-1">{items.filter((i: any) => i.is_popular).length}</p>
            </div>
          </div>

          {itemsLoading ? (
            <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item: any) => {
                const cat = categories.find((c: any) => c.id === item.category_id);
                return (
                  <div key={item.id} className={`bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-elevated transition-all ${!item.is_available && 'opacity-60'}`}>
                    <div className="relative">
                      <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-40 object-cover" />
                      {item.is_popular && <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">الأكثر طلباً</Badge>}
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <Badge variant="destructive">غير متاح</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-foreground">{item.name_ar || item.name}</h3>
                        <span className="font-bold text-primary">{formatPrice(Number(item.price))}</span>
                      </div>
                      {cat && <p className="text-xs text-muted-foreground mb-1">{cat.icon} {cat.name_ar}</p>}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch checked={item.is_available} onCheckedChange={() => toggleAvailability(item)} />
                          <span className="text-sm text-muted-foreground">متاح</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditProduct(item)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProduct(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!itemsLoading && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد منتجات</p>
            </div>
          )}
        </TabsContent>

        {/* CATEGORIES TAB */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">إدارة تصنيفات المنتجات ({categories.length} تصنيف)</p>
            <Button size="sm" onClick={openAddCategory}><Plus className="w-4 h-4 ml-1" /> إضافة تصنيف</Button>
          </div>

          {catsLoading ? (
            <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat: any) => {
                const productCount = items.filter((i: any) => i.category_id === cat.id).length;
                return (
                  <div key={cat.id} className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-elevated transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-muted">{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{cat.name_ar}</h3>
                        <p className="text-sm text-muted-foreground">{productCount} منتج</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditCategory(cat)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCategory(cat.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم المنتج (عربي) *</Label>
                <Input placeholder="مثال: برجر كلاسيك" value={productForm.name_ar} onChange={(e) => setProductForm(p => ({ ...p, name_ar: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>اسم المنتج (إنجليزي)</Label>
                <Input placeholder="Classic Burger" value={productForm.name} onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea placeholder="وصف مختصر..." value={productForm.description} onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>السعر ({currency.symbol}) *</Label>
                <Input type="number" placeholder="0.00" value={productForm.price} onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select value={productForm.category_id} onValueChange={(v) => setProductForm(p => ({ ...p, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name_ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>صورة المنتج</Label>
              <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <div onClick={() => imageInputRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 min-h-[120px]">
                {productForm.image ? (
                  <img src={productForm.image} alt="معاينة" className="w-full h-28 object-cover rounded-lg" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">اضغط لرفع صورة (حتى 5MB)</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Switch checked={productForm.is_available} onCheckedChange={(v) => setProductForm(p => ({ ...p, is_available: v }))} />
                <Label>متاح للطلب</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={productForm.is_popular} onCheckedChange={(v) => setProductForm(p => ({ ...p, is_popular: v }))} />
                <Label>الأكثر طلباً</Label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={saveProduct} disabled={upsertItem.isPending}>
                {editingProduct ? "حفظ التغييرات" : "إضافة المنتج"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsProductDialogOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم التصنيف (عربي) *</Label>
                <Input placeholder="مثال: مقبلات" value={categoryForm.name_ar} onChange={(e) => setCategoryForm(p => ({ ...p, name_ar: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>اسم التصنيف (إنجليزي)</Label>
                <Input placeholder="Appetizers" value={categoryForm.name} onChange={(e) => setCategoryForm(p => ({ ...p, name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الأيقونة</Label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map(emoji => (
                  <button key={emoji} onClick={() => setCategoryForm(p => ({ ...p, icon: emoji }))} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all ${categoryForm.icon === emoji ? 'border-primary bg-primary/10 scale-110' : 'border-border hover:border-primary/50'}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={saveCategory} disabled={upsertCat.isPending}>{editingCategory ? "حفظ التغييرات" : "إضافة التصنيف"}</Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsCategoryDialogOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMenu;
