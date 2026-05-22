export type Tier = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';

export type ReasonTag =
  | 'fast_dispatch'
  | 'spiel_master'
  | 'safety_catch'
  | 'guest_mvp'
  | 'target_hit'
  | 'potd'
  | 'above_beyond';

export interface AwardEvent {
  id: string;
  associateId: string;
  reason: string;
  reasonTag: ReasonTag | 'custom';
  points: number;
  note?: string;
  timestamp: string;
  shiftId: string;
}

export interface Associate {
  id: string;
  lastName: string;
  firstName: string;
  displayName: string;
  emoji: string;
  seasonPoints: number;
  dailyPoints: number;
  potdWins: number;
  streak: number;
  lastPointDate: string | null;
  currentTier: Tier;
  tiersUnlocked: Tier[];
  notes: string;
  awardHistory: AwardEvent[];
}

export interface ShiftState {
  id: string;
  active: boolean;
  startTime: string | null;
  target: string;
  dailyChallenge: string;
  date: string;
}

export interface TierConfig {
  tier: Tier;
  label: string;
  emoji: string;
  threshold: number;
  reward: string;
  color: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  darkMode: boolean;
  dispatchTarget: string;
  pointValues: Record<ReasonTag, number>;
  tiers: TierConfig[];
}

export interface EndShiftData {
  awards: AwardEvent[];
  potdWinnerSnapshot: Associate | null;
  totalPointsGiven: number;
  shiftDuration: number;
  date: string;
}

export interface AppState {
  associates: Associate[];
  shift: ShiftState;
  settings: AppSettings;
  potdWinner: string | null;
  pendingCelebration: { associateId: string; newTier: Tier } | null;
  pendingPOTD: boolean;
  lastEndShiftData: EndShiftData | null;
  lastAward: { event: AwardEvent; associateId: string } | null;
}
