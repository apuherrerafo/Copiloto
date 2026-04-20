import type { LogEntry } from '@/lib/store/db';

export type YesterdayRecap = {
  headline: string;
  lead: string;
  bullets: string[];
  microGoal: string;
};

const GUILT_HINTS = [
  'should not have', "shouldn't have", 'regret', 'guilt', 'mistake', 'impuls',
  'bought', 'could not resist', "couldn't resist", 'should have avoided',
  'sad', 'bad with myself', '[guilt]', '[impulse]',
];

function textBlob(e: LogEntry): string {
  return `${e.label} ${e.notes ?? ''}`.toLowerCase();
}

function hasGuiltTone(entries: LogEntry[]): boolean {
  return entries.some((e) => GUILT_HINTS.some((h) => textBlob(e).includes(h)));
}

function avgMood(entries: LogEntry[]): number | null {
  const moods = entries.filter((e) => e.mood != null).map((e) => e.mood as number);
  if (!moods.length) return null;
  return moods.reduce((a, b) => a + b, 0) / moods.length;
}

function totalWalkMin(entries: LogEntry[]): number {
  return entries
    .filter((e) => e.type === 'walking')
    .reduce((sum, e) => sum + (e.durationMin ?? 10), 0);
}

function hasSymptom(entries: LogEntry[], tag: string): boolean {
  return entries
    .filter((e) => e.type === 'symptom')
    .some(
      (e) =>
        (e.symptomTags ?? []).includes(tag as never) ||
        textBlob(e).includes(tag),
    );
}

/** Empathic + motivational recap with adaptive micro-goal (no LLM). */
export function buildYesterdayRecap(entries: LogEntry[]): YesterdayRecap | null {
  if (!entries.length) return null;

  const meals    = entries.filter((e) => e.type === 'meal');
  const meds     = entries.filter((e) => e.type === 'medication');
  const notes    = entries.filter((e) => e.type === 'note');
  const symptoms = entries.filter((e) => e.type === 'symptom');
  const walks    = entries.filter((e) => e.type === 'walking');
  const guilt    = hasGuiltTone(entries);
  const moodAvg  = avgMood(entries);
  const lowMood  = moodAvg != null && moodAvg < 2.6;
  const walkMin  = totalWalkMin(entries);
  const hadFatigue = hasSymptom(entries, 'fatigue');
  const hadFog     = hasSymptom(entries, 'brain_fog');

  const bullets: string[] = [];

  if (meals.length === 1) {
    bullets.push(
      `You logged one meal: "${meals[0].label.slice(0, 42)}${meals[0].label.length > 42 ? '…' : ''}".`,
    );
  } else if (meals.length > 1) {
    bullets.push(`You logged ${meals.length} meals — that is real traceability.`);
  }

  if (meds.length) {
    bullets.push('You logged your medication: consistent dosing drives better long-term serum T4.');
  }

  if (walks.length > 0) {
    if (walkMin >= 20) {
      bullets.push(
        `You walked ~${walkMin} min — that activates muscle GLUT4 and reduces post-meal glucose spikes. Keep it up.`,
      );
    } else {
      bullets.push(`You logged ${walks.length} walk(s) (~${walkMin} min). Every step helps glucose control.`);
    }
  } else {
    bullets.push('Movement: no walks logged yesterday. Today aim for 10 min post-lunch — the highest-impact one.');
  }

  if (symptoms.length) {
    const tags = symptoms.flatMap((e) => e.symptomTags ?? []);
    const uniqueTags = [...new Set(tags)];
    const tagStr = uniqueTags.length
      ? uniqueTags.slice(0, 3).join(', ')
      : symptoms[0].label.slice(0, 30);
    bullets.push(
      `You noted symptoms: ${tagStr}. If they repeat for 3+ days, bring them to your next visit with your HypoCopilot log.`,
    );
  }

  if (notes.length || entries.some((e) => (e.notes ?? '').length > 10)) {
    bullets.push('You left context in your notes: a log with notes is much more useful to spot trends.');
  }

  let headline = 'Yesterday is on record';
  let lead =
    'Every day is a new line in your protocol. Change just one thing today and your metabolic curve shifts.';

  if (guilt || lowMood) {
    headline = 'Yesterday was hard — and that is okay';
    lead =
      'A slip does not erase your protocol. Physiologically, one meal outside your window does not cancel your T4 or your adherence. What matters: pill on time today, 12–20 window, one walk. That already wins.';
  } else if (moodAvg != null && moodAvg >= 3.5 && walks.length > 0) {
    headline = 'Yesterday was a good metabolic day';
    lead =
      'Positive mood + movement logged: that combo supports peripheral T4→T3 conversion and lowers baseline cortisol. Keep the rhythm today.';
  } else if (moodAvg != null && moodAvg >= 3.5) {
    headline = 'Yesterday felt better than you think';
    lead =
      'Your log shows a steadier mood. Keep the rhythm: 12–20 window, pill with its buffer, and a light walk post-lunch.';
  }

  let microGoal =
    'Today: one small decision at a time. If in doubt, open the chat with context.';

  if (hadFatigue && walks.length === 0) {
    microGoal =
      'Micro-goal: 5 min of gentle stretches post-lunch. Hypothyroid fatigue improves with soft movement, not full rest.';
  } else if (hadFog) {
    microGoal =
      'Micro-goal: hydration (8 glasses today) and a 10 min walk post-lunch. Brain fog lifts with cerebral perfusion and stable glucose.';
  } else if (walks.length === 0 && meals.length > 0) {
    microGoal =
      'Micro-goal: a 10 min walk after lunch today. No fancy shoes, no extra planning.';
  } else if (walkMin < 15 && walks.length > 0) {
    microGoal =
      'Micro-goal: take the post-dinner walk to 15 min today. Just 5 more minutes than yesterday.';
  } else if (guilt) {
    microGoal =
      'Micro-goal: one meal aligned with your window today is enough to get back on rhythm. No compensation, no extra restriction.';
  } else if (moodAvg != null && moodAvg >= 4) {
    microGoal =
      'You are in a good rhythm. Today: keep the pill on time and celebrate each habit done — positive reinforcement locks in the protocol.';
  }

  if (!bullets.length) {
    bullets.push(`You logged ${entries.length} event(s): logging is the most "pro" habit.`);
  }

  bullets.push('Open the chat if you want a scientific explanation of anything from yesterday — HypoCopilot has the context.');

  return { headline, lead, bullets: bullets.slice(0, 5), microGoal };
}
