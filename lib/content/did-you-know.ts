import { APP_NAME } from '@/lib/brand';

export type DidYouKnowTopic = 'thyroid' | 'biohack' | 'movement' | 'fasting' | 'pharma' | 'gut';

export type EvidenceLevel = 'meta-analysis' | 'clinical-trial' | 'expert-consensus' | 'physiology';

export type DidYouKnowItem = {
  fact: string;
  topic: DidYouKnowTopic;
  hint?: string;
  evidence?: EvidenceLevel;
};

/**
 * Curated micro-lessons — friendly "Did you know?" tone plus practical biohacking,
 * tied to hypothyroidism and levothyroxine.
 * DISCLAIMER: educational; does not replace endocrinology evaluation.
 */
export const DID_YOU_KNOW: DidYouKnowItem[] = [
  {
    topic: 'pharma',
    fact: 'Did you know there is a mineral your body needs to "convert" your thyroid pill into real energy? It is selenium, and you get it from 2–3 Brazil nuts a day. More is not better — too much is toxic.',
    hint: 'Selenium and T4→T3 conversion · Deiodinases',
    evidence: 'physiology',
  },
  {
    topic: 'thyroid',
    fact: 'Did you know many people with hypothyroidism sleep poorly because they lack magnesium? This mineral relaxes muscles, lowers nighttime cortisol and improves deep sleep. Sources: spinach, pumpkin seeds, 85% dark chocolate.',
    hint: 'Magnesium, sleep and the thyroid axis',
    evidence: 'expert-consensus',
  },
  {
    topic: 'movement',
    fact: 'Did you know walking 10 minutes after a meal lets your muscles absorb sugar almost without insulin? With hypothyroidism your metabolism already runs slower — this walk is the cheapest biohack out there.',
    hint: 'Post-meal movement and glucose',
    evidence: 'clinical-trial',
  },
  {
    topic: 'pharma',
    fact: 'Did you know that if you take biotin (vitamin B7, hair and nail supplements) and then get blood drawn, your TSH result can come back false? For a reliable test, stop it 2–3 days before.',
    hint: 'Biotin interference in TSH assays · AACE 2019',
    evidence: 'expert-consensus',
  },
  {
    topic: 'thyroid',
    fact: 'Did you know zinc not only helps make thyroid hormone, it also teaches your cells to "listen" to it? Without enough zinc, even with normal TSH your body responds poorly. Sources: red meat, pumpkin seeds, seafood.',
    hint: 'Zinc and thyroid hormone receptors',
    evidence: 'physiology',
  },
  {
    topic: 'thyroid',
    fact: 'Did you know your TSH is not the same in the morning and the afternoon? It rises at dawn and drops mid-afternoon. That is why blood work should always be fasting and first thing — so the number is real.',
    hint: 'TSH circadian rhythm',
    evidence: 'clinical-trial',
  },
  {
    topic: 'thyroid',
    fact: 'Did you know you can have "normal" TSH and still feel tired because you are low on iron? Iron is the fuel your thyroid needs to make hormone. Ask your doctor to check ferritin too (not just serum iron).',
    hint: 'Ferritin and thyroid hormone synthesis',
    evidence: 'expert-consensus',
  },
  {
    topic: 'gut',
    fact: 'Did you know part of active thyroid hormone is produced in your gut, not the gland? Good gut bacteria help with that conversion. That is why a well-done intermittent fast and plant fiber are allies in hypothyroidism.',
    hint: 'Microbiome and intestinal T4→T3 conversion',
    evidence: 'physiology',
  },
  {
    topic: 'thyroid',
    fact: 'Did you know hypothyroidism can make you feel colder than everyone else, especially hands and feet? Not weird — your resting metabolism just runs slower. It is a body signal, not a flaw.',
    hint: 'Thermoregulation and hypothyroidism',
    evidence: 'physiology',
  },
  {
    topic: 'movement',
    fact: 'Did you know sitting for more than 6 hours straight reduces your body’s ability to use thyroid hormone, even on the right dose? A short active break every hour already makes a difference — even standing 2 minutes counts.',
    hint: 'Sedentary time and thyroid hormone resistance',
    evidence: 'expert-consensus',
  },
  {
    topic: 'pharma',
    fact: 'Did you know sudden changes in dietary fiber can change how much of your pill you absorb? You do not have to remove fiber — just be consistent: a big-salad day vs. almost-no-salad day absorbs different amounts of levothyroxine.',
    hint: 'Fiber and levothyroxine absorption',
    evidence: 'expert-consensus',
  },
  {
    topic: 'biohack',
    fact: 'Did you know chronic stress can "block" the effects of your thyroid pill? When cortisol is high, your body converts active hormone into a useless version. Managing stress is part of treatment.',
    hint: 'Cortisol → reverse T3 · type 3 deiodinase',
    evidence: 'physiology',
  },
  {
    topic: 'thyroid',
    fact: 'Did you know low vitamin D is very common in autoimmune hypothyroidism? And you can fix it for free: 10–15 minutes of sun on arms and face between 10 am and 2 pm is often worth more than expensive supplements.',
    hint: 'Vitamin D and thyroid autoimmunity',
    evidence: 'meta-analysis',
  },
  {
    topic: 'pharma',
    fact: 'Did you know soy (soy milk, tofu, edamame) can reduce how much pill you absorb if eaten too close to the dose? You do not have to drop it — just wait at least 3 hours after taking levothyroxine.',
    hint: 'Soy isoflavones · T4 absorption',
    evidence: 'clinical-trial',
  },
  {
    topic: 'pharma',
    fact: 'Did you know how you take the pill matters as much as when? A big glass of water (200 ml) helps it dissolve and reach the intestine fast. A small sip can leave it stuck and lower absorption. Small detail, max effect.',
    hint: 'Oral dissolution of levothyroxine · ATA guidelines',
    evidence: 'expert-consensus',
  },
  {
    topic: 'pharma',
    fact: 'Did you know H. pylori (the gastritis bacterium) can make you need a higher levothyroxine dose? It lowers stomach acid and the pill dissolves poorly. If months go by on a high dose without improvement, rule it out with your doctor.',
    hint: 'H. pylori and T4 malabsorption',
    evidence: 'clinical-trial',
  },
  {
    topic: 'fasting',
    fact: 'Did you know black coffee (no milk, no sugar) does not break your metabolic fast? But adding milk, sugar or cream triggers insulin and blunts the fasting benefits that start after 14–16 h without food.',
    hint: 'Autophagy and intermittent fasting',
    evidence: 'physiology',
  },
  {
    topic: 'thyroid',
    fact: 'Did you know alcohol damages thyroid gland cells directly? Long term it can reduce active thyroid tissue, meaning you need more pill for the same effect. There is no documented "safe" dose for hypothyroidism.',
    hint: 'Alcohol and thyroid function',
    evidence: 'expert-consensus',
  },
  {
    topic: 'pharma',
    fact: 'Did you know if you live with "hard water" (tap water with lots of calcium) and take the pill with it inconsistently, absorption can swing? Always taking it with filtered or low-calcium mineral water is the most stable option.',
    hint: 'Hard water, calcium and T4 absorption',
    evidence: 'physiology',
  },
  {
    topic: 'pharma',
    fact: 'Did you know switching levothyroxine brands can make you feel different even on the "same dose"? Each brand has different fillers that affect absorption speed. If you switch, ask for a TSH check one month later — do not wait for the yearly visit.',
    hint: 'Bioequivalence across levothyroxine brands · ATA 2014',
    evidence: 'expert-consensus',
  },
  /* ──── BIOHACK + LONGEVITY ──── */
  {
    topic: 'biohack',
    fact: 'Did you know cold activates brown fat — the tissue that literally burns calories to make heat? A 30–90 s cold finish to your shower can activate it. In hypothyroidism, where metabolism runs slow, this is one of the most direct tools.',
    hint: 'Brown fat thermogenesis',
    evidence: 'clinical-trial',
  },
  {
    topic: 'biohack',
    fact: 'Did you know sunlight in your eyes (no glasses, no window) within 30 minutes of waking is the strongest circadian reset there is? It regulates morning cortisol, improves night sleep and stabilizes the thyroid axis. Free, 5–10 min a day.',
    hint: 'Light exposure and circadian rhythm · Huberman Lab',
    evidence: 'clinical-trial',
  },
  {
    topic: 'biohack',
    fact: 'Did you know a 16 h fast activates autophagy? Your body "cleans" damaged cells and faulty mitochondria. In hypothyroidism, better mitochondria = more energy — without changing the dose.',
    hint: 'Autophagy and hypothyroidism · Nobel Yoshinori Ohsumi 2016',
    evidence: 'physiology',
  },
  {
    topic: 'biohack',
    fact: 'Did you know mouth-breathing during sleep (instead of nasal) drops blood oxygen and worsens night recovery? In hypothyroidism, where sleep is already lighter, gentle mouth-tape at night deepens it.',
    hint: 'Nasal breathing and sleep quality · Breath, James Nestor',
    evidence: 'expert-consensus',
  },
  {
    topic: 'biohack',
    fact: 'Did you know creatine is not just for athletes? 3–5 g/day improves cellular energy (ATP), cognition and reduces chronic fatigue — a classic hypothyroidism symptom. Cheap, well-studied and safe.',
    hint: 'Creatine and mitochondrial function · ISSN 2023 meta-analysis',
    evidence: 'meta-analysis',
  },
  {
    topic: 'biohack',
    fact: 'Did you know around 80% of people with hypothyroidism have leaky gut? Tight junctions open and let protein fragments reach the bloodstream, priming autoimmunity. Collagen, zinc and L-glutamine help repair them.',
    hint: 'Leaky gut and thyroid autoimmunity',
    evidence: 'physiology',
  },
  {
    topic: 'biohack',
    fact: 'Did you know strength training (weights, bands) raises cellular sensitivity to thyroid hormone? Muscles become better T3 "receivers". 2–3 strength sessions a week can make you feel better without changing levothyroxine.',
    hint: 'Strength training and T3 receptors',
    evidence: 'clinical-trial',
  },
  {
    topic: 'biohack',
    fact: 'Did you know oxidative stress is higher in hypothyroidism and that colored vegetables fight it directly? Red (tomato, pepper), orange (carrot, mango), green (broccoli, spinach): each color is a different antioxidant group. Goal: 5 colors a day.',
    hint: 'Oxidative stress and hypothyroidism',
    evidence: 'expert-consensus',
  },
  {
    topic: 'biohack',
    fact: 'Did you know sleeping less than 7h for 3 nights drops active T3 almost like lowering your dose? Sleep is when your liver converts T4 to T3 best. No pill or supplement beats consistent sleep.',
    hint: 'Sleep and hepatic T4→T3 conversion',
    evidence: 'clinical-trial',
  },
  {
    topic: 'thyroid',
    fact: 'Did you know TSH is an average of weeks, not hours? If you get your blood drawn stressed, after travel, or sleep-deprived, TSH can shift without your thyroid changing. Always test under similar conditions: same time, rested, fasting.',
    hint: 'TSH variability and testing conditions',
    evidence: 'expert-consensus',
  },
];

const TOPIC_LABEL: Record<DidYouKnowTopic, string> = {
  thyroid: 'Thyroid',
  biohack: 'Biohack',
  movement: 'Movement',
  fasting: 'Fasting',
  pharma: 'Pharmacology',
  gut: 'Microbiome',
};

const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  'meta-analysis': '🔬 Meta-analysis',
  'clinical-trial': '🧪 Clinical trial',
  'expert-consensus': '📋 Expert consensus',
  physiology: '🔭 Physiology',
};

export function getTopicLabel(t: DidYouKnowTopic): string {
  return TOPIC_LABEL[t] ?? t;
}

export function getEvidenceLabel(e?: EvidenceLevel): string {
  return e ? EVIDENCE_LABEL[e] ?? e : '';
}

/** Stable index by local day (rotates content daily). */
export function pickDidYouKnowIndex(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return dayOfYear % DID_YOU_KNOW.length;
}

export function getTodayDidYouKnow(): DidYouKnowItem {
  return DID_YOU_KNOW[pickDidYouKnowIndex()]!;
}

export function didYouKnowFooter(): string {
  return `${APP_NAME} — educational content; does not replace your endocrinologist or change your dose.`;
}
