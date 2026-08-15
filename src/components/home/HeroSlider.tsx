import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    title: 'مشاوي عربية أصيلة',
    subtitle: 'استمتع بأفضل النكهات الشرقية',
    image: 'https://placehold.co/1200x800/8b2323/ffffff?text=Arabic+Grill',
  },
  {
    id: 2,
    title: 'أشهى المأكولات الآسيوية',
    subtitle: 'من طوكيو إلى بانكوك على طبقك',
    image: 'https://placehold.co/1200x800/2a2a2a/ffffff?text=Asian+Food',
  },
  {
    id: 3,
    title: 'عروض خاصة اليوم',
    subtitle: 'خصم حتى 30% على أطباق مختارة',
    image: 'https://placehold.co/1200x800/d4af37/ffffff?text=Special+Offers',
  },
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => setCurrent(index);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-elevated group">
      <div className="relative h-48 sm:h-64 md:h-80">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-all duration-1000 ease-out',
              index === current 
                ? 'opacity-100 scale-100 z-10' 
                : index === (current - 1 + slides.length) % slides.length
                  ? 'opacity-0 scale-110 -translate-x-full z-0'
                  : 'opacity-0 scale-95 translate-x-full z-0'
            )}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={cn(
                "w-full h-full object-cover transition-transform duration-[8000ms] ease-out",
                index === current && "scale-110"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h2 
                className={cn(
                  "text-2xl sm:text-3xl font-bold mb-1 transition-all duration-700",
                  index === current 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-8 opacity-0"
                )}
                style={{ transitionDelay: index === current ? '300ms' : '0ms' }}
              >
                {slide.title}
              </h2>
              <p 
                className={cn(
                  "text-sm sm:text-base transition-all duration-700",
                  index === current 
                    ? "translate-y-0 opacity-90" 
                    : "translate-y-8 opacity-0"
                )}
                style={{ transitionDelay: index === current ? '500ms' : '0ms' }}
              >
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - swapped for RTL */}
      <button
        onClick={next}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={prev}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className="relative w-2 h-2 rounded-full overflow-hidden bg-white/30 transition-all duration-300"
            style={{ width: index === current ? '24px' : '8px' }}
          >
            {index === current && (
              <span 
                className="absolute inset-0 bg-white rounded-full animate-[progress_5s_linear]"
                style={{ transformOrigin: 'left' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
