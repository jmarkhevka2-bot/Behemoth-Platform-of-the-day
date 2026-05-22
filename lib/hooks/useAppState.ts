'use client';

import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Associate } from '../types';

export function useAppState() {
  return useAppContext();
}

export function useSortedLeaderboard(): Associate[] {
  const { state } = useAppContext();
  return useMemo(
    () => [...state.associates].sort((a, b) => b.seasonPoints - a.seasonPoints),
    [state.associates]
  );
}

export function useTopTen(): Associate[] {
  const sorted = useSortedLeaderboard();
  return useMemo(() => sorted.slice(0, 10), [sorted]);
}

export function useAssociateById(id: string | null): Associate | null {
  const { state } = useAppContext();
  return useMemo(
    () => (id ? state.associates.find(a => a.id === id) ?? null : null),
    [state.associates, id]
  );
}

export function useSortedByDailyPoints(): Associate[] {
  const { state } = useAppContext();
  return useMemo(
    () => [...state.associates].sort((a, b) => b.dailyPoints - a.dailyPoints),
    [state.associates]
  );
}
