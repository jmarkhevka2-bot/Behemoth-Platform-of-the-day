'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
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
        <div className="w-full bg-[#B08C1E] text-white text-[11px] font-body text-center py-1 tracking-widest select-none">
          👀 Viewer Mode — Behemoth Crew
        </div>
      )}
      <header className="bg-white border-b border-[#DDD9D2] px-4 py-2.5">
        <div className="flex items-center gap-3 max-w-screen-xl mx-auto">

          {/* Brand */}
          <div className="flex-shrink-0 flex items-center gap-2.5">
            <span className="text-xl leading-none select-none">🎢</span>
            <div className="leading-none">
              <p className="font-heading text-[#B08C1E] text-base leading-tight tracking-widest">BEHEMOTH</p>
              <p className="text-[10px] text-[#A8A29E] font-body leading-tight mt-0.5">Platform of the Day</p>
            </div>
          </div>

          <div className="w-px h-8 bg-[#DDD9D2] flex-shrink-0" />

          {/* Center — shift status */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {shift.active && shift.startTime ? (
                <ShiftTimer startTime={shift.startTime} />
              ) : (
                <span className="text-xs text-[#A8A29E] font-body">No active shift</span>
              )}
              <span className="text-[#DDD9D2] text-xs hidden sm:block">·</span>
              <span className="text-xs font-body text-[#A8A29E] hidden sm:block truncate">
                {shift.target || settings.dispatchTarget}
              </span>
            </div>

            {shift.active && shift.dailyChallenge && (
              <span className="hidden md:block text-xs text-[#3B78B8] font-body truncate">
                📋 {shift.dailyChallenge}
              </span>
            )}

            <div className="hidden lg:block flex-1 min-w-0">
              <QuoteBanner />
            </div>
          </div>

          {/* Right controls */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A8A29E] hover:text-[#6B6560] hover:bg-[#F5F3EE] transition-colors text-base"
              title={settings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {settings.soundEnabled ? '🔊' : '🔇'}
            </button>

            {isAdmin && shift.active && (
              <button
                onClick={hasPOTD ? undefined : onCrownPOTD}
                className={`
                  px-3 py-1.5 text-xs font-heading rounded-lg transition-colors border
                  ${hasPOTD
                    ? 'bg-[#F5F3EE] border-[#DDD9D2] text-[#C4BEB8] cursor-default'
                    : 'bg-[#B08C1E] border-[#B08C1E] text-white hover:bg-[#9A7A18]'}
                `}
                title={hasPOTD ? 'POTD already crowned this shift' : 'Crown Platform of the Day'}
              >
                {hasPOTD ? '👑 Crowned' : '👑 CROWN POTD'}
              </button>
            )}

            {isAdmin && (
              shift.active ? (
                <button
                  onClick={onEndShift}
                  className="px-3 py-1.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-xs font-heading rounded-lg transition-colors"
                >
                  END SHIFT
                </button>
              ) : (
                <button
                  onClick={() => setShowStartModal(true)}
                  className="px-3 py-1.5 bg-[#1C1917] hover:bg-[#2C2420] text-white text-xs font-heading rounded-lg transition-colors"
                >
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowStartModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="bg-white border border-[#DDD9D2] rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <h2 className="font-heading text-[#1C1917] text-xl mb-1">START SHIFT</h2>
              <p className="text-xs text-[#A8A29E] font-body mb-5">
                Target: <span className="text-[#6B6560]">{settings.dispatchTarget}</span>
              </p>

              <div className="mb-5">
                <label className="text-xs text-[#6B6560] font-body mb-1.5 block">Daily Challenge (optional)</label>
                <input
                  type="text"
                  value={challenge}
                  onChange={e => setChallenge(e.target.value)}
                  placeholder="e.g. Perfect 100% safety checks"
                  className="w-full bg-[#F5F3EE] border border-[#DDD9D2] rounded-xl px-3 py-2.5 text-sm text-[#1C1917] font-body outline-none focus:border-[#B08C1E]/50 placeholder:text-[#C4BEB8] transition-colors"
                  onKeyDown={e => { if (e.key === 'Enter') handleStartShift(); }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStartModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDD9D2] text-[#6B6560] text-sm font-body hover:bg-[#F5F3EE] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartShift}
                  className="flex-1 py-2.5 rounded-xl bg-[#1C1917] text-white font-heading text-sm hover:bg-[#2C2420] transition-colors"
                >
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
