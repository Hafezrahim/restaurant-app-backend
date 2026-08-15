import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClientAuth } from '@/context/ClientAuthContext';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { useBrandLogo } from '@/hooks/useBrandLogo';

const ClientLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useClientAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!form.email || !form.password) {
          toast.error('يرجى ملء جميع الحقول');
          return;
        }
        const result = await login(form.email.trim(), form.password);
        if (result.success) {
          toast.success('تم تسجيل الدخول بنجاح');
          navigate('/client/dashboard');
        } else {
          toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      } else {
        if (!form.name || !form.email || !form.phone || !form.password) {
          toast.error('يرجى ملء جميع الحقول');
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.trim())) {
          toast.error('يرجى إدخال بريد إلكتروني صحيح');
          return;
        }
        if (form.name.trim().length < 3) {
          toast.error('الاسم يجب أن يكون 3 أحرف على الأقل');
          return;
        }
        if (form.phone.trim().length < 9) {
          toast.error('رقم الهاتف غير صحيح');
          return;
        }
        if (form.password.length < 6) {
          toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          return;
        }
        const result = await register({ ...form, email: form.email.trim() });
        if (result.success) {
          toast.success('تم إنشاء الحساب بنجاح! تحقق من بريدك لتأكيد الحساب');
          navigate('/client/dashboard');
        } else {
          if (result.error?.includes('already registered')) {
            toast.error('البريد الإلكتروني مسجل مسبقاً');
          } else {
            toast.error(result.error || 'حدث خطأ أثناء إنشاء الحساب');
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'} - مطعم مزاج</title>
      </Helmet>
      <AppLayout title={mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'} showSearch={false}>
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logoUrl} alt={brandName} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-elevated" />
            <h1 className="text-2xl font-bold text-foreground">
              {mode === 'login' ? 'مرحباً بعودتك' : 'أهلاً بك في مزاج'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'login' ? 'سجّل دخولك للوصول لحسابك' : 'أنشئ حساباً جديداً'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="الاسم الكامل"
                    className="rounded-xl pr-10"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                    type="tel"
                    dir="ltr"
                    className="rounded-xl pr-10 text-right"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="البريد الإلكتروني"
                type="email"
                dir="ltr"
                className="rounded-xl pr-10 text-right"
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                className="rounded-xl pr-10 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>

            <Button type="submit" className="w-full btn-primary rounded-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  جاري التحميل...
                </div>
              ) : (
                <>
                  {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
                  <ArrowRight className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-sm text-primary hover:underline"
              >
                {mode === 'login' ? 'ليس لديك حساب؟ أنشئ واحداً' : 'لديك حساب بالفعل؟ سجّل دخولك'}
              </button>
            </div>
          </form>
        </div>
      </AppLayout>
    </>
  );
};

export default ClientLogin;
