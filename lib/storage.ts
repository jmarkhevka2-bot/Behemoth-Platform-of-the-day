import type { AppState } from './types';

const STORAGE_KEY = 'behemoth-potd-v1';
const STORAGE_VERSION = 1;

interface StorageEnvelope {
  version: number;
  state: AppState;
  savedAt: string;
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const envelope: StorageEnvelope = JSON.parse(raw);
    if (envelope.version !== STORAGE_VERSION) return null;
    return envelope.state;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    const envelope: StorageEnvelope = {
      version: STORAGE_VERSION,
      state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
