import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Bike, 
  Home, 
  Phone, 
  MessageCircle,
  MapPin,
  Navigation
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

// Lazy load map component
const DeliveryMap = React.lazy(() => 
  import('@/components/map/DeliveryMap').then(module => ({ default: module.DeliveryMap }))
);

interface TrackingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  time?: string;
}

const trackingSteps: TrackingStep[] = [
  { id: 1, title: 'تم استلام الطلب', description: 'تم تأكيد طلبك بنجاح', icon: CheckCircle },
  { id: 2, title: 'جاري التحضير', description: 'يقوم الطاهي بتجهيز طلبك', icon: ChefHat },
  { id: 3, title: 'في الطريق', description: 'السائق في طريقه إليك', icon: Bike },
  { id: 4, title: 'تم التوصيل', description: 'استمتع بوجبتك!', icon: Home },
];

const OrderTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const trackingNumber = searchParams.get('order') || 'MZJ-XXXXX';
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState(35);

  // Simulate order progress
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 4) return prev + 1;
        clearInterval(interval);
        return prev;
      });
      setEstimatedTime((prev) => Math.max(0, prev - 10));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const driverInfo = {
    name: 'محمد أحمد',
    phone: '+966 50 123 4567',
    vehicle: 'هوندا PCX - أبيض',
    plate: 'ABC 1234',
  };

  return (
    <>
      <Helmet>
        <title>تتبع الطلب - مطعم مزاج</title>
      </Helmet>
      <AppLayout title="تتبع الطلب" showSearch={false}>
        <div className="max-w-md mx-auto space-y-6">
          {/* Order Number */}
          <div className="bg-card rounded-2xl p-4 shadow-card text-center">
            <p className="text-sm text-muted-foreground mb-1">رقم الطلب</p>
            <p className="font-mono font-bold text-lg text-primary">{trackingNumber}</p>
          </div>

          {/* Live Map */}
          <div className="relative bg-card rounded-2xl overflow-hidden shadow-card aspect-video md:aspect-[16/9]">
            <Suspense
              fallback={
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3 animate-pulse">
                      <Navigation className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-foreground font-medium">جاري تحميل الخريطة...</p>
                  </div>
                </div>
              }
            >
              <DeliveryMap currentStep={currentStep} />
            </Suspense>
          </div>

          {/* Estimated Time */}
          {currentStep < 4 && (
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-center text-primary-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm opacity-90">الوقت المتوقع للوصول</p>
              <p className="text-3xl font-bold">{estimatedTime} دقيقة</p>
            </div>
          )}

          {/* Tracking Steps */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <h2 className="font-bold text-lg text-foreground mb-4">حالة الطلب</h2>
            <div className="space-y-1">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isPending = currentStep < step.id;

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Icon & Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted
                            ? 'bg-accent text-accent-foreground'
                            : isCurrent
                            ? 'bg-primary text-primary-foreground animate-pulse'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-12 transition-all duration-500 ${
                            isCompleted ? 'bg-accent' : 'bg-border'
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <h3
                        className={`font-semibold transition-colors ${
                          isPending ? 'text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {isCurrent && (
                        <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          الحالة الحالية
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver Info - Show when in transit */}
          {currentStep >= 3 && currentStep < 4 && (
            <div className="bg-card rounded-2xl p-5 shadow-card animate-fade-in">
              <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Bike className="w-5 h-5 text-primary" />
                معلومات السائق
              </h2>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xl font-bold">
                  م
                </div>
                <div>
                  <p className="font-semibold text-foreground">{driverInfo.name}</p>
                  <p className="text-sm text-muted-foreground">{driverInfo.vehicle}</p>
                  <p className="text-xs text-muted-foreground">{driverInfo.plate}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full" size="sm">
                  <Phone className="w-4 h-4 ml-2" />
                  اتصال
                </Button>
                <Button variant="outline" className="flex-1 rounded-full" size="sm">
                  <MessageCircle className="w-4 h-4 ml-2" />
                  رسالة
                </Button>
              </div>
            </div>
          )}

          {/* Delivered - Show rating prompt */}
          {currentStep === 4 && (
            <div className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-6 text-center text-accent-foreground animate-scale-in">
              <CheckCircle className="w-12 h-12 mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-2">تم التوصيل بنجاح!</h2>
              <p className="text-sm opacity-90 mb-4">نتمنى لك وجبة شهية</p>
              <Button 
                onClick={() => navigate(`/rate-order?order=${trackingNumber}`)}
                className="bg-white text-accent hover:bg-white/90 rounded-full"
              >
                قيّم تجربتك
              </Button>
            </div>
          )}

          {/* Back to Menu */}
          <Button
            onClick={() => navigate('/menu')}
            variant="outline"
            className="w-full rounded-full"
          >
            تصفح القائمة
          </Button>
        </div>
      </AppLayout>
    </>
  );
};

export default OrderTracking;
