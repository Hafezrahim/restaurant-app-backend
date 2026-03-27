import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  LogIn,
  Info,
  Phone,
  HelpCircle,
  Globe,
  ShoppingBag,
  ChevronLeft,
  ChevronDown,
  CalendarDays,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

const menuItems = [
  { icon: LogIn, label: 'تسجيل الدخول / إنشاء حساب', href: '#signin' },
  { icon: User, label: 'الملف الشخصي', href: '#profile' },
  { icon: ShoppingBag, label: 'سجل الطلبات', href: '#orders' },
  { icon: CalendarDays, label: 'حجز طاولة', to: '/reservation' },
  { icon: Info, label: 'من نحن', to: '/about' },
  { icon: Phone, label: 'اتصل بنا', href: '#contact' },
  { icon: Globe, label: 'اللغة', href: '#language', extra: 'العربية' },
];

const faqs = [
  {
    question: 'ما هي ساعات العمل؟',
    answer: 'نستقبلكم من السبت إلى الخميس من الساعة 10 صباحاً حتى 12 منتصف الليل، والجمعة من 2 ظهراً حتى 12 منتصف الليل.',
  },
  {
    question: 'هل يوجد توصيل مجاني؟',
    answer: 'نعم، نوفر توصيل مجاني للطلبات التي تزيد عن 100 ريال داخل نطاق 10 كم من أقرب فرع.',
  },
  {
    question: 'كم يستغرق وقت التوصيل؟',
    answer: 'عادةً يستغرق التوصيل من 30 إلى 45 دقيقة حسب موقعك وحالة الطلبات.',
  },
  {
    question: 'هل يمكن حجز طاولة مسبقاً؟',
    answer: 'بالتأكيد! يمكنك حجز طاولتك من خلال صفحة الحجز أو الاتصال على رقم المطعم. ننصح بالحجز المسبق خاصة في عطلات نهاية الأسبوع.',
  },
  {
    question: 'هل توجد خيارات للنباتيين؟',
    answer: 'نعم، لدينا قائمة متنوعة من الأطباق النباتية والصحية. يمكنك الاطلاع عليها في قسم "صحي" في القائمة.',
  },
  {
    question: 'ما هي طرق الدفع المتاحة؟',
    answer: 'نقبل الدفع النقدي، البطاقات الائتمانية (فيزا، ماستركارد)، مدى، Apple Pay، وSTCPay.',
  },
  {
    question: 'هل يمكن تعديل الطلب بعد إرساله؟',
    answer: 'يمكن تعديل الطلب خلال 5 دقائق من إرساله فقط. بعد ذلك يبدأ تحضير الطلب في المطبخ.',
  },
  {
    question: 'هل لديكم برنامج ولاء؟',
    answer: 'نعم! سجّل في تطبيقنا واحصل على نقاط مع كل طلب يمكنك استبدالها بخصومات ووجبات مجانية.',
  },
];

const More: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>المزيد - مطعم مزاج</title>
        <meta name="description" content="إعدادات الحساب والطلبات والمزيد في مطعم مزاج." />
      </Helmet>
      <AppLayout title="المزيد" showSearch={false}>
        <div className="space-y-2 mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const Component = item.to ? Link : 'a';
            const linkProps = item.to ? { to: item.to } : { href: item.href };

            return (
              <Component
                key={item.label}
                {...(linkProps as any)}
                className={cn(
                  'flex items-center gap-4 p-4 bg-card rounded-xl shadow-card transition-all duration-200 hover:shadow-elevated opacity-0 animate-slide-up',
                  `stagger-${Math.min(index + 1, 5)}`
                )}
                style={{ animationFillMode: 'forwards' }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="flex-1 font-medium text-foreground">{item.label}</span>
                {item.extra && (
                  <span className="text-sm text-muted-foreground">{item.extra}</span>
                )}
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Component>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">الأسئلة الشائعة</h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card rounded-xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-right"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-muted-foreground transition-transform duration-200',
                      openFaq === index && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-200',
                    openFaq === index ? 'max-h-40 pb-4' : 'max-h-0'
                  )}
                >
                  <p className="px-4 text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">مطعم مزاج © 2024</p>
          <p className="text-xs text-muted-foreground mt-1">الإصدار 1.0.0</p>
        </div>
      </AppLayout>
    </>
  );
};

export default More;