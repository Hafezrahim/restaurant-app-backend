import React, { useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryList } from '@/components/home/CategoryList';
import { PopularItems } from '@/components/home/PopularItems';
import { OffersSection } from '@/components/home/OffersSection';
import { GallerySlider } from '@/components/home/GallerySlider';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';
import { SeoLinks } from '@/components/seo/SeoLinks';

const RevealSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('revealed'), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref} className="section-reveal">{children}</div>;
};

const Index: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>مزاج - مطعم عربي شرقي آسيوي</title>
        <meta name="description" content="استمتع بأشهى المأكولات العربية والشرقية والآسيوية في مطعم مزاج. اطلب الشاورما والسوشي والنودلز والمزيد." />
        <meta property="og:title" content="مزاج - مطعم عربي شرقي آسيوي" />
        <meta property="og:description" content="استمتع بأشهى المأكولات العربية والشرقية والآسيوية في مطعم مزاج." />
      </Helmet>
      <SeoLinks path="/" />
      <AppLayout>
        <HeroSlider />
        <RevealSection delay={100}>
          <CategoryList />
        </RevealSection>
        <RevealSection delay={150}>
          <PopularItems />
        </RevealSection>
        <RevealSection delay={100}>
          <OffersSection />
        </RevealSection>
        <RevealSection delay={150}>
          <GallerySlider />
        </RevealSection>
        <RevealSection delay={100}>
          <TestimonialsSection />
        </RevealSection>
        <Footer />
      </AppLayout>
    </>
  );
};

export default Index;
