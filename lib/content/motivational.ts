/**
 * Rotating motivational messages for the home header.
 * Grouped by time of day and picked by date+index combo so they change
 * through the day without repeating too often.
 */

type Slot = 'morning' | 'afternoon' | 'evening';

const MESSAGES: Record<Slot, string[]> = {
  morning: [
    'The day starts with you. 🌱',
    'Water, sunlight, consistency — that is all. ☀️',
    'Your pill at 11. Until then, water only.',
    'Every morning you log is data you gain. 📊',
    'A well-rested body = a happy thyroid.',
    'Another day to stay consistent.',
    'The fast is still working for you.',
    'One day at a time. That is what works.',
    'Your protocol is simple. Consistency is the secret.',
    'Breakfast at 12. For now, keep going. 💪',
    'Morning light is already resyncing your inner clock.',
    '5 minutes of sunlight before 11. Free and powerful.',
  ],
  afternoon: [
    'Did you walk after eating yet? 🚶',
    'Eating window open until 8 pm. Use it well.',
    'A 10-min walk right now counts a lot.',
    'Half the day done. How is the protocol going?',
    'Your glucose will thank you if you walk now.',
    'Productive afternoon = calm night.',
    'Your body processes food better when you move after meals.',
    'Took your pill this morning? Well done. 🙌',
    'Light movement after lunch keeps glucose steadier this afternoon.',
    'A glass of water now breaks nothing. Quite the opposite.',
    'Today’s consistency is tomorrow’s energy.',
    'Hydration + movement + window. The triad.',
  ],
  evening: [
    'Close the kitchen at 8 pm and earn 16h. 🌙',
    'Fast on. Your body starts cleaning up.',
    'Good night — the rhythm continues tomorrow.',
    'Sleep turns T4 into T3. Rest well.',
    'Today’s consistency matters more than perfection.',
    'Dinner done. Only water and rest now.',
    'A clean fast is like rebooting the system. 🔄',
    'Your microbiome works at night. Feed it plant fiber.',
    'Walk after dinner? Just 10 min. Worth it. 🚶',
    'Tomorrow is another day to stay consistent.',
    'Your body repairs while you sleep. Sleep well.',
    'May your rest be as good as your protocol.',
  ],
};

function getSlot(hour: number): Slot {
  if (hour < 12) return 'morning';
  if (hour < 20) return 'afternoon';
  return 'evening';
}

function getDayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export function getMotivationalMessage(now = new Date()): string {
  const slot = getSlot(now.getHours());
  const pool = MESSAGES[slot];
  const idx = (getDayOfYear(now) * 3 + Math.floor(now.getMinutes() / 20)) % pool.length;
  return pool[idx]!;
}
