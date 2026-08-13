import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Send, Bot, User } from 'lucide-react';
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
      <div className="bg-white dark:bg-card rounded-2xl border border-border/15 overflow-hidden flex flex-col shadow-sm" style={{ height: 'calc(100vh - 200px)', maxHeight: '600px' }}>
        {/* Header */}
        <div className="p-4 border-b border-border/15 flex items-center gap-3 bg-gradient-to-l from-accent/5 to-transparent">
          <div className="w-11 h-11 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center relative shadow-md">
            <Headphones className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-card" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-sm">دعم مطعم مزاج</p>
            <p className="text-[11px] text-emerald-600 font-medium">متصل الآن</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[hsl(220,20%,97%)] dark:bg-background/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.from === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.from === 'user' ? 'bg-primary text-white' : 'bg-accent/15 text-accent'
              }`}>
                {msg.from === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.from === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-white dark:bg-card text-foreground rounded-bl-md border border-border/10'
              }`}>
                <p className="leading-relaxed">{msg.text}</p>
                <p className={`text-[9px] mt-1.5 ${msg.from === 'user' ? 'text-white/50' : 'text-muted-foreground'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar bg-[hsl(220,20%,97%)] dark:bg-background/50">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => sendMessage(reply)}
                className="whitespace-nowrap text-xs px-3.5 py-2 rounded-full border border-primary/20 text-primary bg-white dark:bg-card hover:bg-primary/5 transition-colors shrink-0 font-medium shadow-sm"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border/15 flex gap-2 bg-white dark:bg-card">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="اكتب رسالتك..."
            className="rounded-xl flex-1 h-11 text-sm bg-muted/30 border-border/15"
            onKeyDown={e => e.key === 'Enter' && sendMessage(message)}
          />
          <Button onClick={() => sendMessage(message)} size="icon" className="rounded-xl h-11 w-11 shrink-0 shadow-md shadow-primary/20">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientSupport;
