import type { Associate, AppSettings, AppState, TierConfig } from './types';

export const uuid = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const EMOJI_POOL = [
  '🦁', '🐯', '🦊', '🐺', '🦅', '🦋', '🌟', '⚡', '🔥', '🎯',
  '🏔️', '🌊', '🎭', '🎪', '🌈', '💎', '🦄', '🐉', '🎸', '🚀',
  '🌺', '🦉', '🐬', '⚔️', '🌙', '☄️', '🎆', '🏆', '🧊', '🌋',
  '🎠', '🦚', '💫', '🐋', '🔱', '🌠', '🗡️', '🎡', '🐲', '🌪️',
];

const ROSTER: Array<{ lastName: string; firstName: string }> = [
  { lastName: 'Adeyemi', firstName: 'Aaliyah' },
  { lastName: 'Alleyne Vlietstra', firstName: 'Sienna' },
  { lastName: 'Anushri', firstName: 'Anu' },
  { lastName: 'Appiah', firstName: 'Justin' },
  { lastName: 'Bashir', firstName: 'Maria' },
  { lastName: 'Beckford', firstName: 'Janaye' },
  { lastName: 'Chahal', firstName: 'Navraj' },
  { lastName: 'Chandrasekaran', firstName: 'Mithun' },
  { lastName: 'Chauhan', firstName: 'Shiv' },
  { lastName: 'Costales', firstName: 'Jayse' },
  { lastName: 'Davis', firstName: 'Anayah' },
  { lastName: 'De Oliveira', firstName: 'Dylan' },
  { lastName: 'Eli', firstName: 'Irene' },
  { lastName: 'Hatzinikolaou', firstName: 'Patricia' },
  { lastName: 'Hinds', firstName: 'Tiana' },
  { lastName: 'Ibrahim', firstName: 'Murtaza' },
  { lastName: 'Kamalia', firstName: 'Sarah' },
  { lastName: 'Kaur', firstName: 'Sehajpreet' },
  { lastName: 'Kirupathasan', firstName: 'Thasvini' },
  { lastName: 'Naqvi', firstName: 'Rida' },
  { lastName: 'Olokude', firstName: 'Isaiah' },
  { lastName: 'Patel', firstName: 'Hrim' },
  { lastName: 'Patel', firstName: 'Om' },
  { lastName: 'Persaud', firstName: 'Chelsee' },
  { lastName: 'Phillip', firstName: 'Jeanvan' },
  { lastName: 'Robinson', firstName: 'Aiden' },
  { lastName: 'Sadjadi', firstName: 'Mahdi' },
  { lastName: 'Sanni', firstName: 'Lana' },
  { lastName: 'Sehgal', firstName: 'Aryan' },
  { lastName: 'Sidhu', firstName: 'Mantejan' },
  { lastName: 'Sinclair', firstName: 'Jada' },
  { lastName: 'Sonawala', firstName: 'Bhargav' },
  { lastName: 'Stefanov', firstName: 'Geoffrey' },
  { lastName: 'Syed', firstName: 'Manaal' },
  { lastName: 'Taylor', firstName: 'Tyson' },
  { lastName: 'Thileepan', firstName: 'Pirabasha' },
  { lastName: 'Unterman', firstName: 'Adam' },
  { lastName: 'Verginom', firstName: 'Claire' },
  { lastName: 'Virdi', firstName: 'Rubaina' },
  { lastName: 'Vohra', firstName: 'Dhruvish' },
];

export const INITIAL_ASSOCIATES: Associate[] = ROSTER.map((r, i) => ({
  id: `assoc-${i + 1}`,
  lastName: r.lastName,
  firstName: r.firstName,
  displayName: r.firstName,
  emoji: EMOJI_POOL[i],
  seasonPoints: 0,
  dailyPoints: 0,
  potdWins: 0,
  streak: 0,
  lastPointDate: null,
  currentTier: 'none',
  tiersUnlocked: [],
  notes: '',
  awardHistory: [],
}));

