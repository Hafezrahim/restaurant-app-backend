import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Send, Bot, User } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ClientSupport: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; from: 'user' | 'support'; time: string }[]>([
    { text: 'مرحباً! كيف يمكننا مساعدتك؟', from: 'support', time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { text: message, from: 'user', time }]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: 'شكراً لتواصلك معنا! سيتم الرد عليك قريباً.',
        from: 'support',
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1000);
  };

  return (
    <ClientLayout title="الدعم">
      <div className="bg-card rounded-2xl border border-border/30 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', maxHeight: '600px' }}>
        {/* Header */}
        <div className="p-3 border-b border-border/30 flex items-center gap-3 bg-card">
          <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center">
            <Headphones className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-sm">دعم مزاج</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-green-600">متصل</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.from === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.from === 'user' ? 'bg-primary/10' : 'bg-accent/10'
              }`}>
                {msg.from === 'user' ? <User className="w-3.5 h-3.5 text-primary" /> : <Bot className="w-3.5 h-3.5 text-accent" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                msg.from === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[9px] mt-0.5 ${msg.from === 'user' ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border/30 flex gap-2 bg-card">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="اكتب رسالتك..."
            className="rounded-full flex-1 h-10 text-sm"
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="icon" className="rounded-full btn-primary h-10 w-10 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientSupport;
