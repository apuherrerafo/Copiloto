'use client';

import { useCallback, useEffect, useState } from 'react';
import { getLogsByDate } from '@/lib/store/db';
import { yesterdayISO } from '@/lib/dates';
import { buildYesterdayRecap, type YesterdayRecap } from '@/lib/coach/yesterday-recap';

export default function YesterdayCoach() {
  const [recap, setRecap] = useState<YesterdayRecap | null>(null);

  const load = useCallback(() => {
    getLogsByDate(yesterdayISO()).then((entries) => {
      setRecap(buildYesterdayRecap(entries));
    });
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('copiloto-refresh', load);
    return () => window.removeEventListener('copiloto-refresh', load);
  }, [load]);

  if (!recap) return null;

  return (
    <div className="mb-4 w-full px-safe">
      <div className="rounded-card border border-sage/25 bg-sage/10 px-4 py-3 shadow-soft">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-1">Yesterday · your copilot</p>
        <h2 className="font-serif italic text-lg text-ink leading-snug">{recap.headline}</h2>
        <p className="text-sm text-muted leading-relaxed mt-2">{recap.lead}</p>
        <ul className="mt-3 space-y-1.5 text-xs text-ink/90 leading-snug list-disc pl-4 marker:text-sage">
          {recap.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        {recap.microGoal && (
          <div className="mt-3 flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2 border border-sage/20">
            <span className="text-base shrink-0">🎯</span>
            <p className="text-xs text-sage font-medium leading-snug">{recap.microGoal}</p>
          </div>
        )}
      </div>
    </div>
  );
}
