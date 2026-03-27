import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import logo from '@/assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="hidden md:block bg-charcoal text-cream py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="مزاج" className="w-14 h-14 rounded-full object-cover" />
              <h3 className="text-xl font-bold text-gold">MAZAG</h3>
            </div>
            <p className="text-cream/80 text-sm leading-relaxed mb-4">
              مطعم مزاج يقدم أشهى المأكولات العربية والشرقية والآسيوية. نحرص على تقديم
              أجود المكونات مع خدمة مميزة لضمان تجربة طعام لا تُنسى.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-cream/80 hover:text-gold transition-colors text-sm">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-cream/80 hover:text-gold transition-colors text-sm">
                  القائمة
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-cream/80 hover:text-gold transition-colors text-sm">
                  السلة
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-cream/80 hover:text-gold transition-colors text-sm">
                  المفضلة
                </Link>
              </li>
              <li>
                <Link to="/more" className="text-cream/80 hover:text-gold transition-colors text-sm">
                  المزيد
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-cream/80 text-sm">
                <Phone className="w-4 h-4 text-gold" />
                <span dir="ltr">+966 12 345 6789</span>
              </li>
              <li className="flex items-center gap-3 text-cream/80 text-sm">
                <Mail className="w-4 h-4 text-gold" />
                <span>info@mazaj.sa</span>
              </li>
              <li className="flex items-center gap-3 text-cream/80 text-sm">
                <MapPin className="w-4 h-4 text-gold" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-4">ساعات العمل</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-cream/80 text-sm">
                <Clock className="w-4 h-4 text-gold" />
                <div>
                  <p>السبت - الخميس</p>
                  <p className="text-cream/60">10:00 ص - 12:00 م</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-cream/80 text-sm">
                <Clock className="w-4 h-4 text-gold" />
                <div>
                  <p>الجمعة</p>
                  <p className="text-cream/60">2:00 م - 12:00 م</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-8 pt-8 text-center">
          <p className="text-cream/60 text-sm">
            © {new Date().getFullYear()} مطعم مزاج. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};
