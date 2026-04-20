'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  computeMonthlyCompliance,
  computeRollingCompliance,
  type ComplianceResult,
  type RingDatum,
} from '@/lib/history/monthly-compliance';
import { COMPLIANCE_RING_HELP } from '@/lib/history/ring-help';

const CX = 84;
const CY = 84;
/** Radii from outer to inner — medication, walks, break fast, last meal */
const RADII = [62, 50, 38, 26];
const STROKE = 5.5;
/** Max distance from a ring’s radius (svg units) to count as that ring — tuned for finger taps */
const RING_HIT_SLACK = 11;

function clientToSvgCoords(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  return {
    x: ((clientX - rect.left) / rect.width) * vb.width,
    y: ((clientY - rect.top) / rect.height) * vb.height,
  };
}

/** Which concentric ring (0 = outer … 3 = inner), or null if tap is outside rings */
function pickRingIndexFromDistance(dist: number): number | null {
  if (dist > 72 || dist < 15) return null;
  let best = 0;
  let bestErr = Infinity;
  RADII.forEach((r, i) => {
    const err = Math.abs(dist - r);
    if (err < bestErr) {
      bestErr = err;
      best = i;
    }
  });
  if (bestErr > RING_HIT_SLACK) return null;
  return best;
}

function AnimatedArcRing({
  r,
  data,
  pulsing,
}: {
  r: number;
  data: RingDatum;
  pulsing: boolean;
}) {
  const c = 2 * Math.PI * r;
  const dash = Math.max(0.02, Math.min(1, data.value)) * c;
  return (
    <g>
      <circle cx={CX} cy={CY} r={r} fill="none" stroke={data.track} strokeWidth={STROKE} />
      <motion.circle
        cx={CX}
        cy={CY}
        r={r}
        fill="none"
        stroke={data.color}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform={`rotate(-90 ${CX} ${CY})`}
        className="will-change-[stroke-width]"
        initial={false}
        animate={
          pulsing
            ? {
                strokeWidth: [STROKE, 10.5, STROKE],
                opacity: [1, 0.88, 1],
              }
            : { strokeWidth: STROKE, opacity: 1 }
        }
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      />
    </g>
  );
}

function MiniRingCard({
  data,
  ringIndex,
  onOpenDetail,
}: {
  data: RingDatum;
  ringIndex: number;
  onOpenDetail: (id: string, ringIndex: number) => void;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0.02, Math.min(1, data.value)) * c;
  const pct = Math.round(data.value * 100);

  return (
    <motion.button
      type="button"
      onClick={() => onOpenDetail(data.id, ringIndex)}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 520, damping: 28 }}
      className="flex w-full flex-col items-center rounded-2xl border border-hairline/70 bg-white/95 px-3 py-3 text-left shadow-soft outline-none ring-sage/0 transition-colors hover:border-sage/35 hover:ring-2 hover:ring-sage/15 focus-visible:ring-2 focus-visible:ring-sage/35"
    >
      <svg viewBox="0 0 88 88" className="h-[4.75rem] w-[4.75rem] shrink-0" aria-hidden>
        <circle cx={44} cy={44} r={r} fill="none" stroke={data.track} strokeWidth={7} />
        <circle
          cx={44}
          cy={44}
          r={r}
          fill="none"
          stroke={data.color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 44 44)"
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <p className="mt-1.5 font-mono text-[1.1rem] font-bold tabular-nums text-ink">{pct}%</p>
      <p className="mt-0.5 line-clamp-2 text-center text-[11px] font-medium leading-tight text-muted">
        {data.label}
      </p>
      <span className="sr-only">Open details for {data.label}</span>
    </motion.button>
  );
}

