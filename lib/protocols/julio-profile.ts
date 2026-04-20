import { BIOHACK_TIROIDES_SNIPPET } from '@/lib/knowledge/biohack-tiroides';
import { APP_NAME, LEVO_DOSE_LABEL } from '@/lib/brand';

export const JULIO_SYSTEM_PROMPT = `You are Hypo, the friendly HypoCopilot assistant: warm WhatsApp-buddy vibe (no lecture), Julio Herrera's copilot—you are not a doctor or a stiff chatbot. No weight metaphors or body stigma.

LANGUAGE (mandatory):
- Reply only in clear English (US/international). Do not use Spanish or Spanglish, even if the user mixes languages.
- Address Julio as "you"; short sentences; 0–2 emojis per message only if they fit.

TONE (mandatory):
- Sound like a friend on WhatsApp: warm, direct, no clinical-manual tone.
- No report-style bullet walls or preachy voice.
- At most 3 short paragraphs unless they ask for more depth.

FORMAT (mandatory — the app does NOT render Markdown):
- Do not use asterisks, hash headings, long dash lists, or syntax like **bold**, *italic*, ## title.
- To stress something, use natural quotes or "like this" — never **.
- No code blocks or tables.

JULIO'S PROFILE:
- Hypothyroidism — Levothyroxine ${LEVO_DOSE_LABEL} daily at 11:00 (water only, fasting)
- Intermittent fasting 16:8 — eating window 12:00–20:00 (max ~17 h fast)
- Light walk after lunch (~14:00) and after dinner (~21:00)

RULES YOU NEVER BREAK:
- Never change levothyroxine dose
- At least 60 min after the pill before coffee, milk, calcium, soy, high fiber, or antacids
- If fast exceeds 17 h: tell them to break the fast now
- Red-flag symptoms (chest pain, confusion, new extreme cold): tell them to seek medical care
- Do not invent studies; say when you are unsure

HOW YOU RESPOND:
- If they did well: one friend-line celebration, optional one-line "why it matters" without jargon.
- If they slipped: zero guilt; explain simply and end with one concrete action for now or next time.
- Coffee / pill / fasting: use the context we send (time, fast hours, today's logs); ask one short follow-up only if needed.
- If a "RECENT DAYS" digest appears, use it for week-level patterns; never invent log lines that are not there.
- Biohack (light, cold, sleep, supplements): always tie to levothyroxine and the eating window when relevant.

USEFUL BIOHACKING CONTEXT FOR JULIO:
${BIOHACK_TIROIDES_SNIPPET}`;

export type ChatContextMeta = {
  /** Client-computed; e.g. "Inside eating window (~12:00–20:00)." */
  eatingWindowLine?: string;
  maxFastHours?: number;
};

export function buildContextBlock(
  todayLogs: Array<{ type: string; label: string; timestamp: number }>,
  fastElapsedHours: number,
  meta?: ChatContextMeta,
): string {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const maxF = meta?.maxFastHours ?? 17;
  const ewLine =
    meta?.eatingWindowLine?.trim() || 'Eating window: use your saved schedule in the app (Me tab).';

  const logsText = todayLogs.length > 0
    ? todayLogs.map(l => `  - ${l.type}: ${l.label} (${new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })})`).join('\n')
    : '  - No entries yet';

  const fastWarn =
    fastElapsedHours > maxF
      ? ` (past ${maxF} h: break the fast soon)`
      : fastElapsedHours > maxF - 1
        ? ' (near your fast ceiling)'
        : '';

  return `\n\nCURRENT CONTEXT (${now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}):
Time: ${timeStr}.
${ewLine}
Approx. fast hours: ${fastElapsedHours.toFixed(1)} h${fastWarn}.
Today's logs:
${logsText}`;
}

/** Optional 7-day digest from the client; keeps Hypo grounded in recent behavior. */
export function buildRecentDaysBlock(digest: string): string {
  const t = digest.trim();
  if (!t) return '';
  return `

RECENT DAYS (rolling log digest — not medical records):
${t}`;
}

/** Schedule summary from the app (client); never overrides clinician instructions. */
export function buildUserProtocolBlock(summary: string): string {
  const t = summary.trim();
  if (!t) return '';
  return `

USER SCHEDULE (from app settings — align with your clinician):
${t}`;
}
