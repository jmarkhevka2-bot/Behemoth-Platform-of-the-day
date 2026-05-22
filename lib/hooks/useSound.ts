'use client';

import { useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

function getAudioContext(ref: React.MutableRefObject<AudioContext | null>): AudioContext | null {
  try {
    if (!ref.current) ref.current = new AudioContext();
    if (ref.current.state === 'suspended') ref.current.resume();
    return ref.current;
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'triangle',
  gainPeak = 0.3,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const { state } = useAppContext();

  const playAward = useCallback(() => {
    if (!state.settings.soundEnabled) return;
    const ctx = getAudioContext(ctxRef);
    if (!ctx) return;
    const t = ctx.currentTime;
    playTone(ctx, 440, t, 0.12, 'triangle', 0.25);
    playTone(ctx, 660, t + 0.1, 0.2, 'triangle', 0.25);
  }, [state.settings.soundEnabled]);

  const playTierUnlock = useCallback(() => {
    if (!state.settings.soundEnabled) return;
    const ctx = getAudioContext(ctxRef);
    if (!ctx) return;
    const t = ctx.currentTime;
    // C4 E4 G4 C5 chord sequence
    [262, 330, 392, 523].forEach((freq, i) => {
      playTone(ctx, freq, t + i * 0.08, 0.6 - i * 0.05, 'sine', 0.2);
    });
  }, [state.settings.soundEnabled]);

  const playPOTD = useCallback(() => {
    if (!state.settings.soundEnabled) return;
    const ctx = getAudioContext(ctxRef);
    if (!ctx) return;
    const t = ctx.currentTime;
    // Fanfare: ascending sequence + sustained note
    const notes = [392, 523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playTone(ctx, freq, t + i * 0.15, i === notes.length - 1 ? 0.8 : 0.18, 'sine', 0.3);
    });
  }, [state.settings.soundEnabled]);

  const playConfirm = useCallback(() => {
    if (!state.settings.soundEnabled) return;
    const ctx = getAudioContext(ctxRef);
    if (!ctx) return;
    const t = ctx.currentTime;
    playTone(ctx, 880, t, 0.08, 'sine', 0.15);
  }, [state.settings.soundEnabled]);

  return { playAward, playTierUnlock, playPOTD, playConfirm };
}
