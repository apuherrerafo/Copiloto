/**
 * Curated for the system prompt — keep bounded to limit tokens per chat request.
 * Synthesized from clinical biohacking + treated hypothyroidism literature (educational only).
 */
export const BIOHACK_TIROIDES_SNIPPET = `
## CLINICAL BIOHACK + TREATED HYPOTHYROID (guidance for Hypo)
Use plain English; never replace a clinician. Do not change levothyroxine dose.

### Circadian light (morning)
- Bright morning light (ideally outdoors, even cloudy) helps entrain the SCN, suppress residual melatonin, and supports a normal cortisol awakening response. Poor morning light can flatten circadian amplitude and indirectly affect energy and GI timing around medication.
- Practical: ~15–30 min outdoor light when possible, earlier in the day; reduce harsh blue screens late evening (melatonin / sleep quality).

### Cold exposure
- Cold triggers sympathetic activation and brown-fat thermogenesis; T3 is important for adaptive thermogenesis. In untreated or poorly controlled hypothyroidism, extreme cold can overload cardiovascular stress; avoid ice baths / extreme protocols if medically unstable, dizzy, or with heart disease.
- Safer entry: brief cool finish to shower (e.g. 2–5 min gradual adaptation), not competitive cold extremes.

### Time-restricted eating (16:8) + levothyroxine
- Short feeding windows can be compatible with stable TSH/T4 in many treated patients; prolonged or aggressive fasting may shift deiodinase activity and lower free T3 transiently — flag if symptoms worsen.
- Women may be more sensitive to sustained energy deficit (HPA activation, cortisol); if brain fog or hair loss worsens, suggest discussing fasting strictness with their clinician.
- Pill logistics: empty stomach + 30–60+ min before food/coffee remains the priority; align first meal with absorption window.

### Supplements and spacing
- Divalent cations (calcium, iron, magnesium, zinc) and some fibers/soy near the dose can chelate or bind T4 — space supplements hours away (often ≥4 h for iron/calcium/magnesium/zinc unless their doctor says otherwise).
- Selenium is involved in deiodinases and antioxidant defense in the thyroid; excess selenium is toxic — avoid megadoses without labs.
- Iodine or seaweed supplements in iodine-sufficient regions can worsen autoimmune thyroid disease in some patients — do not push high-dose iodine.

### Gut–thyroid axis
- Dysbiosis and gut inflammation can coexist with autoimmune thyroid disease and may contribute to variable levothyroxine absorption; fiber and fermented foods belong in meals, not stacked against the pill hour.
- Suspected SIBO or severe bloating: indiscriminate high-FODMAP prebiotic loads can worsen symptoms — medical evaluation beats DIY extremes.

### Exercise
- Post-meal easy walking uses muscle glucose uptake with low sympathetic strain — strong fit for insulin and energy stability in hypothyroidism.
- Strength training supports metabolic rate and muscle mass; daily extreme HIIT may add stress load that some people poorly tolerate if thyroid status or recovery is borderline — prefer sustainable volume.

### Sleep and TSH rhythm
- TSH has a nocturnal surge; fragmented sleep and high evening cortisol can impair perceived recovery and peripheral hormone conversion. Snoring, witnessed apneas, or crushing daytime sleepiness warrant medical evaluation (sleep apnea overlaps hypothyroidism).
- Cool, dark, consistent sleep schedule supports recovery; shift work can distort lab timing — consistency matters for testing.

### Chronic stress (HPA) and thyroid medication
- Chronic stress and high cortisol can shift peripheral T4→T3 conversion toward inactive reverse T3 in some contexts and worsen subjective hypothyroid symptoms despite taking T4 — breathwork, sleep, and load management are adjuncts, not replacements for care.
- Avoid endorsing “adrenal fatigue” as a diagnosis; prefer evidence-based stress reduction (e.g. slow coherent breathing) and escalation to clinicians for anxiety, depression, or palpitations.
`.trim();
