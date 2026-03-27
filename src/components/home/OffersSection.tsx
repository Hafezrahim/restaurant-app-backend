import React from 'react';

const offers = [
  {
    id: 1,
    title: 'خصم 20% على الشاورما',
    description: 'استمتع بألذ شاورما مع خصم حصري',
    code: 'SHAWARMA20',
    validUntil: '31 ديسمبر',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop',
  },
  {
    id: 2,
    title: 'وجبة عائلية مجانية',
    description: 'اطلب 3 وجبات واحصل على الرابعة مجاناً',
    code: 'FAMILY4',
    validUntil: '25 ديسمبر',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
  },
  {
    id: 3,
    title: 'توصيل مجاني',
    description: 'توصيل مجاني للطلبات فوق 100 ر.س',
    code: 'FREESHIP',
    validUntil: '1 يناير',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
  },
];

export const OffersSection: React.FC = () => {
  return (
    <section className="hidden md:block py-12 px-6 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
          العروض الحصرية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="relative overflow-hidden rounded-2xl group cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
              </div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-primary-foreground">
                <h3 className="text-xl lg:text-2xl font-bold mb-2">{offer.title}</h3>
                <p className="text-sm opacity-90 mb-4">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <span className="bg-primary px-4 py-2 rounded-full text-sm font-mono font-bold">
                    {offer.code}
                  </span>
                  <span className="text-sm opacity-75 bg-background/20 px-3 py-1 rounded-full">
                    حتى {offer.validUntil}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};