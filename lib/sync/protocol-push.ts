import { collectProtocolChecksForSync } from '@/lib/sync/protocol-collect';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleProtocolPush(): void {
  if (typeof window === 'undefined') return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void pushProtocolState();
  }, 500);
}

export async function pushProtocolState(): Promise<void> {
  if (typeof window === 'undefined') return;
  const protocolChecks = collectProtocolChecksForSync();
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ protocolChecks }),
    });
  } catch {
    /* offline */
  }
}
