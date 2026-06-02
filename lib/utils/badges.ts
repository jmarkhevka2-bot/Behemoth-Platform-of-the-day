import type { Associate, BadgeKey, BadgeEntry } from '../types';

export interface BadgeMeta {
  emoji: string;
  name: string;
  flavour: string;
}

export const BADGE_META: Record<BadgeKey, BadgeMeta> = {
  first_blood:  { emoji: '🩸', name: 'First Blood',   flavour: 'First POTD winner of the season' },
  on_fire:      { emoji: '🔥', name: 'On Fire',        flavour: '5-day points streak achieved' },
  hat_trick:    { emoji: '🎩', name: 'Hat Trick',      flavour: 'Three POTD crowns. Unstoppable.' },
  eagle_eye:    { emoji: '👀', name: 'Eagle Eye',      flavour: '3 safety catches in a single shift' },
  supersonic:   { emoji: '⚡', name: 'Supersonic',     flavour: '5 fast dispatches in one shift' },
  crowd_control:{ emoji: '🎙️', name: 'Crowd Control',  flavour: 'Spiel legend — 5 total masterclass spiels' },
  untouchable:  { emoji: '💎', name: 'Untouchable',    flavour: 'Diamond tier — the elite 1%' },
  born_legend:  { emoji: '👑', name: 'Born Legend',    flavour: 'Behemoth Legend status achieved' },
  day_one:      { emoji: '🌅', name: 'Day One',        flavour: 'There from the very first shift' },
  full_send:    { emoji: '🚀', name: 'Full Send',      flavour: '10+ points earned in a single shift' },
  team_player:  { emoji: '🤝', name: 'Team Player',    flavour: '3 Guest MVP awards in one shift' },
  summit:       { emoji: '🏔️', name: 'Summit',         flavour: 'Stood at #1 on the leaderboard' },
  bullseye:     { emoji: '🎯', name: 'Bullseye',       flavour: '3 Above & Beyond calls in one shift' },
  rival:        { emoji: '⚔️', name: 'Rival',          flavour: 'Overtook someone on the leaderboard' },
  rising_star:  { emoji: '🌟', name: 'Rising Star',    flavour: 'Consistent — points in 3+ different shifts' },
};

/** Returns badge keys that are newly earned for this associate (not already held). */
export function checkNewBadges(
  prevAssociate: Associate,
  newAssociate: Associate,
  allPrevAssociates: Associate[],
  allNewAssociates: Associate[],
  shiftId: string,
  eventType: 'award' | 'potd',
): BadgeKey[] {
  const alreadyHas = new Set(newAssociate.badges.map(b => b.key));
  const earned: BadgeKey[] = [];

  function earn(key: BadgeKey, condition: boolean) {
    if (condition && !alreadyHas.has(key)) earned.push(key);
  }

  const shiftHistory  = newAssociate.awardHistory.filter(e => e.shiftId === shiftId && e.points > 0);
  const countShift    = (tag: string) => shiftHistory.filter(e => e.reasonTag === tag).length;
  const countAllTime  = (tag: string) => newAssociate.awardHistory.filter(e => e.reasonTag === tag && e.points > 0).length;
  const distinctShifts = new Set(newAssociate.awardHistory.filter(e => e.points > 0).map(e => e.shiftId)).size;

  // 🔥 On Fire — 5-day streak
  earn('on_fire', newAssociate.streak >= 5);

  // 👀 Eagle Eye — safety_catch ×3 in one shift
  earn('eagle_eye', countShift('safety_catch') >= 3);

  // ⚡ Supersonic — fast_dispatch ×5 in one shift
  earn('supersonic', countShift('fast_dispatch') >= 5);

  // 🎙️ Crowd Control — spiel_master ×5 all-time
  earn('crowd_control', countAllTime('spiel_master') >= 5);

  // 💎 Untouchable — Diamond tier
  earn('untouchable', newAssociate.currentTier === 'diamond');

  // 👑 Born Legend — Legend tier
  earn('born_legend', newAssociate.currentTier === 'legend');

  // 🌅 Day One — first ever points (season debut)
  earn('day_one', prevAssociate.seasonPoints === 0 && newAssociate.seasonPoints > 0);

  // 🚀 Full Send — 10+ daily points
  earn('full_send', newAssociate.dailyPoints >= 10);

  // 🤝 Team Player — guest_mvp ×3 in one shift
  earn('team_player', countShift('guest_mvp') >= 3);

  // 🎯 Bullseye — above_beyond ×3 in one shift
  earn('bullseye', countShift('above_beyond') >= 3);

  // 🏔️ Summit — #1 on leaderboard
  const isFirst = allNewAssociates.every(
    a => a.id === newAssociate.id || a.seasonPoints <= newAssociate.seasonPoints
  );
  earn('summit', isFirst);

  // ⚔️ Rival — overtook someone
  const prevRank = allPrevAssociates.filter(a => a.seasonPoints > prevAssociate.seasonPoints).length;
  const newRank  = allNewAssociates.filter(a => a.id !== newAssociate.id && a.seasonPoints > newAssociate.seasonPoints).length;
  earn('rival', newRank < prevRank && prevRank > 0);

  // 🌟 Rising Star — points in 3+ distinct shifts
  earn('rising_star', distinctShifts >= 3);

  // POTD-specific badges
  if (eventType === 'potd') {
    // 🩸 First Blood — first POTD of the season
    const wasFirstEver = allPrevAssociates.every(a => a.potdWins === 0);
    earn('first_blood', wasFirstEver && newAssociate.potdWins >= 1);

    // 🎩 Hat Trick — 3 POTD wins
    earn('hat_trick', newAssociate.potdWins >= 3);
  }

  return earned;
}

/** Converts a list of new badge keys into BadgeEntry objects with current timestamp. */
export function makeBadgeEntries(keys: BadgeKey[]): BadgeEntry[] {
  const now = new Date().toISOString();
  return keys.map(key => ({ key, unlockedAt: now }));
}
