'use client';

import { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import type { AppState, Associate, AwardEvent, ReasonTag, AppSettings, BadgeKey } from '../types';
import { INITIAL_STATE, uuid } from '../constants';
import { getTier, isTierHigher } from '../utils/tiers';
import { calculateNewStreak, toDateKey, recalculateStreak } from '../utils/dates';
import { checkNewBadges, makeBadgeEntries } from '../utils/badges';
import { fetchStateFromSupabase, syncToSupabase, setupRealtimeSubscription } from '../db';

export type { AppState };

export type Action =
  | { type: 'AWARD_POINTS'; associateId: string; points: number; reasonTag: ReasonTag | 'custom'; reason: string; note?: string }
  | { type: 'DEDUCT_POINTS'; associateId: string; points: number; reason: string }
  | { type: 'UNDO_AWARD' }
  | { type: 'CLEAR_LAST_AWARD' }
  | { type: 'START_SHIFT'; challenge?: string }
  | { type: 'END_SHIFT' }
  | { type: 'CROWN_POTD'; associateId: string }
  | { type: 'CROWN_MULTI_POTD'; associateIds: string[] }
  | { type: 'RESET_DAILY' }
  | { type: 'RESET_SEASON' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'UPDATE_ASSOCIATE'; id: string; updates: Partial<Associate> }
  | { type: 'ADD_ASSOCIATE'; associate: Associate }
  | { type: 'REMOVE_ASSOCIATE'; id: string }
  | { type: 'IMPORT_STATE'; state: AppState }
  | { type: 'CLEAR_PENDING_CELEBRATION' }
  | { type: 'SHIFT_BADGE_UNLOCK' }
  | { type: 'SET_SHIFT_TARGET'; target: string }
  | { type: 'SET_DAILY_CHALLENGE'; challenge: string };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'AWARD_POINTS': {
      const today = toDateKey(new Date());
      const newEvent: AwardEvent = {
        id: uuid(),
        associateId: action.associateId,
        reason: action.reason,
        reasonTag: action.reasonTag,
        points: action.points,
        note: action.note,
        timestamp: new Date().toISOString(),
        shiftId: state.shift.id,
      };

      const prevAssociate = state.associates.find(a => a.id === action.associateId)!;
      const partialAssociates = state.associates.map(a => {
        if (a.id !== action.associateId) return a;
        const newSeasonPoints = a.seasonPoints + action.points;
        const newDailyPoints  = a.dailyPoints  + action.points;
        const newTier    = getTier(newSeasonPoints, state.settings.tiers);
        const tierUpgraded = isTierHigher(newTier, a.currentTier);
        const newStreak  = calculateNewStreak(a.streak, a.lastPointDate);
        return {
          ...a,
          seasonPoints:   newSeasonPoints,
          dailyPoints:    newDailyPoints,
          currentTier:    newTier,
          tiersUnlocked:  tierUpgraded && !a.tiersUnlocked.includes(newTier)
            ? [...a.tiersUnlocked, newTier] : a.tiersUnlocked,
          streak:         newStreak,
          lastPointDate:  today,
          awardHistory:   [newEvent, ...a.awardHistory].slice(0, 50),
        };
      });

      const newAssociate = partialAssociates.find(a => a.id === action.associateId)!;

      // Badge checking
      const newBadgeKeys = checkNewBadges(prevAssociate, newAssociate, state.associates, partialAssociates, state.shift.id, 'award');
      const finalAssociates = newBadgeKeys.length > 0
        ? partialAssociates.map(a =>
            a.id === action.associateId
              ? { ...a, badges: [...a.badges, ...makeBadgeEntries(newBadgeKeys)] }
              : a
          )
        : partialAssociates;

      const upgraded = finalAssociates.find(a => a.id === action.associateId);
      const pendingCelebration = upgraded && isTierHigher(upgraded.currentTier, prevAssociate.currentTier)
        ? { associateId: action.associateId, newTier: upgraded.currentTier }
        : state.pendingCelebration;

      const newBadgeUnlocks = newBadgeKeys.map(badge => ({ associateId: action.associateId, badge }));

      return {
        ...state,
        associates: finalAssociates,
        pendingCelebration,
        lastAward: { event: newEvent, associateId: action.associateId },
        pendingBadgeUnlocks: [...state.pendingBadgeUnlocks, ...newBadgeUnlocks],
      };
    }

    case 'DEDUCT_POINTS': {
      const deductEvent: AwardEvent = {
        id: uuid(),
        associateId: action.associateId,
        reason: action.reason || 'Manual deduction',
        reasonTag: 'custom',
        points: -action.points,
        timestamp: new Date().toISOString(),
        shiftId: state.shift.id,
      };
      const associates = state.associates.map(a => {
        if (a.id !== action.associateId) return a;
        const newSeasonPoints = Math.max(0, a.seasonPoints - action.points);
        const newDailyPoints  = Math.max(0, a.dailyPoints  - action.points);
        const newTier = getTier(newSeasonPoints, state.settings.tiers);
        return { ...a, seasonPoints: newSeasonPoints, dailyPoints: newDailyPoints, currentTier: newTier, awardHistory: [deductEvent, ...a.awardHistory].slice(0, 50) };
      });
      return { ...state, associates };
    }

    case 'UNDO_AWARD': {
      if (!state.lastAward) return state;
      const { event, associateId } = state.lastAward;
      const associates = state.associates.map(a => {
        if (a.id !== associateId) return a;
        const newSeasonPoints = Math.max(0, a.seasonPoints - event.points);
        const newDailyPoints  = Math.max(0, a.dailyPoints  - event.points);
        const newTier = getTier(newSeasonPoints, state.settings.tiers);
        return { ...a, seasonPoints: newSeasonPoints, dailyPoints: newDailyPoints, currentTier: newTier, awardHistory: a.awardHistory.filter(e => e.id !== event.id) };
      });
      return { ...state, associates, lastAward: null, pendingCelebration: null };
    }

    case 'CLEAR_LAST_AWARD':
      return { ...state, lastAward: null };

    case 'SHIFT_BADGE_UNLOCK':
      return { ...state, pendingBadgeUnlocks: state.pendingBadgeUnlocks.slice(1) };

    case 'START_SHIFT':
      return {
        ...state,
        potdWinner: null,
        shift: { ...state.shift, id: uuid(), active: true, startTime: new Date().toISOString(), date: toDateKey(new Date()), dailyChallenge: action.challenge ?? '' },
      };

    case 'END_SHIFT': {
      const allAwards = state.associates.flatMap(a => a.awardHistory.filter(e => e.shiftId === state.shift.id));
      const potdAssoc = state.potdWinner ? (state.associates.find(a => a.id === state.potdWinner) ?? null) : null;
      const totalPoints = allAwards.reduce((s, e) => s + e.points, 0);
      const duration = state.shift.startTime ? Math.floor((Date.now() - new Date(state.shift.startTime).getTime()) / 1000) : 0;
      return {
        ...state,
        shift: { ...state.shift, active: false },
        pendingPOTD: false,
        lastEndShiftData: { awards: allAwards, potdWinnerSnapshot: potdAssoc, totalPointsGiven: totalPoints, shiftDuration: duration, date: state.shift.date },
      };
    }

    case 'CROWN_POTD': {
      const potdPoints = state.settings.pointValues.potd ?? 5;
      const potdEvent: AwardEvent = { id: uuid(), associateId: action.associateId, reason: 'Platform of the Day', reasonTag: 'potd', points: potdPoints, timestamp: new Date().toISOString(), shiftId: state.shift.id };
      const today = toDateKey(new Date());
      const prevAssociate = state.associates.find(a => a.id === action.associateId)!;

      const partialAssociates = state.associates.map(a => {
        if (a.id !== action.associateId) return a;
        const newSeasonPoints = a.seasonPoints + potdPoints;
        const newTier = getTier(newSeasonPoints, state.settings.tiers);
        const tierUpgraded = isTierHigher(newTier, a.currentTier);
        const newStreak = calculateNewStreak(a.streak, a.lastPointDate);
        return {
          ...a, potdWins: a.potdWins + 1, seasonPoints: newSeasonPoints, dailyPoints: a.dailyPoints + potdPoints,
          currentTier: newTier, tiersUnlocked: tierUpgraded && !a.tiersUnlocked.includes(newTier) ? [...a.tiersUnlocked, newTier] : a.tiersUnlocked,
          streak: newStreak, lastPointDate: today, awardHistory: [potdEvent, ...a.awardHistory].slice(0, 50),
        };
      });

      const newAssociate = partialAssociates.find(a => a.id === action.associateId)!;
      const newBadgeKeys = checkNewBadges(prevAssociate, newAssociate, state.associates, partialAssociates, state.shift.id, 'potd');
      const finalAssociates = newBadgeKeys.length > 0
        ? partialAssociates.map(a => a.id === action.associateId ? { ...a, badges: [...a.badges, ...makeBadgeEntries(newBadgeKeys)] } : a)
        : partialAssociates;

      const upgraded = finalAssociates.find(a => a.id === action.associateId);
      const pendingCelebration = upgraded && isTierHigher(upgraded.currentTier, prevAssociate.currentTier)
        ? { associateId: action.associateId, newTier: upgraded.currentTier } : state.pendingCelebration;
      const newBadgeUnlocks = newBadgeKeys.map(badge => ({ associateId: action.associateId, badge }));

      return {
        ...state,
        associates: finalAssociates,
        potdWinner: action.associateId,
        pendingPOTD: false,
        pendingCelebration,
        pendingBadgeUnlocks: [...state.pendingBadgeUnlocks, ...newBadgeUnlocks],
      };
    }

    case 'CROWN_MULTI_POTD': {
      const potdPoints = state.settings.pointValues.potd ?? 5;
      const today = toDateKey(new Date());
      let allNewBadgeUnlocks: Array<{ associateId: string; badge: BadgeKey }> = [];
      let pendingCelebration = state.pendingCelebration;

      const associates = state.associates.map(a => {
        if (!action.associateIds.includes(a.id)) return a;
        const potdEvent: AwardEvent = { id: uuid(), associateId: a.id, reason: 'Platform of the Day', reasonTag: 'potd', points: potdPoints, timestamp: new Date().toISOString(), shiftId: state.shift.id };
        const newSeasonPoints = a.seasonPoints + potdPoints;
        const newTier = getTier(newSeasonPoints, state.settings.tiers);
        const tierUpgraded = isTierHigher(newTier, a.currentTier);
        const newStreak = calculateNewStreak(a.streak, a.lastPointDate);
        return {
          ...a, potdWins: a.potdWins + 1, seasonPoints: newSeasonPoints, dailyPoints: a.dailyPoints + potdPoints,
          currentTier: newTier, tiersUnlocked: tierUpgraded && !a.tiersUnlocked.includes(newTier) ? [...a.tiersUnlocked, newTier] : a.tiersUnlocked,
          streak: newStreak, lastPointDate: today, awardHistory: [potdEvent, ...a.awardHistory].slice(0, 50),
        };
      });

      // Badge checking for each crowned associate
      for (const id of action.associateIds) {
        const prev = state.associates.find(a => a.id === id)!;
        const next = associates.find(a => a.id === id)!;
        const newBadgeKeys = checkNewBadges(prev, next, state.associates, associates, state.shift.id, 'potd');
        if (newBadgeKeys.length > 0) {
          allNewBadgeUnlocks = [...allNewBadgeUnlocks, ...newBadgeKeys.map(badge => ({ associateId: id, badge }))];
        }
        if (isTierHigher(next.currentTier, prev.currentTier)) {
          pendingCelebration = { associateId: id, newTier: next.currentTier };
        }
      }

      // Apply badge entries to associates
      const finalAssociates = allNewBadgeUnlocks.length > 0
        ? associates.map(a => {
            const earned = allNewBadgeUnlocks.filter(u => u.associateId === a.id).map(u => u.badge);
            return earned.length > 0 ? { ...a, badges: [...a.badges, ...makeBadgeEntries(earned)] } : a;
          })
        : associates;

      return {
        ...state,
        associates: finalAssociates,
        potdWinner: action.associateIds[action.associateIds.length - 1] ?? state.potdWinner,
        pendingPOTD: false,
        pendingCelebration,
        pendingBadgeUnlocks: [...state.pendingBadgeUnlocks, ...allNewBadgeUnlocks],
      };
    }

    case 'RESET_DAILY':
      return { ...state, associates: state.associates.map(a => ({ ...a, dailyPoints: 0 })), potdWinner: null };

    case 'RESET_SEASON':
      return {
        ...state,
        associates: state.associates.map(a => ({
          ...a, seasonPoints: 0, dailyPoints: 0, potdWins: 0, streak: 0, lastPointDate: null,
          currentTier: 'none', tiersUnlocked: [], awardHistory: [], badges: [],
        })),
        potdWinner: null, pendingCelebration: null, pendingPOTD: false, lastEndShiftData: null,
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'UPDATE_ASSOCIATE':
      return { ...state, associates: state.associates.map(a => a.id === action.id ? { ...a, ...action.updates } : a) };

    case 'ADD_ASSOCIATE':
      return { ...state, associates: [...state.associates, action.associate] };

    case 'REMOVE_ASSOCIATE':
      return { ...state, associates: state.associates.filter(a => a.id !== action.id) };

    case 'IMPORT_STATE': {
      const associates = action.state.associates.map(a => ({
        ...a,
        streak:  recalculateStreak(a.streak, a.lastPointDate),
        badges:  a.badges ?? [],
      }));
      return { ...action.state, associates, pendingBadgeUnlocks: action.state.pendingBadgeUnlocks ?? [] };
    }

    case 'CLEAR_PENDING_CELEBRATION':
      return { ...state, pendingCelebration: null };

    case 'SET_SHIFT_TARGET':
      return { ...state, shift: { ...state.shift, target: action.target } };

    case 'SET_DAILY_CHALLENGE':
      return { ...state, shift: { ...state.shift, dailyChallenge: action.challenge } };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isLoading: boolean;
  dbError: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]   = useReducer(appReducer, INITIAL_STATE);
  const [hydrated, setHydrated]   = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError]     = useState<string | null>(null);
  const syncedEventIdsRef = useRef<Set<string>>(new Set());
  const syncTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchStateFromSupabase()
      .then(s => {
        if (s) {
          dispatch({ type: 'IMPORT_STATE', state: s });
          for (const a of s.associates)
            for (const ev of a.awardHistory)
              syncedEventIdsRef.current.add(ev.id);
        }
      })
      .catch(e => setDbError(e.message))
      .finally(() => { setIsLoading(false); setHydrated(true); });
    return setupRealtimeSubscription(dispatch);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() =>
      syncToSupabase(state, syncedEventIdsRef).catch(console.error), 500);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [state, hydrated]);

  return (
    <AppContext.Provider value={{ state, dispatch, isLoading, dbError }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
