'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLogsByDate } from '@/lib/store/db';
import { getFastElapsed } from '@/lib/protocols/julio';
import GeneIcon from '@/components/ui/GeneIcon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  '¿Puedo tomar café ahora?',
  '¿Qué puedo comer para romper el ayuno?',
  'Tengo mucho hambre, ¿qué hago?',
  '¿Cómo va mi ayuno hoy?',
  '¿Luz matutina o frío leve encajan con mi tiroides hoy?',
  '¿Qué suplementos o cafeína debo espaciar respecto a la levotiroxina?',
];

const welcomeStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const startersGrid = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.06 },
  },
};

export default function CopilotoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreamText('');

    try {
      const todayISO = new Date().toISOString().slice(0, 10);
      const todayLogs = await getLogsByDate(todayISO);
      const fastElapsedHours = getFastElapsed();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          todayLogs,
          fastElapsedHours,
        }),
      });

      if (!res.ok) throw new Error('Error del servidor');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setStreamText(full);
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, no pude conectarme. Verifica tu API key de Anthropic en `.env.local`.',
      }]);
    } finally {
      setLoading(false);
      setStreamText('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const showWelcome = messages.length === 0 && !loading;

  return (
    <motion.div
      className="flex flex-col h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-4 bg-background border-b border-hairline shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center shadow-soft">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <h1 className="font-serif italic text-xl text-ink leading-none">Copiloto</h1>
            <p className="text-xs text-muted mt-0.5">Conoce tu protocolo completo</p>
          </div>
          <span className="ml-auto text-xs bg-sage/10 text-sage px-2 py-1 rounded-full font-medium">
            Claude Haiku
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {showWelcome && (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center pb-8"
            variants={welcomeStagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-4">
              <GeneIcon className="w-9 h-9 text-sage" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-serif italic text-2xl text-ink mb-2">
              Hola, Julio
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted text-sm mb-6 max-w-xs">
              Conozco tu protocolo, tu Levotiroxina y tu historial del día. Pregúntame lo que necesites.
            </motion.p>
            <motion.div variants={startersGrid} className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {STARTERS.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  variants={fadeUp}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 bg-surface border border-hairline rounded-card text-sm text-ink hover:border-sage/40 hover:bg-sage/5 transition-colors shadow-soft"
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-sage shrink-0 flex items-center justify-center mr-2 mt-1">
                <span className="text-white text-xs font-bold">C</span>
              </div>
            )}
            <div className={`max-w-[82%] px-4 py-3 rounded-card text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-sage text-white rounded-br-sm'
                : 'bg-surface border border-hairline text-ink rounded-bl-sm shadow-soft'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* Streaming */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-sage shrink-0 flex items-center justify-center mr-2 mt-1">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <div className="max-w-[82%] px-4 py-3 rounded-card rounded-bl-sm bg-surface border border-hairline text-ink text-sm leading-relaxed shadow-soft">
              {streamText || (
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                  <span className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                  <span className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                </span>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-24 pt-2 bg-background border-t border-hairline shrink-0">
        <div className="flex items-end gap-2 bg-surface border border-hairline rounded-card px-4 py-3 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/15 transition-all shadow-soft">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntale a tu copiloto..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-ink text-sm outline-none placeholder:text-muted/50 max-h-24"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-sage rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white rotate-90">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-muted/60 mt-2">Enter para enviar · Shift+Enter nueva línea</p>
      </div>
    </motion.div>
  );
}
