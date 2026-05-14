import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { Search, Save, Globe, Share2, BarChart3, Code, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useSeoSettings,
  useSaveSeoSettings,
  SEO_DEFAULTS,
  type SeoSettings,
} from "@/hooks/useSeoSettings";

const AdminSEO = () => {
  const { seo, isLoading } = useSeoSettings();
  const save = useSaveSeoSettings();
  const [form, setForm] = useState<SeoSettings>(SEO_DEFAULTS);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) setForm(seo);
  }, [isLoading, seo]);

  const update = <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (form.organization_json?.trim()) {
      try {
        JSON.parse(form.organization_json);
        setJsonError(null);
      } catch (e: any) {
        setJsonError(e.message);
        toast.error("JSON-LD غير صالح");
        return;
      }
    }
    try {
      await save.mutateAsync(form);
      toast.success("تم حفظ إعدادات SEO");
    } catch (e: any) {
      toast.error("فشل الحفظ", { description: e.message });
    }
  };

  const titleLen = form.default_title.length;
  const descLen = form.default_description.length;

  return (
    <AdminLayout>
      <Helmet>
        <title>إعدادات SEO - لوحة الإدارة</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Search className="w-8 h-8 text-primary" />
              إعدادات تحسين محركات البحث (SEO)
            </h1>
            <p className="text-muted-foreground mt-1">
              تحكم في كيفية ظهور موقعك في Google ووسائل التواصل الاجتماعي
            </p>
          </div>
          <Button onClick={handleSave} disabled={save.isPending} className="btn-primary">
            {save.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ التغييرات
          </Button>
        </div>

        <Tabs defaultValue="general" dir="rtl">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="general"><Globe className="w-4 h-4 ml-2" />عام</TabsTrigger>
            <TabsTrigger value="social"><Share2 className="w-4 h-4 ml-2" />التواصل</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 ml-2" />التحليلات</TabsTrigger>
            <TabsTrigger value="advanced"><Code className="w-4 h-4 ml-2" />متقدم</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>رابط الموقع (Site URL)</Label>
                  <Input
                    value={form.site_url}
                    onChange={(e) => update("site_url", e.target.value)}
                    placeholder="https://example.com"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    يستخدم لتوليد روابط canonical و og:url المطلقة
                  </p>
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>عنوان الصفحة الافتراضي</Label>
                    <span className={`text-xs ${titleLen > 60 ? "text-destructive" : "text-muted-foreground"}`}>
                      {titleLen} / 60
                    </span>
                  </div>
                  <Input
                    value={form.default_title}
                    onChange={(e) => update("default_title", e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>الوصف الافتراضي (Meta Description)</Label>
                    <span className={`text-xs ${descLen > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                      {descLen} / 160
                    </span>
                  </div>
                  <Textarea
                    rows={3}
                    value={form.default_description}
                    onChange={(e) => update("default_description", e.target.value)}
                  />
                </div>

                <div>
                  <Label>الكلمات المفتاحية</Label>
                  <Input
                    value={form.default_keywords}
                    onChange={(e) => update("default_keywords", e.target.value)}
                    placeholder="كلمة1, كلمة2, كلمة3"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                  <div>
                    <Label className="text-base">السماح بفهرسة الموقع</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      عند الإيقاف يضاف noindex، nofollow وقد يختفي الموقع من Google
                    </p>
                  </div>
                  <Switch
                    checked={form.robots_index}
                    onCheckedChange={(v) => update("robots_index", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social */}
          <TabsContent value="social" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>صورة المشاركة الافتراضية (Open Graph)</Label>
                  <Input
                    value={form.og_image}
                    onChange={(e) => update("og_image", e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    يفضّل 1200×630 بكسل
                  </p>
                  {form.og_image && (
                    <img
                      src={form.og_image}
                      alt="OG preview"
                      className="mt-3 rounded-lg border border-border max-w-md"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>
                <div>
                  <Label>حساب تويتر (Twitter Handle)</Label>
                  <Input
                    value={form.twitter_handle}
                    onChange={(e) => update("twitter_handle", e.target.value)}
                    placeholder="@yourbrand"
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>التحليلات والتحقق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Google Analytics Measurement ID</Label>
                  <Input
                    value={form.ga_measurement_id}
                    onChange={(e) => update("ga_measurement_id", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label>كود التحقق Google Search Console</Label>
                  <Input
                    value={form.gsc_verification}
                    onChange={(e) => update("gsc_verification", e.target.value)}
                    placeholder="abc123..."
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>JSON-LD مخصّص (Organization)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  rows={10}
                  dir="ltr"
                  className="font-mono text-xs"
                  value={form.organization_json}
                  onChange={(e) => { update("organization_json", e.target.value); setJsonError(null); }}
                  placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "..."\n}`}
                />
                {jsonError ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {jsonError}
                  </p>
                ) : form.organization_json ? (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> سيتم التحقق عند الحفظ
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>روابط مفيدة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <a className="block text-primary hover:underline" href="/sitemap.xml" target="_blank" rel="noopener">
                  /sitemap.xml
                </a>
                <a className="block text-primary hover:underline" href="/robots.txt" target="_blank" rel="noopener">
                  /robots.txt
                </a>
                <a className="block text-primary hover:underline" href="https://search.google.com/test/rich-results" target="_blank" rel="noopener">
                  اختبار Schema.org على Google
                </a>
                <a className="block text-primary hover:underline" href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener">
                  Facebook Sharing Debugger
                </a>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>معاينة نتيجة Google</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg p-4 bg-background max-w-2xl">
              <div className="text-xs text-muted-foreground" dir="ltr">{form.site_url}</div>
              <div className="text-xl text-blue-700 dark:text-blue-400 font-medium mt-1 line-clamp-1">
                {form.default_title || "عنوان الصفحة"}
              </div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {form.default_description || "وصف الصفحة سيظهر هنا."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSEO;
