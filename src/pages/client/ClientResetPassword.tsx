import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useBrandLogo } from '@/hooks/useBrandLogo';

const ClientResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { logoUrl, name: brandName } = useBrandLogo();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Supabase puts a recovery session in place when the emailed link is opened
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (password !== confirm) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || 'تعذّر تحديث كلمة المرور');
      return;
    }
    toast.success('تم تحديث كلمة المرور بنجاح');
    navigate('/client/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>إعادة تعيين كلمة المرور - {brandName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AppLayout title="إعادة تعيين كلمة المرور" showSearch={false}>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <img src={logoUrl} alt={brandName} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-elevated" />
            <h1 className="text-2xl font-bold text-foreground">تعيين كلمة مرور جديدة</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {ready ? 'اختر كلمة مرور جديدة لحسابك' : 'افتح الرابط المرسل إلى بريدك الإلكتروني للمتابعة'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                type={show ? 'text' : 'password'}
                className="rounded-xl pr-10 pl-10"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2">
                {show ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="تأكيد كلمة المرور"
                type={show ? 'text' : 'password'}
                className="rounded-xl pr-10"
              />
            </div>

            <Button type="submit" className="w-full btn-primary rounded-full" size="lg" disabled={isSubmitting || !ready}>
              {isSubmitting ? 'جاري الحفظ...' : (
                <>
                  حفظ كلمة المرور
                  <ArrowRight className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <button type="button" onClick={() => navigate('/client/login')} className="text-sm text-primary hover:underline">
                العودة لتسجيل الدخول
              </button>
            </div>
          </form>
        </div>
      </AppLayout>
    </>
  );
};

export default ClientResetPassword;
