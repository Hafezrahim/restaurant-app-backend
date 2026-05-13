import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';
import { Award, Users, Clock, MapPin } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'الشيف أحمد الرشيدي',
    role: 'الشيف التنفيذي',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=300&h=300&fit=crop&crop=face',
    description: 'خبرة أكثر من 15 عاماً في المطابخ العالمية',
  },
  {
    id: 2,
    name: 'سارة المالكي',
    role: 'مديرة العمليات',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
    description: 'متخصصة في إدارة المطاعم الفاخرة',
  },
  {
    id: 3,
    name: 'الشيف يوسف تاكاهاشي',
    role: 'شيف السوشي',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    description: 'متدرب في أفضل مطاعم طوكيو',
  },
  {
    id: 4,
    name: 'محمد العتيبي',
    role: 'شيف المشويات',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    description: 'خبير في الأطباق العربية الأصيلة',
  },
];

const stats = [
  { icon: Award, value: '10+', label: 'سنوات من التميز' },
  { icon: Users, value: '50K+', label: 'عميل سعيد' },
  { icon: Clock, value: '24/7', label: 'خدمة التوصيل' },
  { icon: MapPin, value: '5', label: 'فروع' },
];

const About: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>من نحن - مطعم مزاج</title>
        <meta name="description" content="تعرف على قصة مطعم مزاج وفريقنا المميز الذي يحرص على تقديم أشهى المأكولات." />
        <link rel="canonical" href="/about" />
        <meta property="og:title" content="من نحن - مطعم مزاج" />
        <meta property="og:description" content="تعرف على قصة مطعم مزاج وفريقنا المميز الذي يحرص على تقديم أشهى المأكولات." />
        <meta property="og:url" content="/about" />
      </Helmet>
      <AppLayout title="من نحن" showSearch={false}>
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=500&fit=crop"
            alt="مطعم مزاج"
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
          <div className="absolute bottom-6 right-6 left-6 text-primary-foreground">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">مطعم مزاج</h1>
            <p className="text-lg opacity-90">حيث تلتقي النكهات من حول العالم</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-card rounded-2xl p-6 shadow-card mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">قصتنا</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              بدأت رحلة مطعم مزاج في عام 2014 من حلم بسيط: تقديم تجربة طعام استثنائية تجمع بين أصالة المطبخ العربي وإبداع المطبخ الآسيوي والشرقي.
            </p>
            <p>
              من مطعم صغير في قلب الرياض، نمونا لنصبح واحداً من أبرز المطاعم في المملكة، مع 5 فروع تخدم آلاف العملاء يومياً.
            </p>
            <p>
              نفخر بفريقنا المتميز من الطهاة الذين يحرصون على اختيار أجود المكونات الطازجة وتحضير كل طبق بعناية فائقة، لنقدم لكم تجربة طعام لا تُنسى.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-4 text-center shadow-card hover:shadow-elevated transition-shadow"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">فريقنا</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
                  <p className="text-primary text-xs font-medium mb-1">{member.role}</p>
                  <p className="text-muted-foreground text-xs line-clamp-2">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="bg-gradient-to-br from-primary to-crimson rounded-2xl p-6 text-primary-foreground mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">قيمنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <h3 className="font-bold text-lg mb-2">الجودة</h3>
              <p className="text-sm opacity-90">نختار أفضل المكونات ونحرص على أعلى معايير النظافة</p>
            </div>
            <div className="text-center p-4">
              <h3 className="font-bold text-lg mb-2">الابتكار</h3>
              <p className="text-sm opacity-90">نطور وصفاتنا باستمرار لنقدم لكم تجربة جديدة</p>
            </div>
            <div className="text-center p-4">
              <h3 className="font-bold text-lg mb-2">الضيافة</h3>
              <p className="text-sm opacity-90">نستقبل كل عميل كضيف عزيز في بيتنا</p>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <Footer />
        </div>
      </AppLayout>
    </>
  );
};

export default About;