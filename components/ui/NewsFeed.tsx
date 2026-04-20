'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FeedCard from './FeedCard';
import { type FeedItem } from '@/app/api/news/route';

const TAG_FILTERS = ['todos', 'ayuno', 'tiroides', 'metabolismo', 'biohack'] as const;

function tagLabel(t: string) {
  if (t === 'todos') return 'All';
  if (t === 'ayuno') return 'Fasting';
  if (t === 'tiroides') return 'Thyroid';
  if (t === 'biohack') return 'Biohack';
  return 'Metabolism';
}

export default function NewsFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('todos');

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
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
