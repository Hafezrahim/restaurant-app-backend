import React, { useRef, useState } from 'react';
import { Save, Mail, Phone, MapPin, User, Camera, Shield, Settings } from 'lucide-react';
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
        <div className="bg-white dark:bg-card rounded-2xl border border-border/15 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-bl from-primary via-primary to-primary/80 h-24 relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          </div>
          <div className="flex flex-col items-center -mt-12 pb-5 px-5 relative z-10">
            <div className="relative mb-3">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center ring-4 ring-white dark:ring-card shadow-xl text-3xl font-bold text-white">
                {user?.name?.charAt(0) || 'م'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-secondary rounded-xl flex items-center justify-center shadow-md border-2 border-white dark:border-card">
                <Camera className="w-3.5 h-3.5 text-secondary-foreground" />
              </button>
            </div>
            <h2 className="font-bold text-xl text-foreground">{user?.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            {memberSince && (
              <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" />
                عضو منذ {memberSince}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-border/15 divide-y divide-border/10 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-muted/20">
              <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" />
                المعلومات الشخصية
              </h3>
            </div>
            {[
              { icon: User, value: form.name, key: 'name', placeholder: 'الاسم الكامل', type: 'text', dir: 'rtl' },
              { icon: Mail, value: form.email, key: 'email', placeholder: 'البريد الإلكتروني', type: 'email', dir: 'ltr' },
              { icon: Phone, value: form.phone, key: 'phone', placeholder: 'رقم الهاتف', type: 'tel', dir: 'ltr' },
              { icon: MapPin, value: form.address, key: 'address', placeholder: 'العنوان', type: 'text', dir: 'rtl' },
            ].map(field => (
              <div key={field.key} className="flex items-center gap-3 px-4 py-4 hover:bg-muted/20 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <field.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{field.placeholder}</label>
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

          <Button type="submit" className="w-full rounded-xl h-12 text-sm font-bold shadow-lg shadow-primary/20" disabled={saving}>
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </form>

        {/* Logout */}
        <button
          onClick={() => { logout(); toast.success('تم تسجيل الخروج'); }}
          className="w-full md:hidden text-center text-sm text-destructive font-semibold py-3 hover:bg-destructive/5 rounded-xl transition-colors border border-destructive/15"
        >
          تسجيل الخروج
        </button>
      </div>
    </ClientLayout>
  );
};

export default ClientProfile;
