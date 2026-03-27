import React, { useState } from 'react';
import { Headphones, Send, MessageCircle } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const ClientSupport: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; from: 'user' | 'support'; time: string }[]>([
    { text: 'مرحباً! كيف يمكننا مساعدتك؟', from: 'support', time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) },
  ]);

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
    toast.success('تم إرسال رسالتك');
  };

  return (
    <>
      <Helmet><title>الدعم - مطعم مزاج</title></Helmet>
      <ClientLayout title="الدعم">
        <div className="bg-card rounded-2xl shadow-card overflow-hidden flex flex-col" style={{ height: '60vh' }}>
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <Headphones className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">دعم مزاج</p>
              <p className="text-xs text-accent">متصل</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.from === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border flex gap-2">
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="rounded-full flex-1"
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} size="icon" className="rounded-full btn-primary shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </ClientLayout>
    </>
  );
};

export default ClientSupport;
