'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FeedCard from './FeedCard';
import { type FeedItem } from '@/app/api/news/route';

const TAG_FILTERS = ['todos', 'ayuno', 'tiroides', 'metabolismo', 'biohack'] as const;
const NEWS_CACHE_KEY = 'copiloto_news_cache';
const NEWS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function tagLabel(t: string) {
  if (t === 'todos') return 'All';
  if (t === 'ayuno') return 'Fasting';
  if (t === 'tiroides') return 'Thyroid';
  if (t === 'biohack') return 'Biohack';
  return 'Metabolism';
}

function readCache(): { items: FeedItem[]; ts: number } | null {
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { items: FeedItem[]; ts: number };
    if (!Array.isArray(parsed.items) || typeof parsed.ts !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(items: FeedItem[]) {
  try {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ items, ts: Date.now() }));
  } catch {
    /* ignore quota errors */
  }
}

export default function NewsFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('todos');

  useEffect(() => {
    // Show cached items instantly, then revalidate in background if stale
    const cached = readCache();
    if (cached) {
      setItems(cached.items);
      setLoading(false);
      if (Date.now() - cached.ts < NEWS_CACHE_TTL_MS) return; // fresh — skip network
    }

    fetch('/api/news')
      .then(r => r.json())
      .then((data: FeedItem[]) => {
        setItems(data);
        setLoading(false);
        writeCache(data);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'todos' ? items : items.filter(i => i.tag === filter);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {TAG_FILTERS.map(t => (
          <motion.button
            key={t}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(t)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              filter === t
                ? 'bg-sage text-white border-sage shadow-soft'
                : 'bg-surface border-hairline text-muted'
            }`}
          >
            {tagLabel(t)}
          </motion.button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {loading && [1,2,3,4].map(i => (
          <div key={i} className="bg-surface border border-hairline rounded-card px-4 py-4 animate-pulse shadow-soft">
            <div className="flex gap-2 mb-2">
              <div className="h-4 w-16 bg-gray-100 rounded-full"/>
              <div className="h-4 w-12 bg-gray-100 rounded-full"/>
            </div>
            <div className="h-3 bg-gray-100 rounded w-full mb-1.5"/>
            <div className="h-3 bg-gray-100 rounded w-4/5 mb-1.5"/>
            <div className="h-2 bg-gray-100 rounded w-3/5"/>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted/50 text-sm py-8">No articles in this category</p>
        )}

        {!loading && filtered.map((item, i) => (
          <FeedCard key={item.id || i} item={item} />
        ))}
      </div>
    </div>
  );
}
