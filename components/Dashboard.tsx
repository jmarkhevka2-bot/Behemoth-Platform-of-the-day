'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import { shouldShiftBeActive, getTodayET } from '@/lib/utils/shiftSchedule';
import { calculateDailyRival } from '@/lib/utils/rivals';

import Header from './layout/Header';
import Navigation from './layout/Navigation';
import type { ViewKey } from './layout/Navigation';
import ShiftStartBanner from './layout/ShiftStartBanner';

import Leaderboard from './views/Leaderboard';
import CrewGrid from './views/CrewGrid';
import HallOfFame from './views/HallOfFame';
import Settings from './views/Settings';
import Info from './views/Info';

import AwardPanel from './modals/AwardPanel';
import BulkAwardPanel from './modals/BulkAwardPanel';
import AssociateProfile from './modals/AssociateProfile';
import TierCelebration from './modals/TierCelebration';
import POTDCeremony from './modals/POTDCeremony';
import EndShiftSummary from './modals/EndShiftSummary';
import BadgeUnlockToast from './ui/BadgeUnlockToast';

interface Props {
  isAdmin: boolean;
}

export default function Dashboard({ isAdmin }: Props) {
  const { state, dispatch } = useAppState();
  const stateRef   = useRef(state);
  stateRef.current = state;
  const dispatchRef   = useRef(dispatch);
  dispatchRef.current = dispatch;

  const [activeView, setActiveView]       = useState<ViewKey>('leaderboard');
  const [profileId, setProfileId]         = useState<string | null>(null);
  const [awardTargetId, setAwardTargetId] = useState<string | null>(null);
  const [bulkTargetIds, setBulkTargetIds] = useState<string[] | null>(null);
  const [showEndShift, setShowEndShift]   = useState(false);
  const [showPOTD, setShowPOTD]           = useState(false);
  const [showStartBanner, setShowStartBanner] = useState(false);

  // ── Auto shift scheduler (30-second tick) ─────────────────────────────────
  useEffect(() => {
    function check() {
      const s = stateRef.current;
      const d = dispatchRef.current;
      const active  = shouldShiftBeActive(s.settings.shiftOverride);
      const today   = getTodayET();

      if (active && (s.shift.date !== today || !s.shift.active)) {
        // Shift should start
        const rival = calculateDailyRival(s.associates);
        d({ type: 'AUTO_START_SHIFT', date: today, rival });
        if (isAdmin) setShowStartBanner(true);
      } else if (!active && s.shift.active) {
        // Shift should end
        d({ type: 'AUTO_END_SHIFT' });
        if (isAdmin) setShowEndShift(true);
      }
    }

    check(); // Immediate check on mount
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Undo toast ─────────────────────────────────────────────────────────────
  const [undoToast, setUndoToast] = useState<{ name: string; points: number } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!state.lastAward) { setUndoToast(null); return; }
    const assoc = state.associates.find(a => a.id === state.lastAward!.associateId);
    if (assoc) {
      setUndoToast({ name: assoc.displayName, points: state.lastAward.event.points });
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => dispatch({ type: 'CLEAR_LAST_AWARD' }), 8000);
    }
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); };
  }, [state.lastAward, state.associates, dispatch]);

  function handleUndo() {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    dispatch({ type: 'UNDO_AWARD' });
  }

  // ── Badge unlock toast ─────────────────────────────────────────────────────
  const badgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentBadge  = state.pendingBadgeUnlocks[0] ?? null;
  useEffect(() => {
    if (!currentBadge) return;
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => dispatch({ type: 'SHIFT_BADGE_UNLOCK' }), 4000);
    return () => { if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current); };
  }, [currentBadge, dispatch]);
  const badgeAssociate = currentBadge ? state.associates.find(a => a.id === currentBadge.associateId) : null;

  // ── POTD trigger ───────────────────────────────────────────────────────────
  useEffect(() => { if (state.pendingPOTD) setShowPOTD(true); }, [state.pendingPOTD]);

  const handleOpenProfile = useCallback((id: string) => { setAwardTargetId(null); setProfileId(id); }, []);
  const handleOpenAward   = useCallback((id: string) => { setProfileId(null); setAwardTargetId(id); }, []);
  const handleBulkAward   = useCallback((ids: string[]) => setBulkTargetIds(ids), []);
  const handleStartNew    = useCallback(() => {/* shift is now automatic */}, []);

  const VIEW_COMPONENTS: Record<ViewKey, React.ReactNode> = useMemo(() => ({
    leaderboard: <Leaderboard onCardClick={handleOpenProfile} onAwardClick={handleOpenAward} isAdmin={isAdmin} />,
    crew:        <CrewGrid onCardClick={handleOpenProfile} onAwardClick={handleOpenAward} onBulkAward={handleBulkAward} isAdmin={isAdmin} />,
    halloffame:  <HallOfFame />,
    settings:    <Settings />,
    info:        <Info />,
  }), [handleOpenProfile, handleOpenAward, handleBulkAward, isAdmin]);

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      <div className="flex flex-col h-full">
        <Header onCrownPOTD={() => setShowPOTD(true)} isAdmin={isAdmin} />
        <Navigation active={activeView} onChange={setActiveView} isAdmin={isAdmin} />

        {/* Outside-shift-hours banner */}
        {!state.shift.active && (
          <div className="flex-shrink-0 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-4 py-1.5 text-center">
            <span className="text-[11px] text-[var(--text-muted)] font-body">
              ⏰ Outside shift hours · Award buttons disabled · Settings always accessible
            </span>
          </div>
        )}

        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div key={activeView}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="absolute inset-0">
              {VIEW_COMPONENTS[activeView]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {profileId && !awardTargetId && (
          <AssociateProfile key={`profile-${profileId}`} id={profileId}
            onClose={() => setProfileId(null)}
            onAward={(id) => { setProfileId(null); setAwardTargetId(id); }}
            isAdmin={isAdmin} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {awardTargetId && (
          <AwardPanel key={`award-${awardTargetId}`} targetId={awardTargetId} onClose={() => setAwardTargetId(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bulkTargetIds && bulkTargetIds.length > 0 && (
          <BulkAwardPanel key="bulk-award" targetIds={bulkTargetIds} onClose={() => setBulkTargetIds(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEndShift && (
          <EndShiftSummary key="end-shift" onClose={() => setShowEndShift(false)} onStartNew={handleStartNew} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPOTD && (
          <POTDCeremony key="potd-ceremony" onClose={() => setShowPOTD(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!!state.pendingCelebration && (
          <TierCelebration key="tier-celebration" onDone={() => {}} />
        )}
      </AnimatePresence>

      {/* ── Undo toast ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {undoToast && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[55] flex items-center gap-3 px-4 py-3 bg-[#1C1917] text-white rounded-2xl shadow-xl text-sm font-body whitespace-nowrap">
            <span className="text-white/70">+{undoToast.points} pts →</span>
            <span className="font-semibold">{undoToast.name}</span>
            <button onClick={handleUndo} className="ml-1 px-3 py-1 bg-white/[0.12] hover:bg-white/[0.22] rounded-lg font-heading text-xs transition-colors">UNDO</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Badge unlock toast ────────────────────────────────────────────── */}
      <AnimatePresence>
        {currentBadge && badgeAssociate && (
          <BadgeUnlockToast key={`${currentBadge.associateId}-${currentBadge.badge}`}
            badge={currentBadge.badge} associateName={badgeAssociate.displayName}
            associateEmoji={badgeAssociate.emoji}
            onDismiss={() => dispatch({ type: 'SHIFT_BADGE_UNLOCK' })} />
        )}
      </AnimatePresence>

      {/* ── Shift start banner ────────────────────────────────────────────── */}
      <ShiftStartBanner visible={showStartBanner} onDismiss={() => setShowStartBanner(false)} />
    </div>
  );
}
