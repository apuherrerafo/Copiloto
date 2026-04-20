/** Copy for “tap ring / metric for more” in History compliance UI (English). */
export const COMPLIANCE_RING_HELP: Record<
  string,
  { title: string; body: string; how: string }
> = {
  pill: {
    title: 'Medication',
    body: 'Shows how often you ticked your levothyroxine dose in the day plan for days in this range.',
    how: 'Counted once per day: checked = 1, not checked = 0. The arc is the average across eligible days (past days in the month or last 7 days).',
  },
  walks: {
    title: 'Walks',
    body: 'Reflects movement after lunch and dinner as logged in your day plan.',
    how: 'For each day we average lunch walk + dinner walk (each either done or not). That daily score is averaged over the selected range.',
  },
  breakFast: {
    title: 'Break fast',
    body: 'Tracks whether you logged breaking your fast in a way that matches your protocol window.',
    how: 'One checkmark per day in the day plan for “break fast” counts toward this score.',
  },
  lastMeal: {
    title: 'Last meal',
    body: 'Shows how consistently you confirmed last meal timing against your protocol.',
    how: 'One checkmark per day in the day plan for “last meal” counts toward this score.',
  },
};
