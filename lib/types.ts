export type Tier = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';

export type ReasonTag =
  | 'fast_dispatch'
  | 'spiel_master'
  | 'safety_catch'
  | 'guest_mvp'
  | 'target_hit'
  | 'potd'
  | 'above_beyond';

export type BadgeKey =
  | 'first_blood'
  | 'on_fire'
  | 'hat_trick'
  | 'eagle_eye'
  | 'supersonic'
  | 'crowd_control'
  | 'untouchable'
  | 'born_legend'
  | 'day_one'
  | 'full_send'
  | 'team_player'
  | 'summit'
  | 'bullseye'
  | 'rival'
  | 'rising_star';

export interface BadgeEntry {
  key:         BadgeKey;
  unlockedAt:  string;
}

export interface AwardEvent {
  id:         string;
  associateId: string;
  reason:     string;
  reasonTag:  ReasonTag | 'custom';
  points:     number;
  note?:      string;
  timestamp:  string;
  shiftId:    string;
}

export interface Associate {
  id:            string;
  lastName:      string;
  firstName:     string;
  displayName:   string;
  emoji:         string;
  seasonPoints:  number;
  dailyPoints:   number;
  potdWins:      number;
  streak:        number;
  lastPointDate: string | null;
  currentTier:   Tier;
  tiersUnlocked: Tier[];
  notes:         string;
  awardHistory:  AwardEvent[];
  badges:        BadgeEntry[];
}

export interface ShiftState {
  id:             string;
  active:         boolean;
  startTime:      string | null;
  target:         string;
  dailyChallenge: string;
  date:           string;
}

export interface TierConfig {
  tier:      Tier;
  label:     string;
  emoji:     string;
  threshold: number;
  reward:    string;
  color:     string;
}

export interface ShiftOverride {
  date:    string; // YYYY-MM-DD — only applies on this exact date
  startHH: number;
  startMM: number;
  endHH:   number;
  endMM:   number;
}

export interface AppSettings {
  soundEnabled:    boolean;
  darkMode:        boolean;
  dispatchTarget:  string;
  pointValues:     Record<ReasonTag, number>;
  tiers:           TierConfig[];
  shiftOverride:   ShiftOverride | null;
}

export interface RivalResult {
  id1:      string;
  id2:      string;
  name1:    string;
  name2:    string;
  emoji1:   string;
  emoji2:   string;
  pts1:     number; // daily points earned this shift
  pts2:     number;
  winnerId: string | null; // null = tied
  tied:     boolean;
}

export interface EndShiftData {
  awards:             AwardEvent[];
  potdWinnerSnapshot: Associate | null;
  totalPointsGiven:   number;
  shiftDuration:      number;
  date:               string;
  rivalResult:        RivalResult | null;
}

export interface AppState {
  associates:          Associate[];
  shift:               ShiftState;
  settings:            AppSettings;
  potdWinner:          string | null;
  dailyRival:          { id1: string; id2: string } | null;
  pendingCelebration:  { associateId: string; newTier: Tier } | null;
  pendingPOTD:         boolean;
  lastEndShiftData:    EndShiftData | null;
  lastAward:           { event: AwardEvent; associateId: string } | null;
  pendingBadgeUnlocks: Array<{ associateId: string; badge: BadgeKey }>;
}
