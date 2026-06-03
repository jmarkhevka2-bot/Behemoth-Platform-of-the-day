'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Associate } from '@/lib/types';
import { useAppState } from '@/lib/hooks/useAppState';
import TierBadge from './TierBadge';
import ProgressBar from './ProgressBar';
import PointCounter from './PointCounter';

interface Props {
  associate: Associate;
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  // Multi-select
  multiSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isAdmin?: boolean;
  // Multi-POTD select
  potdSelectMode?: boolean;
  isPOTDSelected?: boolean;
  onTogglePOTD?: (id: string) => void;
}

const ACCENT: Record<string, string> = {
  none:    'accent-none',
  bronze:  'accent-bronze',
  silver:  'accent-silver',
  gold:    'accent-gold',
  diamond: 'accent-diamond',
  legend:  'accent-legend',
};

export default function AssociateCard({
  associate: a, onCardClick, onAwardClick,
  multiSelectMode, isSelected, onToggleSelect,
  isAdmin = true,
  potdSelectMode, isPOTDSelected, onTogglePOTD,
}: Props) {
  const { state } = useAppState();
  const [hovered, setHovered] = useState(false);

  function handleClick() {
    if (potdSelectMode && onTogglePOTD) return onTogglePOTD(a.id);
    if (multiSelectMode && onToggleSelect) return onToggleSelect(a.id);
    onCardClick(a.id);
  }

  const isPOTDMode = potdSelectMode;

  return (
    <motion.div
      whileHover={{ translateY: (multiSelectMode || potdSelectMode) ? 0 : -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`
        relative bg-[var(--bg-card)] border border-l-[3px] rounded-xl p-3 cursor-pointer
        select-none border-[var(--border)] ${ACCENT[a.currentTier]}
        ${isPOTDSelected
          ? 'potd-selected-glow ring-2 ring-[var(--accent-gold)] ring-offset-1'
          : isSelected
            ? 'ring-2 ring-[var(--text-primary)] ring-offset-1 shadow-md'
            : hovered ? 'shadow-md' : 'shadow-sm'}
      `}
      onClick={handleClick}
    >
      {/* Multi-select checkbox */}
      {multiSelectMode && (
        <div className={`
          absolute top-2 right-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
          ${isSelected ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'bg-[var(--bg-card)] border-[var(--text-hint)]'}
        `}>
          {isSelected && <span className="text-[var(--bg-card)] text-[10px] leading-none font-bold">✓</span>}
        </div>
      )}

      {/* POTD select indicator */}
      {isPOTDMode && (
        <div className={`
          absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
          ${isPOTDSelected ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)]' : 'bg-[var(--bg-card)] border-[var(--border)]'}
        `}>
          {isPOTDSelected && <span className="text-white text-[8px] leading-none">👑</span>}
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-2xl leading-none">{a.emoji}</span>
        {!multiSelectMode && !potdSelectMode && (
          <div className="flex items-center gap-1">
            {a.streak > 0 && (
              <span className="text-[10px] text-orange-500 font-body leading-none">🔥{a.streak}</span>
            )}
            <TierBadge tier={a.currentTier} size="xs" />
          </div>
        )}
        {(multiSelectMode || potdSelectMode) && (
          <div className="mr-6">
            <TierBadge tier={a.currentTier} size="xs" />
          </div>
        )}
      </div>

      {/* Name */}
      <p className="font-body font-semibold text-[var(--text-primary)] text-sm leading-tight truncate mb-0.5">
        {a.displayName}
      </p>

      {/* Points row */}
      <div className="flex items-baseline gap-1 mb-2">
        <PointCounter value={a.seasonPoints} className="font-heading text-lg leading-none text-[var(--text-primary)]" />
        <span className="text-[10px] text-[var(--text-muted)] font-body">pts</span>
        {a.dailyPoints > 0 && (
          <span className="text-[10px] text-[var(--accent-blue)] font-body ml-0.5">+{a.dailyPoints}</span>
        )}
      </div>

      {/* Progress bar */}
      <ProgressBar points={a.seasonPoints} tier={a.currentTier} configs={state.settings.tiers} />

      {/* Badge count + POTD wins */}
      <div className="flex items-center gap-2 mt-1">
        {a.potdWins > 0 && (
          <p className="text-[9px] text-[var(--accent-gold)]/70 font-body">👑 {a.potdWins}× POTD</p>
        )}
        {a.badges.length > 0 && (
          <p className="text-[9px] text-[var(--text-hint)] font-body">🏅 {a.badges.length}</p>
        )}
      </div>

      {/* Hover award button (normal mode only, admin + shift active) */}
      <AnimatePresence>
        {hovered && !multiSelectMode && !potdSelectMode && isAdmin && state.shift.active && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            onClick={(e) => { e.stopPropagation(); onAwardClick(a.id); }}
            className="absolute bottom-2 right-2 px-2 py-1 bg-[#1C1917] text-white text-[10px] font-semibold font-body rounded-lg shadow-md"
          >
            + Award
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
