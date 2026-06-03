import type { Associate } from '../types';

/** Returns the two associates with the closest season points. */
export function calculateDailyRival(associates: Associate[]): { id1: string; id2: string } | null {
  if (associates.length < 2) return null;

  const eligible = associates.filter(a => a.seasonPoints > 0);
  const pool     = eligible.length >= 2 ? eligible : associates;

  const sorted = [...pool].sort((a, b) => b.seasonPoints - a.seasonPoints);

  let minDiff = Infinity;
  let best    = { id1: sorted[0].id, id2: sorted[1].id };

  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = sorted[i].seasonPoints - sorted[i + 1].seasonPoints;
    if (diff < minDiff) {
      minDiff = diff;
      best    = { id1: sorted[i].id, id2: sorted[i + 1].id };
    }
  }

  return best;
}
