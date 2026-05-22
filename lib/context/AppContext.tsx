'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { AppState, Associate, AwardEvent, ReasonTag, AppSettings } from '../types';
import { INITIAL_STATE, uuid } from '../constants';
import { loadState, saveState } from '../storage';
import { getTier, isTierHigher } from '../utils/tiers';
import { calculateNewStreak, toDateKey, recalculateStreak } from '../utils/dates';

export type { AppState };

export type Action =
  | { type: 'AWARD_POINTS'; associateId: string; points: number; reasonTag: ReasonTag | 'custom'; reason: string; note?: string }
  | { type: 'DEDUCT_POINTS'; associateId: string; points: number; reason: string }
  | { type: 'UNDO_AWARD' }
  | { type: 'CLEAR_LAST_AWARD' }
  | { type: 'START_SHIFT'; challenge?: string }
  | { type: 'END_SHIFT' }
  | { type: 'CROWN_POTD'; associateId: string }
  | { type: 'RESET_DAILY' }
  | { type: 'RESET_SEASON' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'UPDATE_ASSOCIATE'; id: string; updates: Partial<Associate> }
  | { type: 'ADD_ASSOCIATE'; associate: Associate }
  | { type: 'REMOVE_ASSOCIATE'; id: string }
  | { type: 'IMPORT_STATE'; state: AppState }
  | { type: 'CLEAR_PENDING_CELEBRATION' }
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

      const associates = state.associates.map(a => {
        if (a.id !== action.associateId) return a;
        const newSeasonPoints = a.seasonPoints + action.points;
        const newDailyPoints = a.dailyPoints + action.points;
        const newTier = getTier(newSeasonPoints, state.settings.tiers);
        const tierUpgraded = isTierHigher(newTier, a.currentTier);
        const newStreak = calculateNewStreak(a.streak, a.lastPointDate);
        return {
          ...a,
          seasonPoints: newSeasonPoints,
          dailyPoints: newDailyPoints,
          currentTier: newTier,
          tiersUnlocked: tierUpgraded && !a.tiersUnlocked.includes(newTier)
            ? [...a.tiersUnlocked, newTier]
            : a.tiersUnlocked,
          streak: newStreak,
          lastPointDate: today,
          awardHistory: [newEvent, ...a.awardHistory].slice(0, 50),
        };
      });

      // detect tier upgrade for celebration
      const upgraded = associates.find(a => a.id === action.associateId);
      const original = state.associates.find(a => a.id === action.associateId);
      const pendingCelebration =
        upgraded && original && isTierHigher(upgraded.currentTier, original.currentTier)
          ? { associateId: action.associateId, newTier: upgraded.currentTier }
          : state.pendingCelebration;

      return { ...state, associates, pendingCelebration, lastAward: { event: newEvent, associateId: action.associateId } };
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
        return {
          ...a,
          seasonPoints: newSeasonPoints,
          dailyPoints:  newDailyPoints,
          currentTier:  newTier,
          awardHistory: [deductEvent, ...a.awardHistory].slice(0, 50),
        };
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
        return {
          ...a,
          seasonPoints: newSeasonPoints,
          dailyPoints:  newDailyPoints,
          currentTier:  newTier,
          awardHistory: a.awardHistory.filter(e => e.id !== event.id),
        };
      });
      return { ...state, associates, lastAward: null, pendingCelebration: null };
    }

    case 'CLEAR_LAST_AWARD': {
      return { ...state, lastAward: null };
    }

    case 'START_SHIFT': {
      return {
        ...state,
        potdWinner: null,
        shift: {
          ...state.shift,
          id: uuid(),
          active: true,
          startTime: new Date().toISOString(),
          date: toDateKey(new Date()),
          dailyChallenge: action.challenge ?? '',
        },
      };
    }

    case 'END_SHIFT': {
      const allAwards = state.associates.flatMap(a =>
        a.awardHistory.filter(e => e.shiftId === state.shift.id)
      );
      const potdAssoc = state.potdWinner
        ? state.associates.find(a => a.id === state.potdWinner) ?? null
        : null;
      const totalPoints = allAwards.reduce((sum, e) => sum + e.points, 0);
      const duration = state.shift.startTime
        ? Math.floor((Date.now() - new Date(state.shift.startTime).getTime()) / 1000)
        : 0;

      return {
        ...state,
        shift: { ...state.shift, active: false },
        pendingPOTD: false,
        lastEndShiftData: {
          awards: allAwards,
          potdWinnerSnapshot: potdAssoc,
          totalPointsGiven: totalPoints,
          shiftDuration: duration,
          date: state.shift.date,
        },
      };
    }

    case 'CROWN_POTD': {
      const potdPoints = state.settings.pointValues.potd ?? 5;
      const potdEvent: AwardEvent = {
        id: uuid(),
        associateId: action.associateId,
        reason: 'Platform of the Day',
        reasonTag: 'potd',
        points: potdPoints,
        timestamp: new Date().toISOString(),
        shiftId: state.shift.id,
      };
      const today = toDateKey(new Date());
      const associates = state.associates.map(a => {
        if (a.id !== action.associateId) return a;
        const newSeasonPoints = a.seasonPoints + potdPoints;
        const newTier = getTier(newSeasonPoints, state.settings.tiers);
        const tierUpgraded = isTierHigher(newTier, a.currentTier);
        const newStreak = calculateNewStreak(a.streak, a.lastPointDate);
        return {
          ...a,
          potdWins: a.potdWins + 1,
          seasonPoints: newSeasonPoints,
          dailyPoints: a.dailyPoints + potdPoints,
          currentTier: newTier,
          tiersUnlocked: tierUpgraded && !a.tiersUnlocked.includes(newTier)
            ? [...a.tiersUnlocked, newTier]
            : a.tiersUnlocked,
          streak: newStreak,
          lastPointDate: today,
          awardHistory: [potdEvent, ...a.awardHistory].slice(0, 50),
        };
      });
      const upgraded = associates.find(a => a.id === action.associateId);
      const original = state.associates.find(a => a.id === action.associateId);
      const pendingCelebration =
        upgraded && original && isTierHigher(upgraded.currentTier, original.currentTier)
          ? { associateId: action.associateId, newTier: upgraded.currentTier }
          : state.pendingCelebration;
      return { ...state, associates, potdWinner: action.associateId, pendingPOTD: false, pendingCelebration };
    }

    case 'RESET_DAILY': {
      return {
        ...state,
        associates: state.associates.map(a => ({ ...a, dailyPoints: 0 })),
        potdWinner: null,
      };
    }

    case 'RESET_SEASON': {
      return {
        ...state,
        associates: state.associates.map(a => ({
          ...a,
          seasonPoints: 0,
          dailyPoints: 0,
          potdWins: 0,
          streak: 0,
          lastPointDate: null,
          currentTier: 'none',
          tiersUnlocked: [],
          awardHistory: [],
        })),
        potdWinner: null,
        pendingCelebration: null,
        pendingPOTD: false,
        lastEndShiftData: null,
      };
    }

    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.settings } };
    }

    case 'UPDATE_ASSOCIATE': {
      return {
        ...state,
        associates: state.associates.map(a =>
          a.id === action.id ? { ...a, ...action.updates } : a
        ),
      };
    }

    case 'ADD_ASSOCIATE': {
      return { ...state, associates: [...state.associates, action.associate] };
    }

    case 'REMOVE_ASSOCIATE': {
      return {
        ...state,
        associates: state.associates.filter(a => a.id !== action.id),
      };
    }

    case 'IMPORT_STATE': {
      // Recalculate streaks on import (might have been away for days)
      const associates = action.state.associates.map(a => ({
        ...a,
        streak: recalculateStreak(a.streak, a.lastPointDate),
      }));
      return { ...action.state, associates };
    }

    case 'CLEAR_PENDING_CELEBRATION': {
      return { ...state, pendingCelebration: null };
    }

    case 'SET_SHIFT_TARGET': {
      return { ...state, shift: { ...state.shift, target: action.target } };
    }

    case 'SET_DAILY_CHALLENGE': {
      return { ...state, shift: { ...state.shift, dailyChallenge: action.challenge } };
    }

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: 'IMPORT_STATE', state: saved });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
