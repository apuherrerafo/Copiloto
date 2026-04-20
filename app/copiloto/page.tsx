'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getLogsByDate, getLogsForLastNDays } from '@/lib/store/db';
import { getFastElapsed } from '@/lib/protocols/julio';
import { localDateISO } from '@/lib/dates';
import { buildRecentLogsDigest } from '@/lib/chat/recent-digest';
import { stripMarkdownForDisplay } from '@/lib/chat/sanitize-display';
import HypoMascot from '@/components/ui/HypoMascot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'Can I have coffee now?',
  'What can I eat to break my fast?',
  'I’m really hungry — what should I do?',
  'How is my fast going today?',
  'Does morning light or cold exposure fit my thyroid today?',
  'Which supplements should I space from levothyroxine?',
];

const welcomeStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const startersGrid = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
};

export default function CopilotoPage() {
  return (
    <Suspense>
      <CopilotoInner />
    </Suspense>
  );
}

function HippoAvatar({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-16 h-16' : 'w-7 h-7';
  const mascotSize = size === 'lg' ? 52 : 22;
  return (
    <div className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-sage/15 ring-1 ring-sage/15`}>
      <HypoMascot size={mascotSize} title="Hypo" />
    </div>
  );
}

function CopilotoInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoQ = searchParams.get('q');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasMessages = messages.length > 0 || loading;

  // Scroll to bottom ONLY when there are actual messages
  useEffect(() => {
    if (hasMessages) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamText, hasMessages]);

  // Auto-send question from "Quiero saber más"
  useEffect(() => {
    if (autoQ) {
      const t = setTimeout(() => sendMessage(autoQ), 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreamText('');

    try {
      const [todayLogs, weekLogs] = await Promise.all([
        getLogsByDate(localDateISO()),
        getLogsForLastNDays(7),
      ]);
      const fastElapsedHours = getFastElapsed();
      const recentDigest = buildRecentLogsDigest(weekLogs);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          todayLogs,
          fastElapsedHours,
          recentDigest,
        }),
      });

      if (!res.ok) throw new Error('Server error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setStreamText(full);
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Hmm, I couldn’t connect just now 😔 Check your Anthropic API key and try again.',
      }]);
    } finally {
      setLoading(false);
      setStreamText('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
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
      <div className="px-4 pt-12 pb-4 bg-background border-b border-hairline shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface transition-colors shrink-0"
            aria-label="Back"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-muted">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </button>
          <HippoAvatar />
          <div>
            <h1 className="font-serif italic text-xl text-ink leading-none">Hypo</h1>
            <p className="text-xs text-muted mt-0.5">Your friendly copilot · AI answers</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] leading-snug text-muted/85 px-1">
          HypoAI is generative and can make mistakes. It does not replace your doctor or change your treatment.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {showWelcome && (
          <motion.div
            className="flex flex-col items-center justify-center min-h-full text-center pb-8 pt-4"
            variants={welcomeStagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp}>
              <HippoAvatar size="lg" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-serif italic text-2xl text-ink mb-2 mt-4">
              Hi, I’m Hypo
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted text-sm mb-6 max-w-xs leading-relaxed">
              I know your levothyroxine protocol, your fast, and everything you log each day. Ask me anything!
            </motion.p>
            <motion.div variants={startersGrid} className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {STARTERS.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  variants={fadeUp}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void sendMessage(s)}
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
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
          >
            {msg.role === 'assistant' && <HippoAvatar />}
            <div className={`max-w-[82%] px-4 py-3 rounded-card text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-sage text-white rounded-br-sm'
                : 'bg-surface border border-hairline text-ink rounded-bl-sm shadow-soft'
            }`}>
              {msg.role === 'assistant' ? stripMarkdownForDisplay(msg.content) : msg.content}
            </div>
          </motion.div>
        ))}

        {/* Streaming */}
        {loading && (
          <div className="flex justify-start items-end gap-2">
            <HippoAvatar />
            <div className="max-w-[82%] px-4 py-3 rounded-card rounded-bl-sm bg-surface border border-hairline text-ink text-sm leading-relaxed shadow-soft">
              {streamText ? stripMarkdownForDisplay(streamText) : (
                <span className="flex gap-1 items-center h-4">
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
            placeholder="Ask Hypo…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-ink text-sm outline-none placeholder:text-muted/50 max-h-24"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-sage rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white rotate-90">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-muted/60 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </motion.div>
  );
}
