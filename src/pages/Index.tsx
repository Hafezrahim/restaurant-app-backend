import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryList } from '@/components/home/CategoryList';
import { PopularItems } from '@/components/home/PopularItems';
import { OffersSection } from '@/components/home/OffersSection';
import { GallerySlider } from '@/components/home/GallerySlider';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';

const Index: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>مزاج - مطعم عربي شرقي آسيوي</title>
        <meta
          name="description"
          content="استمتع بأشهى المأكولات العربية والشرقية والآسيوية في مطعم مزاج. اطلب الشاورما والسوشي والنودلز والمزيد."
        />
      </Helmet>
      <AppLayout>
        <HeroSlider />
        <CategoryList />
        <PopularItems />
        <OffersSection />
        <GallerySlider />
        <TestimonialsSection />
        <Footer />
      </AppLayout>
    </>
  );
};

export default Index;
