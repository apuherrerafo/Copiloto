'use client';

import { type FeedItem } from '@/app/api/news/route';

const TAG_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  tiroides:   { label: 'Tiroides',   color: 'text-sage',   bg: 'bg-sage/10' },
  ayuno:      { label: 'Ayuno IF',   color: 'text-amber',  bg: 'bg-amber/10' },
  metabolismo:{ label: 'Metabolismo',color: 'text-coral',  bg: 'bg-coral/10' },
  nutricion:  { label: 'Nutrición',  color: 'text-sage',   bg: 'bg-sage/10' },
  biohack:    { label: 'Biohack',    color: 'text-ink',    bg: 'bg-amber/15' },
  general:    { label: 'Salud',      color: 'text-muted', bg: 'bg-hairline' },
};

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const h = (Date.now() - d.getTime()) / 3_600_000;
    if (h < 1)  return 'Hace menos de 1h';
    if (h < 24) return `Hace ${Math.floor(h)}h`;
    if (h < 48) return 'Ayer';
    const days = Math.floor(h / 24);
    if (days < 30) return `Hace ${days} días`;
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

interface Props {
  item: FeedItem & { score?: number };
}

export default function FeedCard({ item }: Props) {
  const tag = TAG_CONFIG[item.tag] ?? TAG_CONFIG.general;

  const content = (
    <div className="bg-surface border border-hairline rounded-card px-4 py-4 active:bg-background transition-colors shadow-soft">
      {/* Tag + source + time */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tag.bg} ${tag.color}`}>
          {tag.label}
        </span>
        <span className="text-[10px] text-muted/40">·</span>
        <span className="text-[10px] text-muted">{item.source}</span>
        {item.pubDate && (
          <>
            <span className="text-[10px] text-muted/40">·</span>
            <span className="text-[10px] text-muted/70">{timeAgo(item.pubDate)}</span>
          </>
        )}
        <div className="ml-auto">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-muted/25" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 11L11 5M11 5H7M11 5v4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Title */}
      <p className="text-ink text-sm font-medium leading-snug line-clamp-3">
        {item.title}
      </p>

      {/* Summary */}
      {item.summary && (
        <p className="text-muted text-xs mt-1.5 leading-relaxed line-clamp-2">
          {item.summary}
        </p>
      )}
    </div>
  );

  if (item.link) {
    return (
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