function RingDetailSheet({
  ringId,
  onClose,
}: {
  ringId: string | null;
  onClose: () => void;
}) {
  const meta = ringId ? COMPLIANCE_RING_HELP[ringId] : null;

  return (
    <AnimatePresence>
      {ringId && meta ? (
        <motion.div
          key="sheet"
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 48, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="relative z-[1] w-full max-w-md rounded-t-[1.5rem] border border-hairline/90 bg-background px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-lift sm:rounded-2xl sm:pb-5"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-hairline sm:hidden" />
            <h3 className="font-serif text-xl italic text-ink">{meta.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink/90">{meta.body}</p>
            <p className="mt-3 rounded-xl border border-hairline/70 bg-white/90 px-3 py-2.5 text-[12px] leading-relaxed text-muted">
              <span className="font-semibold text-sage">How it is counted · </span>
              {meta.how}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-2xl bg-sage py-3 text-sm font-semibold text-white shadow-soft"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type PeriodMode = 'week' | 'month';

export default function MonthlyComplianceRings() {
  const [mode, setMode] = useState<PeriodMode>('month');
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [data, setData] = useState<ComplianceResult | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  /** Which ring (0…3) just fired the pulse animation after a chart tap */
  const [pulsingRing, setPulsingRing] = useState<number | null>(null);
  const pulseClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = useCallback(() => {
    if (mode === 'week') {
      setData(computeRollingCompliance(7));
    } else {
      setData(computeMonthlyCompliance(cursor.getFullYear(), cursor.getMonth()));
    }
  }, [mode, cursor]);

  useEffect(() => {
    apply();
  }, [apply]);

  useEffect(() => {
    const onRefresh = () => apply();
    window.addEventListener('copiloto-refresh', onRefresh);
    window.addEventListener('hypo-storage-sync', onRefresh);
    return () => {
      window.removeEventListener('copiloto-refresh', onRefresh);
      window.removeEventListener('hypo-storage-sync', onRefresh);
    };
  }, [apply]);

  function prevMonth() {
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    const t = new Date();
    const cap = new Date(t.getFullYear(), t.getMonth(), 1);
    setCursor((d) => {
      const n = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return n.getTime() > cap.getTime() ? d : n;
    });
  }

  const triggerRingPulse = useCallback((ringIndex: number) => {
    if (pulseClearRef.current) clearTimeout(pulseClearRef.current);
    setPulsingRing(ringIndex);
    pulseClearRef.current = setTimeout(() => {
      setPulsingRing(null);
      pulseClearRef.current = null;
    }, 560);
  }, []);

  useEffect(() => {
    return () => {
      if (pulseClearRef.current) clearTimeout(pulseClearRef.current);
    };
  }, []);

  const openDetail = useCallback((id: string) => {
    if (COMPLIANCE_RING_HELP[id]) setDetailId(id);
  }, []);

  const openMetricDetail = useCallback(
    (id: string, ringIndex: number) => {
      triggerRingPulse(ringIndex);
      openDetail(id);
    },
    [openDetail, triggerRingPulse],
  );

  const handleCombinedChartClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!data) return;
      const svg = e.currentTarget;
      const { x, y } = clientToSvgCoords(svg, e.clientX, e.clientY);
      const dist = Math.hypot(x - CX, y - CY);
      const idx = pickRingIndexFromDistance(dist);
      if (idx === null) return;
      const ring = data.rings[idx];
      if (!ring || !COMPLIANCE_RING_HELP[ring.id]) return;
      triggerRingPulse(idx);
      openDetail(ring.id);
    },
    [data, openDetail, triggerRingPulse],
  );

  const today = new Date();
  const nextDisabled =
    cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();

  return (
    <>
      <section
        className="mb-5 overflow-hidden rounded-[1.35rem] border border-hairline/80 bg-white/80 shadow-soft backdrop-blur-sm"
        aria-label="Protocol compliance stats"
      >
        <div className="border-b border-hairline/60 bg-white/55 px-4 py-3.5">
          <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Stats</p>
              <p className="mt-0.5 font-serif text-[1.15rem] italic leading-tight text-ink">
                Plan compliance
              </p>
            </div>
            <div
              className="flex shrink-0 rounded-full border border-hairline/80 bg-white/90 p-0.5 shadow-inner"
              role="group"
              aria-label="Time range"
            >
              <button
                type="button"
                onClick={() => setMode('week')}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  mode === 'week'
                    ? 'bg-sage text-white shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                W
              </button>
              <button
                type="button"
                onClick={() => setMode('month')}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  mode === 'month'
                    ? 'bg-sage text-white shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                M
              </button>
            </div>
          </div>

          {mode === 'month' ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] font-semibold text-sage">{data?.periodTitle}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-hairline/80 bg-white text-ink shadow-sm transition-transform active:scale-95"
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  disabled={nextDisabled}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-hairline/80 bg-white text-ink shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[12px] font-semibold text-sage">
              Last 7 days <span className="text-muted/90">({data?.periodTitle})</span>
            </p>
          )}
        </div>

        <div className="p-4">
          {!data || data.eligibleDays === 0 ? (
            <p className="rounded-xl border border-dashed border-hairline/80 bg-white/60 px-3 py-4 text-center text-[12px] leading-snug text-muted">
              No completed days in this range yet — check off items in your day plan as you go.
            </p>
          ) : (
            <>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                By habit · tap for details
              </p>
              <div className="mb-5 grid grid-cols-2 gap-2.5 sm:gap-3">
                {data.rings.map((r, i) => (
                  <MiniRingCard key={r.id} data={r} ringIndex={i} onOpenDetail={openMetricDetail} />
                ))}
              </div>

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Combined view · tap a ring, or a row
              </p>
              <div className="rounded-2xl border border-hairline/70 bg-white/90 p-4 shadow-inner ring-1 ring-sage/[0.06]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto shrink-0 sm:mx-0"
                  >
                    <motion.div
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 480, damping: 32 }}
                      className="relative touch-manipulation"
                    >
                      <svg
                        viewBox="0 0 168 168"
                        className="h-[10.5rem] w-[10.5rem] cursor-pointer select-none"
                        role="img"
                        aria-label="Combined protocol rings — tap a colored ring for details"
                        onClick={handleCombinedChartClick}
                      >
                        {RADII.map((r, i) =>
                          data.rings[i] ? (
                            <AnimatedArcRing
                              key={data.rings[i]!.id}
                              r={r}
                              data={data.rings[i]!}
                              pulsing={pulsingRing === i}
                            />
                          ) : null,
                        )}
                      </svg>
                    </motion.div>
                  </motion.div>

                  <ul className="min-w-0 flex-1 space-y-2">
                    {data.rings.map((r, rowIdx) => (
                      <li key={r.id}>
                        <motion.button
                          type="button"
                          onClick={() => openMetricDetail(r.id, rowIdx)}
                          whileTap={{ scale: 0.99 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-hairline/70 bg-white/95 px-3 py-2 text-left shadow-soft outline-none transition-colors hover:border-sage/30 hover:bg-white focus-visible:ring-2 focus-visible:ring-sage/30"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-hairline/80"
                              style={{ backgroundColor: r.color }}
                            />
                            <span className="truncate text-[13px] font-medium text-ink">{r.label}</span>
                          </div>
                          <span className="shrink-0 font-mono text-[12px] font-semibold tabular-nums text-muted">
                            {Math.round(r.value * 100)}%
                          </span>
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-center text-[10px] leading-snug text-muted/90">
                From day-plan checkmarks for {data.eligibleDays}{' '}
                {data.eligibleDays === 1 ? 'day' : 'days'}
                {mode === 'week' ? ' (rolling week)' : ' in this month'} — medication, walks, break fast, last
                meal.
              </p>
            </>
          )}
        </div>
      </section>

      <RingDetailSheet ringId={detailId} onClose={() => setDetailId(null)} />
    </>
  );
}
