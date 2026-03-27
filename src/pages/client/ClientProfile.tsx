import React, { useState } from 'react';
import { UserCircle, Save, Mail, Phone, MapPin, User } from 'lucide-react';
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

  return (
    <ClientLayout title="الملف الشخصي">
      <div className="space-y-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-3 ring-4 ring-background shadow-lg">
            <UserCircle className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-bold text-lg text-foreground">{user?.name}</h2>
          <p className="text-xs text-muted-foreground">
            عضو منذ {new Date(user?.createdAt || '').toLocaleDateString('ar-SA')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div className="bg-card rounded-2xl border border-border/30 divide-y divide-border/30 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="الاسم"
                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                type="email"
                dir="ltr"
                placeholder="البريد الإلكتروني"
                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm text-right"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                type="tel"
                dir="ltr"
                placeholder="رقم الهاتف"
                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm text-right"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="العنوان"
                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
              />
            </div>
          </div>

          <Button type="submit" className="w-full btn-primary rounded-xl h-12 text-sm font-bold" disabled={saving}>
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </form>

        {/* Logout - Mobile only */}
        <button
          onClick={() => { logout(); toast.success('تم تسجيل الخروج'); }}
          className="w-full md:hidden text-center text-sm text-destructive font-medium py-3"
        >
          تسجيل الخروج
        </button>
      </div>
    </ClientLayout>
  );
};

export default ClientProfile;
