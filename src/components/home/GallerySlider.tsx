import React from 'react';
import { useMenuItems } from '@/backend/hooks/useMenuData';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export const GallerySlider: React.FC = () => {
  const { data: menuItems = [] } = useMenuItems();
  const galleryItems = menuItems.filter(item => item.image).slice(0, 8);

  if (galleryItems.length === 0) return null;

  return (
    <section className="mt-8">
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">📸 من أطباقنا</h3>
      <Carousel opts={{ align: 'start', loop: true }} className="w-full">
        <CarouselContent className="-ml-3">
          {galleryItems.map((item) => (
            <CarouselItem key={item.id} className="pl-3 basis-[45%] sm:basis-1/3 lg:basis-1/4">
              <div className="relative group overflow-hidden rounded-2xl aspect-square">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="absolute bottom-3 right-3 left-3 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                  {item.name}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden lg:flex -left-4" />
        <CarouselNext className="hidden lg:flex -right-4" />
      </Carousel>
    </section>
  );
};
