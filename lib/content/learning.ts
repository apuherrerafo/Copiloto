/**
 * Short, evidence-flavored learning snippets for the Fast ring carousel.
 * Kept under ~90 chars each so they fit comfortably inside the circle.
 */
export type LearningPhrase = {
  category: 'thyroid' | 'biohack' | 'fasting' | 'nutrition';
  tip: string;
};

export const LEARNING_PHRASES: LearningPhrase[] = [
  { category: 'thyroid', tip: 'Levothyroxine absorbs best on an empty stomach, 30–60 min before food.' },
  { category: 'thyroid', tip: 'Calcium and iron block thyroid hormone — space them 4 hours apart.' },
  { category: 'thyroid', tip: 'Selenium (2 Brazil nuts) helps convert inactive T4 into active T3.' },
  { category: 'thyroid', tip: 'Coffee cuts levothyroxine absorption by up to 30%. Wait one hour.' },
  { category: 'thyroid', tip: 'Chronic stress raises cortisol, which blunts T4 → T3 conversion.' },
  { category: 'thyroid', tip: 'Cold hands or dry skin can signal subclinical hypothyroidism.' },
  { category: 'thyroid', tip: 'Zinc, iron and iodine are the three nutrients your thyroid cannot skip.' },
  { category: 'thyroid', tip: 'Test free T3 and T4, not just TSH — TSH alone hides many cases.' },
  { category: 'thyroid', tip: 'TSH peaks overnight — bad sleep can flatten that rhythm and skew how you feel.' },
  { category: 'thyroid', tip: 'Selenium helps deiodinases; stay under ~400 mcg/day — more is not better.' },

  { category: 'fasting', tip: 'At 12h of fasting, insulin drops and fat becomes your main fuel.' },
  { category: 'fasting', tip: 'Autophagy ramps up after ~16h — cells recycle damaged parts.' },
  { category: 'fasting', tip: 'Breaking a fast with protein stabilizes blood sugar better than carbs.' },
  { category: 'fasting', tip: 'Your ring stays calm during the eating window — the overnight fast clock starts after last meal.' },
  { category: 'fasting', tip: 'Sliding dinner by 1–2 h once in a while is fine; avoid “window hopping” every day or sleep and cortisol suffer.' },
  { category: 'fasting', tip: 'If you break the window early, log it and reset mentally — consistency beats perfection for thyroid stress.' },
  { category: 'fasting', tip: 'A 10–15 min walk post-meal can reduce glucose spikes by 12–18%.' },
  { category: 'fasting', tip: 'Hydration during a fast prevents most “hunger” signals — it is thirst.' },
  { category: 'fasting', tip: 'Electrolytes (sodium, potassium) keep your energy steady while fasting.' },
  { category: 'fasting', tip: 'Fasting beyond 18h without adapting can spike cortisol in women.' },
  { category: 'fasting', tip: 'Strict IF can feel worse if TSH is high — fix the dose before chasing extremes.' },

  { category: 'biohack', tip: '10 min of morning sunlight anchors your circadian rhythm.' },
  { category: 'biohack', tip: 'Cold showers (30s) raise norepinephrine ~200% for hours of focus.' },
  { category: 'biohack', tip: 'Nasal breathing boosts nitric oxide — better oxygen uptake.' },
  { category: 'biohack', tip: 'Zone 2 cardio (can-still-talk pace) builds mitochondria over time.' },
  { category: 'biohack', tip: 'Room at 18–19°C (65–67°F) deepens your REM and growth hormone pulses.' },
  { category: 'biohack', tip: 'No screens 60 min before bed — blue light suppresses melatonin.' },
  { category: 'biohack', tip: 'Heart rate variability (HRV) is your best daily recovery signal.' },
  { category: 'biohack', tip: 'Grounding 10 min on bare earth lowers inflammation markers.' },
  { category: 'biohack', tip: 'Slow breathing ~6 breaths/min for 10 min can lower stress drive — free tool.' },
  { category: 'biohack', tip: 'Ice-cold plunges: skip if your thyroid is unstable or your heart says no.' },

  { category: 'nutrition', tip: '30 g of protein at breakfast curbs cravings for the whole day.' },
  { category: 'nutrition', tip: 'Fiber feeds gut bacteria that help recycle thyroid hormone.' },
  { category: 'nutrition', tip: 'Omega-3s lower TPO antibodies in Hashimoto’s patients.' },
  { category: 'nutrition', tip: 'Vitamin D below 30 ng/mL correlates with worse thyroid outcomes.' },
  { category: 'nutrition', tip: 'Fermented foods (kefir, kimchi) boost gut diversity and T3 conversion.' },
  { category: 'nutrition', tip: 'Added sugars spike insulin and inflame the thyroid axis.' },
  { category: 'nutrition', tip: 'Magnesium glycinate at night lowers cortisol and improves sleep.' },
  { category: 'nutrition', tip: 'Extra iodine from kelp can flare Hashimoto in iodine-sufficient countries.' },
];

export function pickLearningPhrase(index: number): LearningPhrase {
  const safe = ((index % LEARNING_PHRASES.length) + LEARNING_PHRASES.length) % LEARNING_PHRASES.length;
  return LEARNING_PHRASES[safe];
}

export const CATEGORY_LABEL: Record<LearningPhrase['category'], string> = {
  thyroid: 'Thyroid',
  biohack: 'Biohack',
  fasting: 'Fasting',
  nutrition: 'Nutrition',
};
