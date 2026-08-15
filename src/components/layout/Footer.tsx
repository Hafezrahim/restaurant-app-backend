import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { useRestaurantSettings } from '@/hooks/useSettingsData';
import { useAppInfo } from '@/context/AppInfoContext';

const dayLabels: Record<string, string> = {
  saturday: 'السبت',
  sunday: 'الأحد',
  monday: 'الإثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
};

export const Footer: React.FC = () => {
  const { data: settings } = useRestaurantSettings();
  const { appName, appLogo } = useAppInfo();
  const general = (settings?.general as any) || {};
  const workingHours = (settings?.working_hours as any) || {};

  const name = general.name || appName;
  const description =
    general.description ||
    `مطعم ${name} يقدم أشهى المأكولات العربية والشرقية والآسيوية. نحرص على تقديم أجود المكونات مع خدمة مميزة لضمان تجربة طعام لا تُنسى.`;
  const phone = general.phone || '+966 12 345 6789';
  const email = general.email || 'info@mazaj.sa';
  const address = general.address || 'الرياض، المملكة العربية السعودية';

  const hourEntries = Object.entries(workingHours) as Array<[string, any]>;

  return (
    <footer className="hidden md:block bg-charcoal text-cream py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={appLogo} alt={name} className="w-14 h-14 rounded-full object-cover" />
              <h3 className="text-xl font-bold text-gold">{name}</h3>
            </div>
            <p className="text-cream/80 text-sm leading-relaxed mb-4">{description}</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-cream/80 hover:text-gold transition-colors text-sm">الرئيسية</Link></li>
              <li><Link to="/menu" className="text-cream/80 hover:text-gold transition-colors text-sm">القائمة</Link></li>
              <li><Link to="/cart" className="text-cream/80 hover:text-gold transition-colors text-sm">السلة</Link></li>
              <li><Link to="/favorites" className="text-cream/80 hover:text-gold transition-colors text-sm">المفضلة</Link></li>
              <li><Link to="/more" className="text-cream/80 hover:text-gold transition-colors text-sm">المزيد</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-cream/80 text-sm">
                <Phone className="w-4 h-4 text-gold" />
                <span dir="ltr">{phone}</span>
              </li>
              <li className="flex items-center gap-3 text-cream/80 text-sm">
                <Mail className="w-4 h-4 text-gold" />
                <span>{email}</span>
              </li>
              <li className="flex items-center gap-3 text-cream/80 text-sm">
                <MapPin className="w-4 h-4 text-gold" />
                <span>{address}</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-4">ساعات العمل</h3>
            {(() => {
              const openHours = hourEntries
                .filter(([, h]) => h && !h.closed && h.open && h.close)
                .map(([, h]) => ({ open: h.open as string, close: h.close as string }));

              if (openHours.length === 0) {
                return (
                  <div className="flex items-center gap-3 text-cream/80 text-sm">
                    <Clock className="w-4 h-4 text-gold" />
                    <span className="text-cream/60">لم يتم تحديد ساعات العمل</span>
                  </div>
                );
              }

              const earliestOpen = openHours.reduce((a, b) => (a.open < b.open ? a : b)).open;
              const latestClose = openHours.reduce((a, b) => (a.close > b.close ? a : b)).close;

              return (
                <div className="flex items-center gap-3 text-cream/80 text-sm">
                  <Clock className="w-4 h-4 text-gold" />
                  <div>
                    <p>يومياً</p>
                    <p className="text-cream/60" dir="ltr">{earliestOpen} - {latestClose}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="border-t border-cream/10 mt-8 pt-8 text-center">
          <p className="text-cream/60 text-sm">
            © {new Date().getFullYear()} {name}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};
