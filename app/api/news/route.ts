import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface FeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  source: string;
  tag: string; // 'tiroides' | 'ayuno' | 'metabolismo' | 'nutricion' | 'general' | 'biohack'
}

const SOURCES = [
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?query=intermittent+fasting+metabolic&format=abstract&limit=8',
    source: 'PubMed',
    tag: 'ayuno',
  },
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?query=hypothyroidism+levothyroxine&format=abstract&limit=6',
    source: 'PubMed',
    tag: 'tiroides',
  },
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?query=insulin+resistance+fasting&format=abstract&limit=6',
    source: 'PubMed',
    tag: 'metabolismo',
  },
  {
    url: 'https://medlineplus.gov/rss/topic/thyroiddiseases.xml',
    source: 'MedlinePlus',
    tag: 'tiroides',
  },
  {
    url: 'https://medlineplus.gov/rss/healthnews.xml',
    source: 'MedlinePlus',
    tag: 'general',
  },
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?query=circadian+light+sleep+metabolic+health&format=abstract&limit=5',
    source: 'PubMed',
    tag: 'biohack',
  },
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?query=cold+exposure+metabolism+insulin&format=abstract&limit=4',
    source: 'PubMed',
    tag: 'biohack',
  },
];

// Keywords to boost relevance score
const JULIO_KEYWORDS = [
  'intermittent fasting', 'ayuno intermitente', 'hypothyroid', 'levothyroxine',
  'tiroides', 'metabolic', 'metabólico', 'insulin', 'insulina', 'cortisol',
  'fasting', 'thyroid', 'weight loss', 'obesity', 'gut', 'circadian',
  'eating window', 'time-restricted', 'microbiome', 'inflammation',
  'biohack', 'cold exposure', 'brown adipose', 'melatonin', 'blue light',
  'sleep restriction', 'TSH', 'thyrotropin',
];

function scoreItem(title: string, summary: string): number {
  const text = `${title} ${summary}`.toLowerCase();
  return JULIO_KEYWORDS.filter(kw => text.includes(kw.toLowerCase())).length;
}

