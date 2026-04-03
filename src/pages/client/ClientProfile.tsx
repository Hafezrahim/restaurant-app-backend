import React, { useState } from 'react';
import { UserCircle, Save, Mail, Phone, MapPin, User, Camera, Shield } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClientAuth } from '@/context/ClientAuthContext';
import { toast } from 'sonner';

const ClientProfile: React.FC = () => {
  const { user, updateProfile, logout } = useClientAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    toast.success('تم تحديث الملف الشخصي');
  };

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })
    : '';

  return (
    <ClientLayout title="الملف الشخصي">
      <div className="space-y-5">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-6 relative">
          <div className="relative mb-3">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center ring-4 ring-background shadow-lg">
              <UserCircle className="w-14 h-14 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-background">
              <Camera className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </div>
          <h2 className="font-bold text-xl text-foreground">{user?.name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          {memberSince && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              عضو منذ {memberSince}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-card rounded-2xl border border-border/30 divide-y divide-border/20 overflow-hidden shadow-sm">
            {[
              { icon: User, value: form.name, key: 'name', placeholder: 'الاسم الكامل', type: 'text', dir: 'rtl' },
              { icon: Mail, value: form.email, key: 'email', placeholder: 'البريد الإلكتروني', type: 'email', dir: 'ltr' },
              { icon: Phone, value: form.phone, key: 'phone', placeholder: 'رقم الهاتف', type: 'tel', dir: 'ltr' },
              { icon: MapPin, value: form.address, key: 'address', placeholder: 'العنوان', type: 'text', dir: 'rtl' },
            ].map(field => (
              <div key={field.key} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <field.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{field.placeholder}</label>
                  <Input
                    value={field.value}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    type={field.type}
                    dir={field.dir}
                    placeholder={field.placeholder}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm font-medium mt-0.5"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full rounded-xl h-12 text-sm font-bold" disabled={saving}>
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </form>

        {/* Logout - Mobile only */}
        <button
          onClick={() => { logout(); toast.success('تم تسجيل الخروج'); }}
          className="w-full md:hidden text-center text-sm text-destructive font-medium py-3 hover:bg-destructive/5 rounded-xl transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>
    </ClientLayout>
  );
};

export default ClientProfile;
