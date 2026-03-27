import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'أحمد الشمري',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment: 'أفضل شاورما جربتها في حياتي! الطعم رائع والخدمة ممتازة. أنصح الجميع بتجربة المطعم.',
    date: 'قبل أسبوع',
  },
  {
    id: 2,
    name: 'سارة العتيبي',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment: 'السوشي طازج ولذيذ جداً. التوصيل سريع والطلب وصل ساخن. سأطلب مرة أخرى بالتأكيد!',
    date: 'قبل 3 أيام',
  },
  {
    id: 3,
    name: 'محمد القحطاني',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 4,
    comment: 'تجربة رائعة! الأجواء جميلة والطعام لذيذ. فقط أتمنى لو كانت الحصص أكبر قليلاً.',
    date: 'قبل أسبوعين',
  },
  {
    id: 4,
    name: 'نورة الدوسري',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment: 'النودلز الآسيوية لا تُقاوم! تنوع كبير في القائمة وأسعار معقولة. مطعم مميز فعلاً.',
    date: 'قبل 5 أيام',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="hidden md:block py-12 px-6 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
          ماذا يقول عملاؤنا
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-6 shadow-elegant hover:shadow-lg transition-shadow duration-300 relative"
            >
              <Quote className="absolute top-4 left-4 w-8 h-8 text-primary/20" />
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-xs text-muted-foreground">{testimonial.date}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'text-gold fill-gold'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {testimonial.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
