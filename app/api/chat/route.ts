import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { JULIO_SYSTEM_PROMPT, buildContextBlock } from '@/lib/protocols/julio-profile';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
/** Max messages sent to the API (user+assistant pairs); keeps token use bounded. */
const CHAT_MESSAGE_WINDOW = 10;

type ChatMsg = { role: 'user' | 'assistant'; content: string };

function normalizeMessages(raw: unknown): ChatMsg[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMsg[] = [];
  for (const m of raw) {
    if (!m || typeof m !== 'object') continue;
    const role = (m as { role?: string }).role;
    const content = (m as { content?: unknown }).content;
    if (role !== 'user' && role !== 'assistant') continue;
    if (typeof content !== 'string' || content.length > 16_000) continue;
    out.push({ role, content });
  }
  return out;
}

function windowMessages(messages: ChatMsg[], max: number): ChatMsg[] {
  let msgs = messages.length > max ? messages.slice(-max) : [...messages];
  while (msgs.length > 0 && msgs[0].role === 'assistant') {
    msgs = msgs.slice(1);
  }
  return msgs;
}

function sanitizeTodayLogs(raw: unknown): Array<{ type: string; label: string; timestamp: number }> {
  if (!Array.isArray(raw)) return [];
  const out: Array<{ type: string; label: string; timestamp: number }> = [];
  for (const x of raw) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    const ts = typeof o.timestamp === 'number' ? o.timestamp : Number(o.timestamp);
    out.push({
      type: typeof o.type === 'string' ? o.type.slice(0, 80) : String(o.type ?? '').slice(0, 80),
      label: typeof o.label === 'string' ? o.label.slice(0, 200) : String(o.label ?? '').slice(0, 200),
      timestamp: Number.isFinite(ts) ? ts : 0,
    });
  }
  return out;
}

export async function POST(request: NextRequest) {
  let body: { messages?: unknown; todayLogs?: unknown; fastElapsedHours?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { messages: rawMessages, todayLogs, fastElapsedHours } = body;
  const messages = windowMessages(normalizeMessages(rawMessages), CHAT_MESSAGE_WINDOW);

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
  }

  const logs = sanitizeTodayLogs(todayLogs);
  const fastRaw = typeof fastElapsedHours === 'number' ? fastElapsedHours : Number(fastElapsedHours);
  const fastNum = Number.isFinite(fastRaw) ? Math.min(48, Math.max(0, fastRaw)) : 0;

  const systemPrompt = JULIO_SYSTEM_PROMPT + buildContextBlock(logs, fastNum);

  const model = process.env.ANTHROPIC_CHAT_MODEL?.trim() || DEFAULT_MODEL;

  const stream = await client.messages.create({
    model,
    max_tokens: 512,
    system: systemPrompt,
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
    cancel() {
      stream.controller.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
