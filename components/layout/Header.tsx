'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '@/lib/hooks/useAppState';
import { useTheme } from '@/lib/hooks/useTheme';
import { formatNextTransition } from '@/lib/utils/shiftSchedule';
import ShiftTimer from '@/components/ui/ShiftTimer';

interface Props {
  onCrownPOTD: () => void;
  isAdmin:     boolean;
}

export default function Header({ onCrownPOTD, isAdmin }: Props) {
  const { state, dispatch } = useAppState();
  const { shift, settings } = state;
  const { theme, toggleTheme } = useTheme();
  const hasPOTD     = !!state.potdWinner;
  const [nextTime, setNextTime] = useState('');

  // Keep "next shift" time current without a full re-render on every tick
  useEffect(() => {
    function update() { setNextTime(formatNextTransition(shift.active, settings.shiftOverride)); }
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [shift.active, settings.shiftOverride]);

  // Look up rival names for header display
  const rival1 = state.dailyRival ? state.associates.find(a => a.id === state.dailyRival!.id1) : null;
  const rival2 = state.dailyRival ? state.associates.find(a => a.id === state.dailyRival!.id2) : null;

  return (
    <>
      {/* Crew viewer banner */}
      {!isAdmin && (
        <div className="w-full bg-[var(--accent-gold)] text-white text-[11px] font-body text-center py-1 tracking-widest select-none">
          👀 Viewer Mode — Behemoth Crew
        </div>
      )}

      <header className="bg-[var(--bg-card)] border-b border-[var(--border)]">
        <div className="flex items-center gap-3 px-4 py-2.5">

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
            {shift.active && shift.startTime ? (
              <>
                <ShiftTimer startTime={shift.startTime} />
                <span className="text-[var(--border)] text-xs hidden sm:block">·</span>
                <span className="text-xs font-body text-[var(--text-muted)] hidden sm:block truncate">
                  {shift.target || settings.dispatchTarget}
                </span>
                {/* Rivalry indicator */}
                {rival1 && rival2 && (
                  <>
                    <span className="text-[var(--border)] text-xs hidden md:block">·</span>
                    <span className="hidden md:flex items-center gap-1 text-xs font-body text-[var(--text-muted)]">
                      <span>{rival1.emoji}</span>
                      <span className="text-[var(--text-hint)]">⚔️</span>
                      <span>{rival2.emoji}</span>
                      <span className="text-[var(--text-hint)] hidden lg:block">{rival1.displayName} vs {rival2.displayName}</span>
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-xs text-[var(--text-muted)] font-body">
                🌙 Next shift {nextTime}
              </span>
            )}
          </div>

          {/* Right controls */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors text-base"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Sound toggle */}
            <button
              onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { soundEnabled: !settings.soundEnabled } })}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors text-base"
              aria-label={settings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              title={settings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {settings.soundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Crown POTD — admin + shift active only */}
            {isAdmin && shift.active && (
              <button
                onClick={hasPOTD ? undefined : onCrownPOTD}
                disabled={hasPOTD}
                className={`
                  px-3 py-1.5 text-xs font-heading rounded-lg transition-colors border
                  ${hasPOTD
                    ? 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-hint)] cursor-default'
                    : 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-white hover:opacity-90'}
                `}
                aria-label={hasPOTD ? 'Platform of the Day already crowned' : 'Crown Platform of the Day'}
                title={hasPOTD ? 'POTD already crowned' : 'Crown Platform of the Day'}
              >
                {hasPOTD ? '👑 Crowned' : '👑 CROWN POTD'}
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
