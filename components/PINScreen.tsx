'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onSuccess: (role: 'admin' | 'crew') => void;
}

export default function PINScreen({ onSuccess }: Props) {
  const [digits, setDigits]               = useState<string[]>([]);
  const [error, setError]                 = useState<string | null>(null);
  const [shake, setShake]                 = useState(false);
  const [lockedSeconds, setLockedSeconds] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const digitsRef = useRef<string[]>([]);
  digitsRef.current = digits;

  useEffect(() => {
    if (!lockedSeconds || lockedSeconds <= 0) return;
    const t = setTimeout(() => setLockedSeconds(s => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [lockedSeconds]);

  async function submitPIN(pin: string) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res  = await fetch('/api/verify-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
      const data = await res.json() as { locked: true; seconds: number } | { success: true; role: 'admin' | 'crew' } | { success: false };
      if ('locked' in data && data.locked) { setLockedSeconds(data.seconds); setDigits([]); setIsSubmitting(false); return; }
      if ('success' in data && data.success) { onSuccess(data.role); return; }
      setShake(true); setError('Access Denied');
      setTimeout(() => { setShake(false); setError(null); setDigits([]); setIsSubmitting(false); }, 1000);
    } catch {
      setError('Network error — try again'); setDigits([]); setIsSubmitting(false);
    }
  }

  function pressDigit(d: string) {
    if (lockedSeconds || isSubmitting) return;
    setDigits(prev => {
      if (prev.length >= 4) return prev;
      const next = [...prev, d];
      if (next.length === 4) submitPIN(next.join(''));
      return next;
    });
  }
  function pressBackspace() { if (!isSubmitting) setDigits(prev => prev.slice(0, -1)); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= '0' && e.key <= '9') pressDigit(e.key);
      else if (e.key === 'Backspace') pressBackspace();
      else if (e.key === 'Enter' && digitsRef.current.length === 4) submitPIN(digitsRef.current.join(''));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, lockedSeconds]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] select-none">
      {/* Branding */}
      <div className="mb-10 text-center">
        <p className="text-5xl mb-3">🎢</p>
        <p className="font-heading text-[var(--accent-gold)] text-2xl tracking-[0.35em]">BEHEMOTH</p>
        <p className="text-[var(--text-hint)] text-xs font-body mt-1 tracking-[0.2em]">PLATFORM OF THE DAY</p>
      </div>

      {/* PIN dots */}
      <motion.div animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}} transition={{ duration: 0.35 }}
        className="flex gap-4 mb-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
            i < digits.length ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] scale-110' : 'bg-transparent border-[var(--border)]'
          }`} />
        ))}
      </motion.div>

      {/* Status */}
      <div className="h-6 mb-6 text-center">
        <AnimatePresence mode="wait">
          {lockedSeconds && lockedSeconds > 0 ? (
            <motion.p key="locked" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 font-body">Too many attempts. Try again in {lockedSeconds}s</motion.p>
          ) : error ? (
            <motion.p key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 font-body">{error}</motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <button key={d} onClick={() => pressDigit(d)}
            className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] active:scale-95
              text-[var(--text-primary)] font-heading text-xl transition-all border border-[var(--border)]">
            {d}
          </button>
        ))}
        <div />
        <button onClick={() => pressDigit('0')}
          className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] active:scale-95
            text-[var(--text-primary)] font-heading text-xl transition-all border border-[var(--border)]">
          0
        </button>
        <button onClick={pressBackspace}
          className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] active:scale-95
            text-[var(--accent-gold)] font-heading text-xl transition-all border border-[var(--border)]">
          ⌫
        </button>
      </div>
    </div>
  );
}
