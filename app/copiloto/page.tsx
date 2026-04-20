'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getLogsByDate, getLogsForLastNDays } from '@/lib/store/db';
import { getFastElapsed, isEatingWindow } from '@/lib/protocols/julio';
import { localDateISO } from '@/lib/dates';
import { buildRecentLogsDigest } from '@/lib/chat/recent-digest';
import { formatProtocolForPrompt, readProtocolSettings } from '@/lib/protocols/user-protocol';
import { stripMarkdownForDisplay } from '@/lib/chat/sanitize-display';
import HypoMascot from '@/components/ui/HypoMascot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const welcomeStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
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
      <HypoMascot size={mascotSize} title="HypoAI" />
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
  const hasMessages = messages.length > 0 || loading;

  useEffect(() => {
    if (hasMessages) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [messages, streamText, hasMessages]);

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
      const s = readProtocolSettings();
      const eatingWindowLine = isEatingWindow()
        ? `Inside eating window (~${s.breakFastHour}:00–${s.eatingWindowEndHour}:00, local).`
        : 'Currently fasting (outside eating window).';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          todayLogs,
          fastElapsedHours,
          recentDigest,
          userProtocolSummary: formatProtocolForPrompt(),
          contextMeta: { eatingWindowLine, maxFastHours: s.maxFastHours },
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

      setMessages((prev) => [...prev, { role: 'assistant', content: full }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Hmm, I couldn’t connect just now 😔 Check your Anthropic API key and try again.',
        },
      ]);
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

  /** Reserva altura en el flujo del `main` (pb-20 + safe top) mientras el chat real va `fixed` como WhatsApp. */
  const shellSpacerH =
    'h-[calc(100dvh-5rem-env(safe-area-inset-top,0px))] max-h-[calc(100dvh-5rem-env(safe-area-inset-top,0px))]';

  return (
    <>
      <div className={`-mb-20 ${shellSpacerH} shrink-0`} aria-hidden />
      <motion.div
        className="fixed left-0 right-0 z-[40] flex flex-col overflow-hidden bg-background"
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
      <div className="shrink-0 border-b border-hairline bg-background px-4 pb-4 pt-12">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface"
            aria-label="Back"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-muted">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <HippoAvatar />
          <div>
            <h1 className="font-serif text-xl italic leading-none text-ink">HypoAI</h1>
            <p className="mt-0.5 text-xs text-muted">Your friendly copilot · not medical advice</p>
          </div>
        </div>
        <p className="mt-3 px-1 text-[10px] leading-snug text-muted/85">
          HypoAI is generative and can make mistakes. It does not replace your doctor or change your treatment.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4">
        {showWelcome && (
          <motion.div
            className="flex min-h-full flex-col items-center px-2 pb-6 pt-6 text-center"
            variants={welcomeStagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp}>
              <HippoAvatar size="lg" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="mb-3 mt-5 font-serif text-2xl italic text-ink">
              Hi, I&apos;m HypoAI…
            </motion.h2>
            <motion.p variants={fadeUp} className="max-w-sm text-sm leading-relaxed text-muted">
              I can use your levothyroxine protocol, your fast, and what you log to suggest ideas and wording — but I am
              not a clinician. Think of me as a study buddy and checklist helper, not a diagnosis or a prescription.
            </motion.p>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && <HippoAvatar />}
            <div
              className={`max-w-[82%] whitespace-pre-wrap rounded-card px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-br-sm bg-sage text-white'
                  : 'rounded-bl-sm border border-hairline bg-surface text-ink shadow-soft'
              }`}
            >
              {msg.role === 'assistant' ? stripMarkdownForDisplay(msg.content) : msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-end justify-start gap-2">
            <HippoAvatar />
            <div className="max-w-[82%] rounded-card rounded-bl-sm border border-hairline bg-surface px-4 py-3 text-sm leading-relaxed text-ink shadow-soft">
              {streamText ? (
                stripMarkdownForDisplay(streamText)
              ) : (
                <span className="flex h-4 items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-hairline bg-background px-4 pb-chat-dock pt-2">
        <div className="flex items-end gap-2 rounded-card border border-hairline bg-surface px-4 py-3 shadow-soft transition-all focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/15">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write any question you have here…"
            aria-label="Write your message to HypoAI"
            rows={1}
            className="max-h-24 flex-1 resize-none bg-transparent text-sm text-ink outline-none placeholder:text-muted/60"
            style={{ lineHeight: '1.5' }}
          />
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sage transition-opacity disabled:opacity-30"
            aria-label="Send"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 rotate-90 text-white">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted/60">Enter to send · Shift+Enter for new line</p>
      </div>
    </motion.div>
    </>
  );
}
