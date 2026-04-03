import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Send, Bot, User, MessageCircle } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickReplies = ['أين طلبي؟', 'أريد إلغاء طلب', 'مشكلة في الدفع', 'اقتراح تحسين'];

const ClientSupport: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; from: 'user' | 'support'; time: string }[]>([
    { text: 'مرحباً! كيف يمكننا مساعدتك اليوم؟ 😊', from: 'support', time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { text, from: 'user', time }]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: 'شكراً لتواصلك معنا! سيتم الرد عليك قريباً من فريق الدعم.',
        from: 'support',
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1000);
  };

  return (
    <ClientLayout title="الدعم">
      <div className="bg-card rounded-2xl border border-border/30 overflow-hidden flex flex-col shadow-sm" style={{ height: 'calc(100vh - 200px)', maxHeight: '600px' }}>
        {/* Header */}
        <div className="p-4 border-b border-border/30 flex items-center gap-3 bg-card">
          <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center relative">
            <Headphones className="w-5 h-5 text-accent" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-sm">دعم مطعم مزاج</p>
            <p className="text-[11px] text-emerald-600 font-medium">متصل الآن • يرد عادةً خلال دقائق</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.from === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.from === 'user' ? 'bg-primary/10' : 'bg-accent/10'
              }`}>
                {msg.from === 'user' ? <User className="w-3.5 h-3.5 text-primary" /> : <Bot className="w-3.5 h-3.5 text-accent" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.from === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}>
                <p className="leading-relaxed">{msg.text}</p>
                <p className={`text-[9px] mt-1 ${msg.from === 'user' ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => sendMessage(reply)}
                className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-colors shrink-0"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border/30 flex gap-2 bg-card">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="اكتب رسالتك..."
            className="rounded-full flex-1 h-11 text-sm bg-muted/50 border-border/30"
            onKeyDown={e => e.key === 'Enter' && sendMessage(message)}
          />
          <Button onClick={() => sendMessage(message)} size="icon" className="rounded-full h-11 w-11 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientSupport;
