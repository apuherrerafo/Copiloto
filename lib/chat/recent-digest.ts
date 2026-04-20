import type { LogEntry } from '@/lib/store/db';

const MAX_CHARS = 4_500;

/**
 * Compact multi-day log summary for the chat system prompt (token-aware).
 */
export function buildRecentLogsDigest(logs: LogEntry[], maxDays = 7): string {
  const byDate = new Map<string, LogEntry[]>();
  for (const l of logs) {
    if (!byDate.has(l.date)) byDate.set(l.date, []);
    byDate.get(l.date)!.push(l);
  }
  const dates = [...byDate.keys()].sort().reverse().slice(0, maxDays);
  const lines: string[] = [];

  for (const d of dates) {
    const entries = byDate.get(d)!.sort((a, b) => a.timestamp - b.timestamp);
    const parts = entries.slice(0, 20).map((e) => {
      const t = new Date(e.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const lab = e.label.replace(/\s+/g, ' ').slice(0, 48);
      return `${t} ${e.type}: ${lab}`;
    });
    lines.push(`${d} (${entries.length} entries):\n  ${parts.join('\n  ')}`);
  }

  let out = lines.join('\n');
  if (out.length > MAX_CHARS) {
    out = `${out.slice(0, MAX_CHARS)}\n… (truncated)`;
  }
  return out;
}
