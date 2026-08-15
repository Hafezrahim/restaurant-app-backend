import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/backend/hooks/useMenuData';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AUTOPLAY_INTERVAL = 3000;

export const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const autoplayRef = useRef<ReturnType<typeof setInterval>>();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    direction: 'rtl', align: 'start', loop: true,
    slidesToScroll: 1, containScroll: 'trimSnaps',
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => { emblaApi?.scrollNext(); }, AUTOPLAY_INTERVAL);
  }, [emblaApi]);

  const stopAutoplay = () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('pointerDown', stopAutoplay);
    emblaApi.on('pointerUp', startAutoplay);
    startAutoplay();
    return () => {
      stopAutoplay();
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('pointerDown', stopAutoplay);
      emblaApi.off('pointerUp', startAutoplay);
    };
  }, [emblaApi, onSelect, startAutoplay]);

  if (categories.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-bold text-foreground">التصنيفات</h3>
        <div className="hidden md:flex items-center gap-1.5">
          <button onClick={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev}
            className="w-8 h-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors disabled:opacity-30">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={() => emblaApi?.scrollNext()} disabled={!canScrollNext}
            className="w-8 h-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors disabled:opacity-30">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="flex-[0_0_28%] min-w-0 md:flex-[0_0_16%] lg:flex-[0_0_12%] transition-all duration-500"
              style={{ 
                opacity: emblaApi ? 1 : 0,
                transform: emblaApi ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
                transitionDelay: `${idx * 60}ms`,
              }}>
              <button onClick={() => navigate(`/menu?category=${cat.id}`)} className="flex flex-col items-center gap-2 w-full group">
                <div className="w-[4.5rem] h-[4.5rem] md:w-20 md:h-20 rounded-full overflow-hidden shadow-card transition-all duration-300 group-hover:shadow-elevated group-hover:scale-110 ring-2 ring-primary/20 group-hover:ring-primary/40">
                  <img 
                    src={cat.image || 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=No+Image'} 
                    alt={cat.nameAr} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=No+Image';
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-full">{cat.nameAr}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      {categories.length > 3 && (
        <div className="flex items-center justify-center gap-1.5 mt-3 md:hidden">
          {Array.from({ length: Math.ceil(categories.length / 3) }).map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i * 3)}
              className={`h-1.5 rounded-full transition-all duration-300 ${Math.floor(selectedIndex / 3) === i ? 'w-5 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>
      )}
    </section>
  );
};
