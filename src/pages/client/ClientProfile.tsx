import React, { useState } from 'react';
import { UserCircle, Save } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClientAuth } from '@/context/ClientAuthContext';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const ClientProfile: React.FC = () => {
  const { user, updateProfile } = useClientAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    toast.success('تم تحديث الملف الشخصي');
  };

  return (
    <>
      <Helmet><title>الملف الشخصي - مطعم مزاج</title></Helmet>
      <ClientLayout title="الملف الشخصي">
        <form onSubmit={handleSave} className="bg-card rounded-2xl p-6 shadow-card space-y-5">
          <div className="text-center pb-4 border-b border-border">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-bold text-lg text-foreground">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">عضو منذ {new Date(user?.createdAt || '').toLocaleDateString('ar-SA')}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">الاسم</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">البريد الإلكتروني</label>
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" dir="ltr" className="rounded-xl text-right" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">رقم الهاتف</label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} type="tel" dir="ltr" className="rounded-xl text-right" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">العنوان</label>
              <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="rounded-xl" />
            </div>
          </div>

          <Button type="submit" className="w-full btn-primary rounded-full" size="lg">
            <Save className="w-4 h-4 ml-2" />
            حفظ التغييرات
          </Button>
        </form>
      </ClientLayout>
    </>
  );
};

export default ClientProfile;
