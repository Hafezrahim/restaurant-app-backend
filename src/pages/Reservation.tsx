import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle, MapPin, Phone, User, MessageSquare, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

const timeSlots = [
  { time: '12:00', period: 'غداء' },
  { time: '12:30', period: 'غداء' },
  { time: '13:00', period: 'غداء' },
  { time: '13:30', period: 'غداء' },
  { time: '14:00', period: 'غداء' },
  { time: '14:30', period: 'غداء' },
  { time: '18:00', period: 'عشاء' },
  { time: '18:30', period: 'عشاء' },
  { time: '19:00', period: 'عشاء' },
  { time: '19:30', period: 'عشاء' },
  { time: '20:00', period: 'عشاء' },
  { time: '20:30', period: 'عشاء' },
  { time: '21:00', period: 'عشاء' },
  { time: '21:30', period: 'عشاء' },
  { time: '22:00', period: 'عشاء' },
];

const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

const Reservation: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [guests, setGuests] = useState<number>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const lunchSlots = timeSlots.filter(s => s.period === 'غداء');
  const dinnerSlots = timeSlots.filter(s => s.period === 'عشاء');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !guests || !name || !phone) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    setIsSubmitted(true);
    toast({ title: 'تم الحجز بنجاح', description: 'سنتواصل معك قريباً لتأكيد الحجز' });
  };

  const canProceedStep1 = !!date && !!time && !!guests;
  const canSubmit = canProceedStep1 && !!name && !!phone;

  if (isSubmitted) {
    return (
      <>
        <Helmet><title>تم الحجز - مطعم مزاج</title></Helmet>
        <AppLayout title="حجز طاولة" showSearch={false}>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-accent/15 flex items-center justify-center mb-6 animate-scale-in">
              <CheckCircle className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">تم تأكيد حجزك!</h2>
            <p className="text-muted-foreground mb-8 max-w-md text-base leading-relaxed">
              شكراً لك {name}! تم استلام طلب حجزك ليوم {date && format(date, 'EEEE d MMMM', { locale: ar })} الساعة {time} لـ {guests} {guests === 1 ? 'شخص' : 'أشخاص'}.
            </p>
            {/* Summary Card */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card max-w-sm w-full mb-8 text-right animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">{date && format(date, 'EEEE d MMMM yyyy', { locale: ar })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">{time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">{guests} {guests === 1 ? 'شخص' : 'أشخاص'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium" dir="ltr">{phone}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">سنتصل بك على الرقم {phone} لتأكيد الحجز.</p>
            <Button onClick={() => navigate('/')} className="btn-primary rounded-full px-10 h-12">العودة للرئيسية</Button>
          </div>
          <Footer />
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>حجز طاولة - مطعم مزاج</title>
        <meta name="description" content="احجز طاولتك الآن في مطعم مزاج واستمتع بتجربة طعام مميزة." />
      </Helmet>
      <AppLayout title="حجز طاولة" showSearch={false}>
        {/* Mobile Layout */}
        <div className="md:hidden pb-8">
          <MobileReservationForm
            date={date} setDate={setDate}
            time={time} setTime={setTime}
            guests={guests} setGuests={setGuests}
            name={name} setName={setName}
            phone={phone} setPhone={setPhone}
            notes={notes} setNotes={setNotes}
            lunchSlots={lunchSlots} dinnerSlots={dinnerSlots}
            handleSubmit={handleSubmit} canSubmit={canSubmit}
          />
        </div>

        {/* Desktop / Web Layout */}
        <div className="hidden md:block pb-12">
          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden mb-10 h-64 bg-gradient-to-l from-primary/90 to-primary/70 animate-fade-in">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200')] bg-cover bg-center mix-blend-overlay opacity-40" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-secondary" />
                <span className="text-secondary font-semibold text-sm tracking-wide">تجربة طعام استثنائية</span>
              </div>
              <h1 className="text-4xl font-bold text-primary-foreground mb-3">احجز طاولتك الآن</h1>
              <p className="text-primary-foreground/80 max-w-lg text-base">استمتع بأجواء دافئة وأطباق شهية مع عائلتك وأحبائك</p>
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-4 mb-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => setStep(1)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300',
                step === 1 ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Calendar className="w-4 h-4" />
              <span>التاريخ والوقت</span>
            </button>
            <div className={cn('w-12 h-0.5 rounded-full transition-colors', canProceedStep1 ? 'bg-primary' : 'bg-border')} />
            <button
              onClick={() => canProceedStep1 && setStep(2)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300',
                step === 2 ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground hover:bg-muted/80',
                !canProceedStep1 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <User className="w-4 h-4" />
              <span>بيانات الحجز</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="grid grid-cols-3 gap-8 animate-fade-in" key="step1">
                {/* Date Picker - Left Column */}
                <div className="bg-card rounded-3xl border border-border shadow-card p-6 animate-scale-in">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">التاريخ</h3>
                      <p className="text-sm text-muted-foreground">اختر يوم الزيارة</p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < new Date()}
                      className="pointer-events-auto rounded-2xl"
                    />
                  </div>
                  {date && (
                    <div className="mt-4 text-center animate-fade-in">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                        <Calendar className="w-4 h-4" />
                        {format(date, 'EEEE d MMMM', { locale: ar })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Time Picker - Center Column */}
                <div className="bg-card rounded-3xl border border-border shadow-card p-6 animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-secondary/15 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">الوقت</h3>
                      <p className="text-sm text-muted-foreground">اختر الوقت المناسب</p>
                    </div>
                  </div>
                  {/* Lunch */}
                  <div className="mb-5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">☀️ فترة الغداء</span>
                    <div className="grid grid-cols-3 gap-2">
                      {lunchSlots.map(s => (
                        <button key={s.time} type="button" onClick={() => setTime(s.time)}
                          className={cn(
                            'py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                            time === s.time ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-muted text-foreground hover:bg-primary/10 hover:text-primary'
                          )}
                        >{s.time}</button>
                      ))}
                    </div>
                  </div>
                  {/* Dinner */}
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">🌙 فترة العشاء</span>
                    <div className="grid grid-cols-3 gap-2">
                      {dinnerSlots.map(s => (
                        <button key={s.time} type="button" onClick={() => setTime(s.time)}
                          className={cn(
                            'py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                            time === s.time ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-muted text-foreground hover:bg-primary/10 hover:text-primary'
                          )}
                        >{s.time}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Guests - Right Column */}
                <div className="space-y-6">
                  <div className="bg-card rounded-3xl border border-border shadow-card p-6 animate-scale-in" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">عدد الأشخاص</h3>
                        <p className="text-sm text-muted-foreground">كم ضيف سيحضر؟</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {guestOptions.map(num => (
                        <button key={num} type="button" onClick={() => setGuests(num)}
                          className={cn(
                            'py-3.5 rounded-xl text-base font-bold transition-all duration-200',
                            guests === num ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-muted text-foreground hover:bg-primary/10 hover:text-primary'
                          )}
                        >{num}</button>
                      ))}
                    </div>
                  </div>

                  {/* Selection Summary */}
                  <div className="bg-card rounded-3xl border border-border shadow-card p-6 animate-scale-in" style={{ animationDelay: '300ms' }}>
                    <h4 className="font-bold text-foreground mb-4">ملخص الاختيار</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">التاريخ</span>
                        <span className="text-foreground font-medium text-sm">{date ? format(date, 'd MMMM yyyy', { locale: ar }) : '—'}</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">الوقت</span>
                        <span className="text-foreground font-medium text-sm">{time || '—'}</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">الأشخاص</span>
                        <span className="text-foreground font-medium text-sm">{guests ? `${guests} ${guests === 1 ? 'شخص' : 'أشخاص'}` : '—'}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="w-full btn-primary rounded-full h-12 mt-6 text-base font-bold"
                      disabled={!canProceedStep1}
                      onClick={() => setStep(2)}
                    >
                      المتابعة
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto animate-fade-in" key="step2">
                <div className="bg-card rounded-3xl border border-border shadow-card p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-xl">بيانات الحجز</h3>
                      <p className="text-sm text-muted-foreground">أدخل بياناتك لإتمام الحجز</p>
                    </div>
                  </div>

                  {/* Summary Strip */}
                  <div className="flex items-center gap-6 bg-muted rounded-2xl p-4 mb-8">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{date && format(date, 'd MMMM', { locale: ar })}</span>
                    </div>
                    <div className="w-px h-5 bg-border" />
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{time}</span>
                    </div>
                    <div className="w-px h-5 bg-border" />
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{guests} {guests === 1 ? 'شخص' : 'أشخاص'}</span>
                    </div>
                    <button type="button" onClick={() => setStep(1)} className="mr-auto text-primary text-sm font-semibold hover:underline">تعديل</button>
                  </div>

                  <div className="space-y-5">
                    <div className="relative">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text" placeholder="الاسم الكامل *" value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full h-13 pr-12 pl-4 rounded-2xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel" placeholder="رقم الجوال *" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-13 pr-12 pl-4 rounded-2xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base"
                        dir="ltr" required
                      />
                    </div>
                    <div className="relative">
                      <MessageSquare className="absolute right-4 top-4 w-5 h-5 text-muted-foreground" />
                      <textarea
                        placeholder="ملاحظات إضافية (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full pr-12 pl-4 py-3 rounded-2xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all text-base"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button type="button" variant="outline" className="rounded-full h-12 px-8" onClick={() => setStep(1)}>
                      رجوع
                    </Button>
                    <Button type="submit" className="flex-1 btn-primary rounded-full h-12 text-base font-bold" disabled={!canSubmit}>
                      تأكيد الحجز
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <Footer />
      </AppLayout>
    </>
  );
};

/* ---- Mobile form (unchanged logic, same stacked layout) ---- */
interface MobileFormProps {
  date?: Date; setDate: (d?: Date) => void;
  time?: string; setTime: (t: string) => void;
  guests?: number; setGuests: (g: number) => void;
  name: string; setName: (n: string) => void;
  phone: string; setPhone: (p: string) => void;
  notes: string; setNotes: (n: string) => void;
  lunchSlots: typeof timeSlots;
  dinnerSlots: typeof timeSlots;
  handleSubmit: (e: React.FormEvent) => void;
  canSubmit: boolean;
}

const MobileReservationForm: React.FC<MobileFormProps> = ({
  date, setDate, time, setTime, guests, setGuests,
  name, setName, phone, setPhone, notes, setNotes,
  lunchSlots, dinnerSlots, handleSubmit, canSubmit
}) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">التاريخ</h3>
          <p className="text-sm text-muted-foreground">اختر تاريخ الحجز</p>
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('w-full justify-start text-right font-normal h-12 rounded-xl', !date && 'text-muted-foreground')}>
            {date ? format(date, 'EEEE d MMMM yyyy', { locale: ar }) : 'اختر التاريخ'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus className="pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>

    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">الوقت</h3>
          <p className="text-sm text-muted-foreground">اختر وقت الحجز</p>
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {[...lunchSlots, ...dinnerSlots].map(s => (
          <button key={s.time} type="button" onClick={() => setTime(s.time)}
            className={cn('py-2 px-3 rounded-lg text-sm font-medium transition-all', time === s.time ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80')}
          >{s.time}</button>
        ))}
      </div>
    </div>

    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
          <Users className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">عدد الأشخاص</h3>
          <p className="text-sm text-muted-foreground">كم عدد الضيوف؟</p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {guestOptions.map(num => (
          <button key={num} type="button" onClick={() => setGuests(num)}
            className={cn('py-3 rounded-lg text-sm font-bold transition-all', guests === num ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80')}
          >{num}</button>
        ))}
      </div>
    </div>

    <div className="bg-card rounded-2xl p-4 shadow-card space-y-4">
      <h3 className="font-semibold text-foreground">معلومات التواصل</h3>
      <input type="text" placeholder="الاسم الكامل *" value={name} onChange={(e) => setName(e.target.value)}
        className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary" required />
      <input type="tel" placeholder="رقم الجوال *" value={phone} onChange={(e) => setPhone(e.target.value)}
        className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary" dir="ltr" required />
      <textarea placeholder="ملاحظات إضافية (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
        className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary resize-none" />
    </div>

    <Button type="submit" size="lg" className="w-full btn-primary rounded-full h-14 text-lg font-bold" disabled={!canSubmit}>
      تأكيد الحجز
    </Button>
  </form>
);

export default Reservation;
