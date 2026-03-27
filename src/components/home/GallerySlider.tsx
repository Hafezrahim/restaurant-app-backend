import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const galleryImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
    title: 'أجواء المطعم',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    title: 'أطباقنا المميزة',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    title: 'تجربة طعام فريدة',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    title: 'ديكور عصري',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop',
    title: 'مطبخنا الاحترافي',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
    title: 'أطباق شهية',
  },
];

export const GallerySlider: React.FC = () => {
  return (
    <section className="hidden md:block py-12 px-6">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
          معرض الصور
        </h2>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {galleryImages.map((image) => (
              <CarouselItem key={image.id} className="pl-4 md:basis-1/3 lg:basis-1/4">
                <div className="relative group overflow-hidden rounded-2xl aspect-[3/2]">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="absolute bottom-4 right-4 text-primary-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.title}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex -left-4" />
          <CarouselNext className="hidden lg:flex -right-4" />
        </Carousel>
      </div>
    </section>
  );
};