export const DEFAULT_TIER_CONFIGS: TierConfig[] = [
  { tier: 'bronze',  label: 'Bronze Operator',  emoji: '🥉', threshold: 25,  reward: '$10 Gift Card',                                                                    color: '#CD7F32' },
  { tier: 'silver',  label: 'Silver Operator',  emoji: '🥈', threshold: 75,  reward: 'Choose any 2 positions for a full day of your choice',                            color: '#C0C0C0' },
  { tier: 'gold',    label: 'Gold Operator',    emoji: '🥇', threshold: 150, reward: 'Choose your own platform for 1 full hour',                                         color: '#FFD700' },
  { tier: 'diamond', label: 'Diamond Operator', emoji: '💎', threshold: 300, reward: 'Full shift break scheduling priority — pick your own break times for an entire shift + personal shoutout to team board', color: '#B9F2FF' },
  { tier: 'legend',  label: 'Behemoth Legend',  emoji: '👑', threshold: 500, reward: 'End-of-season recognition, permanent name on the Behemoth Legend board, formal shoutout to area management, and a custom reward chosen by Team Lead', color: '#9B59B6' },
];

export const DEFAULT_POINT_VALUES: Record<string, number> = {
  fast_dispatch: 1,
  spiel_master:  2,
  safety_catch:  3,
  guest_mvp:     2,
  target_hit:    2,
  potd:          5,
  above_beyond:  3,
};

export const REASON_TAG_META: Record<string, { label: string; emoji: string; description: string }> = {
  fast_dispatch: { emoji: '🚀', label: 'Fast Dispatch',        description: 'Speedy, clean dispatch' },
  spiel_master:  { emoji: '🎙️', label: 'Spiel Master',         description: 'Outstanding guest announcement' },
  safety_catch:  { emoji: '👀', label: 'Safety Catch',         description: 'Identified a safety concern' },
  guest_mvp:     { emoji: '💪', label: 'Guest MVP',            description: 'Exceptional guest interaction' },
  target_hit:    { emoji: '⚡', label: 'Target Hit',           description: 'Hit the 33 cycles/hr target' },
  potd:          { emoji: '🏆', label: 'Platform of the Day',  description: 'POTD award' },
  above_beyond:  { emoji: '✨', label: 'Above & Beyond',       description: 'Went the extra mile' },
};

export const MOTIVATIONAL_QUOTES = [
  'Dispatch is an art. Master it.',
  'Record dispatch: 2:47. Beat it.',
  'Every clean cycle is a personal best.',
  'Safety first. Dispatch second. Everything else doesn\'t exist.',
  'You don\'t rise to your motivation — you fall to your standards.',
  'The fastest dispatch starts before the train stops.',
  'Check twice. Dispatch once. No exceptions.',
  'Your platform, your standard.',
  'The platform doesn\'t run itself. You do.',
  'Consistency beats intensity every time.',
  'A focused crew is an unbreakable crew.',
  'The guest\'s last memory of this ride starts with you.',
  'Every dispatch is a vote for the kind of operator you are.',
  'Slow is smooth. Smooth is fast.',
  'Communicate everything. Assume nothing.',
  'The best shifts are the ones where nobody notices — because everything ran perfectly.',
  'One platform. One standard. No compromises.',
  'You set the pace. Own it.',
  'Pride in craft is invisible to everyone except the crew.',
  'Train stops. Restraints check. Dispatch. Repeat. Excellence.',
  'The cycle count doesn\'t lie.',
  'When in doubt, work it out — before the train rolls.',
  'A good spiel is the difference between a ride and a memory.',
  'Leave this platform better than you found it.',
];

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  darkMode: true,
  dispatchTarget: '33 cycles/hr 🚀',
  pointValues: DEFAULT_POINT_VALUES as AppSettings['pointValues'],
  tiers: DEFAULT_TIER_CONFIGS,
};

export const INITIAL_SHIFT = {
  id: '',
  active: false,
  startTime: null,
  target: '33 cycles/hr 🚀',
  dailyChallenge: '',
  date: '',
};

export const INITIAL_STATE: AppState = {
  associates: INITIAL_ASSOCIATES,
  shift: INITIAL_SHIFT,
  settings: DEFAULT_SETTINGS,
  potdWinner: null,
  pendingCelebration: null,
  pendingPOTD: false,
  lastEndShiftData: null,
  lastAward: null,
};
