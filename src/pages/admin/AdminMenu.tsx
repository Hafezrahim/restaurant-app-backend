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
  Search, 
  Plus, 
  Edit,
  Trash2,
  ImagePlus,
  UtensilsCrossed,
  Download,
  Upload,
  FileSpreadsheet,
  FolderOpen,
  Palette
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  popular: boolean;
}

const defaultCategories: Category[] = [
  { id: "burgers", name: "برجر", icon: "🍔", color: "hsl(var(--crimson))" },
  { id: "pizza", name: "بيتزا", icon: "🍕", color: "hsl(var(--gold))" },
  { id: "arabic", name: "أطباق عربية", icon: "🍖", color: "hsl(var(--forest))" },
  { id: "sushi", name: "سوشي", icon: "🍣", color: "hsl(var(--accent))" },
  { id: "drinks", name: "مشروبات", icon: "🍹", color: "hsl(var(--secondary))" },
  { id: "desserts", name: "حلويات", icon: "🍰", color: "hsl(var(--crimson-light))" },
];

const defaultProducts: Product[] = [
  { id: 1, name: "برجر كلاسيك", description: "برجر لحم أنجوس مع جبنة شيدر وصوص خاص", price: 35, category: "burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop", available: true, popular: true },
  { id: 2, name: "بيتزا مارغريتا", description: "صوص طماطم، موزاريلا طازجة، ريحان", price: 45, category: "pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop", available: true, popular: true },
  { id: 3, name: "شاورما لحم", description: "لحم مشوي مع خضار وصوص طحينة", price: 25, category: "arabic", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=200&fit=crop", available: true, popular: false },
  { id: 4, name: "سوشي رولز مشكل", description: "تشكيلة من رولز السوشي الطازجة", price: 65, category: "sushi", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop", available: true, popular: true },
  { id: 5, name: "كباب مشوي", description: "كباب لحم مشوي على الفحم مع خبز عربي", price: 55, category: "arabic", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&h=200&fit=crop", available: false, popular: false },
  { id: 6, name: "موهيتو", description: "نعناع طازج مع ليمون وصودا", price: 18, category: "drinks", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200&h=200&fit=crop", available: true, popular: false },
];

const emojiOptions = ["🍔", "🍕", "🍖", "🍣", "🍹", "🍰", "🥗", "🍗", "🥘", "🧁", "☕", "🥤", "🌮", "🍝", "🥙"];

const AdminMenu = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { formatPrice, currency } = useCurrency();
  const [items, setItems] = useState<Product[]>(defaultProducts);
  const [catList, setCatList] = useState<Category[]>(defaultCategories);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Product dialog state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", category: "", image: "", available: true, popular: false });

  // Category dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "🍔", color: "hsl(var(--primary))" });

  const allCategories = [{ id: "all", name: "الكل" }, ...catList.map(c => ({ id: c.id, name: c.name }))];

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.includes(searchQuery) || item.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // ---- Product CRUD ----
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", description: "", price: "", category: catList[0]?.id || "", image: "", available: true, popular: false });
    setIsProductDialogOpen(true);
  };

  const openEditProduct = (item: Product) => {
    setEditingProduct(item);
    setProductForm({ name: item.name, description: item.description, price: String(item.price), category: item.category, image: item.image, available: item.available, popular: item.popular });
    setIsProductDialogOpen(true);
  };

  const saveProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (editingProduct) {
      setItems(prev => prev.map(i => i.id === editingProduct.id ? { ...i, name: productForm.name, description: productForm.description, price: Number(productForm.price), category: productForm.category, image: productForm.image || i.image, available: productForm.available, popular: productForm.popular } : i));
      toast.success("تم تحديث المنتج بنجاح");
    } else {
      const newId = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [...prev, { id: newId, name: productForm.name, description: productForm.description, price: Number(productForm.price), category: productForm.category, image: productForm.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop", available: productForm.available, popular: productForm.popular }]);
      toast.success("تمت إضافة المنتج بنجاح");
    }
    setIsProductDialogOpen(false);
  };

  const deleteProduct = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("تم حذف المنتج");
  };

  const toggleAvailability = (id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  };

  // ---- Category CRUD ----
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", icon: "🍔", color: "hsl(var(--primary))" });
    setIsCategoryDialogOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setIsCategoryDialogOpen(true);
  };

  const saveCategory = () => {
    if (!categoryForm.name) {
      toast.error("يرجى إدخال اسم التصنيف");
      return;
    }
    if (editingCategory) {
      setCatList(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: categoryForm.name, icon: categoryForm.icon, color: categoryForm.color } : c));
      toast.success("تم تحديث التصنيف بنجاح");
    } else {
      const newId = categoryForm.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      setCatList(prev => [...prev, { id: newId, name: categoryForm.name, icon: categoryForm.icon, color: categoryForm.color }]);
      toast.success("تمت إضافة التصنيف بنجاح");
    }
    setIsCategoryDialogOpen(false);
  };

  const deleteCategory = (id: string) => {
    const hasProducts = items.some(i => i.category === id);
    if (hasProducts) {
      toast.error("لا يمكن حذف تصنيف يحتوي على منتجات");
      return;
    }
    setCatList(prev => prev.filter(c => c.id !== id));
    toast.success("تم حذف التصنيف");
  };

  // ---- Import/Export ----
  const handleExport = () => {
    const exportData = items.map(item => ({
      "الرقم": item.id, "اسم الطبق": item.name, "الوصف": item.description, "السعر": item.price,
      "التصنيف": catList.find(c => c.id === item.category)?.name || item.category,
      "متاح": item.available ? "نعم" : "لا", "مميز": item.popular ? "نعم" : "لا", "رابط الصورة": item.image
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "القائمة");
    ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 40 }, { wch: 10 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 50 }];
    XLSX.writeFile(wb, "menu-items.xlsx");
    toast.success("تم تصدير القائمة بنجاح");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const importedItems = jsonData.map((row: any, index: number) => ({
          id: row["الرقم"] || items.length + index + 1, name: row["اسم الطبق"] || "", description: row["الوصف"] || "",
          price: Number(row["السعر"]) || 0, category: catList.find(c => c.name === row["التصنيف"])?.id || catList[0]?.id || "other",
          available: row["متاح"] === "نعم", popular: row["مميز"] === "نعم",
          image: row["رابط الصورة"] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"
        }));
        setItems(importedItems);
        toast.success(`تم استيراد ${importedItems.length} صنف بنجاح`);
      } catch { toast.error("حدث خطأ أثناء استيراد الملف"); }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    const templateData = [{ "الرقم": 1, "اسم الطبق": "مثال: برجر", "الوصف": "وصف الطبق هنا", "السعر": 35, "التصنيف": "برجر", "متاح": "نعم", "مميز": "لا", "رابط الصورة": "https://example.com/image.jpg" }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "القائمة");
    XLSX.writeFile(wb, "menu-template.xlsx");
    toast.success("تم تحميل القالب");
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setProductForm(p => ({ ...p, image: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, []);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة القائمة</h1>
          <p className="text-muted-foreground">إدارة المنتجات والتصنيفات</p>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            المنتجات
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            التصنيفات
          </TabsTrigger>
        </TabsList>

        {/* ==================== PRODUCTS TAB ==================== */}
        <TabsContent value="products" className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن منتج..." className="pr-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx,.xls" className="hidden" />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 ml-1" /> استيراد
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 ml-1" /> تصدير
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <FileSpreadsheet className="w-4 h-4 ml-1" /> قالب
              </Button>
              <Button size="sm" onClick={openAddProduct}>
                <Plus className="w-4 h-4 ml-1" /> إضافة منتج
              </Button>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {allCategories.map((cat) => (
              <Button key={cat.id} variant={selectedCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat.id)} className="whitespace-nowrap">
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-foreground mt-1">{items.length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">متاح</p>
              <p className="text-2xl font-bold text-accent mt-1">{items.filter(i => i.available).length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">غير متاح</p>
              <p className="text-2xl font-bold text-destructive mt-1">{items.filter(i => !i.available).length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">الأكثر طلباً</p>
              <p className="text-2xl font-bold text-secondary mt-1">{items.filter(i => i.popular).length}</p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className={`bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-elevated transition-all ${!item.available && 'opacity-60'}`}>
                <div className="relative">
                  <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                  {item.popular && (
                    <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">الأكثر طلباً</Badge>
                  )}
                  {!item.available && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Badge variant="destructive">غير متاح</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-foreground">{item.name}</h3>
                    <span className="font-bold text-primary">{formatPrice(item.price)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {catList.find(c => c.id === item.category)?.icon} {catList.find(c => c.id === item.category)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch checked={item.available} onCheckedChange={() => toggleAvailability(item.id)} />
                      <span className="text-sm text-muted-foreground">متاح</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditProduct(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteProduct(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد منتجات</p>
            </div>
          )}
        </TabsContent>

        {/* ==================== CATEGORIES TAB ==================== */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">إدارة تصنيفات المنتجات ({catList.length} تصنيف)</p>
            <Button size="sm" onClick={openAddCategory}>
              <Plus className="w-4 h-4 ml-1" /> إضافة تصنيف
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catList.map((cat) => {
              const productCount = items.filter(i => i.category === cat.id).length;
              return (
                <div key={cat.id} className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-elevated transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: cat.color + '20' }}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{productCount} منتج</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditCategory(cat)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteCategory(cat.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {catList.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد تصنيفات</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ==================== Product Dialog ==================== */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>اسم المنتج *</Label>
              <Input placeholder="مثال: برجر كلاسيك" value={productForm.name} onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea placeholder="وصف مختصر للمنتج..." value={productForm.description} onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>السعر ({currency.symbol}) *</Label>
                <Input type="number" placeholder="0.00" value={productForm.price} onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>التصنيف *</Label>
                <Select value={productForm.category} onValueChange={(v) => setProductForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                  <SelectContent>
                    {catList.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>صورة المنتج</Label>
              <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <div 
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 min-h-[120px] relative overflow-hidden"
              >
                {productForm.image ? (
                  <img src={productForm.image} alt="معاينة" className="w-full h-28 object-cover rounded-lg" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">اضغط لرفع صورة</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG حتى 5MB</span>
                  </>
                )}
              </div>
              {productForm.image && (
                <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => setProductForm(p => ({ ...p, image: "" }))}>
                  إزالة الصورة
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Switch checked={productForm.available} onCheckedChange={(v) => setProductForm(p => ({ ...p, available: v }))} />
                <Label>متاح للطلب</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={productForm.popular} onCheckedChange={(v) => setProductForm(p => ({ ...p, popular: v }))} />
                <Label>الأكثر طلباً</Label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={saveProduct}>{editingProduct ? "حفظ التغييرات" : "إضافة المنتج"}</Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsProductDialogOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== Category Dialog ==================== */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اسم التصنيف *</Label>
              <Input placeholder="مثال: مقبلات" value={categoryForm.name} onChange={(e) => setCategoryForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>الأيقونة</Label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setCategoryForm(p => ({ ...p, icon: emoji }))}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all ${categoryForm.icon === emoji ? 'border-primary bg-primary/10 scale-110' : 'border-border hover:border-primary/50'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={saveCategory}>{editingCategory ? "حفظ التغييرات" : "إضافة التصنيف"}</Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsCategoryDialogOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMenu;
