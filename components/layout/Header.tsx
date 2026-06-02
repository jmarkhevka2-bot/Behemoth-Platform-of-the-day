'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import { useTheme } from '@/lib/hooks/useTheme';
import ShiftTimer from '@/components/ui/ShiftTimer';
import QuoteBanner from '@/components/ui/QuoteBanner';

interface Props {
  onEndShift: () => void;
  onCrownPOTD: () => void;
  isAdmin: boolean;
}

export default function Header({ onEndShift, onCrownPOTD, isAdmin }: Props) {
  const { state, dispatch } = useAppState();
  const { shift, settings } = state;
  const { theme, toggleTheme } = useTheme();
  const [showStartModal, setShowStartModal] = useState(false);
  const [challenge, setChallenge] = useState('');
  const hasPOTD = !!state.potdWinner;

  function handleStartShift() {
    dispatch({ type: 'START_SHIFT', challenge });
    setChallenge('');
    setShowStartModal(false);
  }

  function handleToggleSound() {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { soundEnabled: !settings.soundEnabled } });
  }

  return (
    <>
      {/* Crew viewer banner */}
      {!isAdmin && (
        <div className="w-full bg-[var(--accent-gold)] text-white text-[11px] font-body text-center py-1 tracking-widest select-none">
          👀 Viewer Mode — Behemoth Crew
        </div>
      )}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border)] px-4 py-2.5">
        <div className="flex items-center gap-3 max-w-screen-xl mx-auto">

          {/* Brand */}
          <div className="flex-shrink-0 flex items-center gap-2.5">
            <span className="text-xl leading-none select-none">🎢</span>
            <div className="leading-none">
              <p className="font-heading text-[var(--accent-gold)] text-base leading-tight tracking-widest">BEHEMOTH</p>
              <p className="text-[10px] text-[var(--text-muted)] font-body leading-tight mt-0.5">Platform of the Day</p>
            </div>
          </div>

          <div className="w-px h-8 bg-[var(--border)] flex-shrink-0" />

          {/* Center — shift status */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {shift.active && shift.startTime ? (
                <ShiftTimer startTime={shift.startTime} />
              ) : (
                <span className="text-xs text-[var(--text-muted)] font-body">No active shift</span>
              )}
              <span className="text-[var(--border)] text-xs hidden sm:block">·</span>
              <span className="text-xs font-body text-[var(--text-muted)] hidden sm:block truncate">
                {shift.target || settings.dispatchTarget}
              </span>
            </div>
            {shift.active && shift.dailyChallenge && (
              <span className="hidden md:block text-xs text-[var(--accent-blue)] font-body truncate">
                📋 {shift.dailyChallenge}
              </span>
            )}
            <div className="hidden lg:block flex-1 min-w-0">
              <QuoteBanner />
            </div>
          </div>

          {/* Right controls */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors text-base"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Sound toggle */}
            <button
              onClick={handleToggleSound}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors text-base"
              title={settings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {settings.soundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Admin-only: Crown POTD */}
            {isAdmin && shift.active && (
              <button
                onClick={hasPOTD ? undefined : onCrownPOTD}
                className={`
                  px-3 py-1.5 text-xs font-heading rounded-lg transition-colors border
                  ${hasPOTD
                    ? 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-hint)] cursor-default'
                    : 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-white hover:opacity-90'}
                `}
                title={hasPOTD ? 'POTD already crowned this shift' : 'Crown Platform of the Day'}
              >
                {hasPOTD ? '👑 Crowned' : '👑 CROWN POTD'}
              </button>
            )}

            {/* Admin-only: Start/End shift */}
            {isAdmin && (
              shift.active ? (
                <button onClick={onEndShift}
                  className="px-3 py-1.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-xs font-heading rounded-lg transition-colors">
                  END SHIFT
                </button>
              ) : (
                <button onClick={() => setShowStartModal(true)}
                  className="px-3 py-1.5 bg-[#1C1917] hover:bg-[#2C2420] text-white text-xs font-heading rounded-lg transition-colors">
                  START SHIFT
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Start Shift Modal */}
      <AnimatePresence>
        {showStartModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowStartModal(false); }}>
            <motion.div initial={{ scale: 0.96, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h2 className="font-heading text-[var(--text-primary)] text-xl mb-1">START SHIFT</h2>
              <p className="text-xs text-[var(--text-muted)] font-body mb-5">
                Target: <span className="text-[var(--text-secondary)]">{settings.dispatchTarget}</span>
              </p>
              <div className="mb-5">
                <label className="text-xs text-[var(--text-secondary)] font-body mb-1.5 block">Daily Challenge (optional)</label>
                <input type="text" value={challenge} onChange={e => setChallenge(e.target.value)}
                  placeholder="e.g. Perfect 100% safety checks"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] font-body outline-none focus:border-[var(--accent-gold)]/50 placeholder:text-[var(--text-hint)] transition-colors"
                  onKeyDown={e => { if (e.key === 'Enter') handleStartShift(); }} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowStartModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-body hover:bg-[var(--bg-secondary)] transition-colors">
                  Cancel
                </button>
                <button onClick={handleStartShift}
                  className="flex-1 py-2.5 rounded-xl bg-[#1C1917] text-white font-heading text-sm hover:bg-[#2C2420] transition-colors">
                  START
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