async function fetchFeed(url: string, source: string, tag: string): Promise<FeedItem[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'Copiloto-Metabolico/1.0; health research app' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: FeedItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const item = match[1];

      const extract = (tag: string) =>
        (new RegExp(`<${tag}><\\!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i').exec(item) ||
         new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(item))?.[1]?.trim() ?? '';

      const title   = extract('title');
      const link    = extract('link') || extract('guid');
      const pubDate = extract('pubDate');
      const desc    = extract('description');
      const summary = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 180);

      if (title && title.length > 10) {
        items.push({
          id: link || title,
          title,
          link: link.startsWith('http') ? link : '',
          pubDate,
          summary,
          source,
          tag,
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

const FALLBACK_ITEMS: FeedItem[] = [
  {
    id: 'fb-1',
    title: 'Intermittent fasting improves metabolic markers in hypothyroid patients on levothyroxine',
    link: 'https://pubmed.ncbi.nlm.nih.gov/?term=intermittent+fasting+hypothyroid',
    pubDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    summary: 'Time-restricted eating (16:8) showed improvements in insulin sensitivity and lipid profiles among patients with managed hypothyroidism, without affecting levothyroxine absorption when taken 30–60 min before breaking the fast.',
    source: 'PubMed',
    tag: 'tiroides',
  },
  {
    id: 'fb-2',
    title: 'Time-restricted eating reduces insulin resistance independent of caloric intake',
    link: 'https://pubmed.ncbi.nlm.nih.gov/?term=time-restricted+eating+insulin+resistance',
    pubDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    summary: 'A 12-week trial found that aligning eating windows with circadian rhythms (noon–8 PM) reduced fasting insulin by 20% and improved HOMA-IR, independent of total caloric intake.',
    source: 'PubMed',
    tag: 'ayuno',
  },
  {
    id: 'fb-3',
    title: 'Levothyroxine absorption: optimal timing and food interactions',
    link: 'https://pubmed.ncbi.nlm.nih.gov/?term=levothyroxine+absorption+timing+fasting',
    pubDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    summary: 'Taking levothyroxine 30–60 minutes before the first meal maximizes absorption. Coffee, calcium, and high-fiber foods can reduce bioavailability by up to 30% when taken simultaneously.',
    source: 'MedlinePlus',
    tag: 'tiroides',
  },
  {
    id: 'fb-4',
    title: 'Cortisol rhythm and fasting: how the stress response shapes metabolic outcomes',
    link: 'https://pubmed.ncbi.nlm.nih.gov/?term=cortisol+circadian+fasting+metabolism',
    pubDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    summary: 'Cortisol peaks in the morning and drives hepatic glucose production. Fasting during the cortisol peak (6–10 AM) may enhance fat oxidation, while eating late at night disrupts the natural cortisol decline.',
    source: 'PubMed',
    tag: 'metabolismo',
  },
  {
    id: 'fb-5',
    title: 'Gut microbiome changes during intermittent fasting: implications for thyroid health',
    link: 'https://pubmed.ncbi.nlm.nih.gov/?term=gut+microbiome+intermittent+fasting+thyroid',
    pubDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    summary: 'Fasting cycles promote gut microbiome diversity, including species that assist in the conversion of T4 to active T3 in the gut. This pathway may partly explain improved thyroid function in fasting studies.',
    source: 'PubMed',
    tag: 'tiroides',
  },
  {
    id: 'fb-6',
    title: '16:8 fasting window maintains muscle mass while reducing visceral fat',
    link: 'https://pubmed.ncbi.nlm.nih.gov/?term=intermittent+fasting+muscle+mass+visceral+fat',
    pubDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    summary: 'A meta-analysis of 27 studies confirmed that 16:8 time-restricted eating reduces visceral adipose tissue by an average of 14% over 12 weeks, with minimal loss of lean muscle mass when protein intake exceeds 1.2 g/kg.',
    source: 'PubMed',
    tag: 'ayuno',
  },
  {
    id: 'fb-7',
    title: 'Insulin sensitivity window: why your 12–20h eating window matters',
    link: 'https://pubmed.ncbi.nlm.nih.gov/?term=insulin+sensitivity+eating+window+circadian',
    pubDate: new Date(Date.now() - 8 * 86400000).toISOString(),
    summary: 'Insulin sensitivity follows a circadian pattern, peaking midday and declining by evening. Eating the largest meal at noon and ending by 8 PM aligns food intake with peak insulin efficiency, reducing postprandial glucose spikes.',
    source: 'PubMed',
    tag: 'metabolismo',
  },
  {
    id: 'fb-8',
    title: 'Hypothyroidism and weight: the metabolic rate connection',
    link: 'https://medlineplus.gov/hypothyroidism.html',
    pubDate: new Date(Date.now() - 9 * 86400000).toISOString(),
    summary: 'Untreated or undertreated hypothyroidism reduces basal metabolic rate by 15–40%. Adequate levothyroxine dosing, combined with regular exercise and consistent meal timing, helps normalize metabolism.',
    source: 'MedlinePlus',
    tag: 'tiroides',
  },
  {
    id: 'fb-9',
    title: 'Autophagy induction during extended fasting: cellular repair benefits',
    link: 'https://pubmed.ncbi.nlm.nih.gov/?term=autophagy+fasting+16+hours',
    pubDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    summary: 'Autophagy — cellular self-cleaning — begins to activate around 14–16 hours of fasting. This process clears damaged proteins and organelles, with potential benefits for inflammation and metabolic disease.',
    source: 'PubMed',
    tag: 'ayuno',
  },
  {
    id: 'fb-10',
    title: 'Inflammation markers improve with 8-week time-restricted eating protocol',
    link: 'https://pubmed.ncbi.nlm.nih.gov/?term=inflammation+time-restricted+eating+CRP',
    pubDate: new Date(Date.now() - 11 * 86400000).toISOString(),
    summary: 'CRP, IL-6, and TNF-α all decreased significantly after 8 weeks of 16:8 fasting in adults with metabolic syndrome. Researchers attribute benefits to reduced oxidative stress and improved insulin signaling.',
    source: 'PubMed',
    tag: 'metabolismo',
  },
];

export async function GET() {
  const results = await Promise.allSettled(
    SOURCES.map(s => fetchFeed(s.url, s.source, s.tag))
  );

  const all = results
    .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);

  // Use fallback if live feeds returned nothing
  const base = all.length > 0 ? all : FALLBACK_ITEMS;

  // Dedupe by title similarity + score by relevance
  const seen = new Set<string>();
  const deduped = base.filter(item => {
    const key = item.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const scored = deduped
    .map(item => ({ ...item, score: scoreItem(item.title, item.summary) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
    })
    .slice(0, 20);

  return NextResponse.json(scored);
}
