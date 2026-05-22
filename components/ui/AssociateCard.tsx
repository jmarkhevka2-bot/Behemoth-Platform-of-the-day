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
}

const ACCENT: Record<string, string> = {
  none:    'accent-none',
  bronze:  'accent-bronze',
  silver:  'accent-silver',
  gold:    'accent-gold',
  diamond: 'accent-diamond',
  legend:  'accent-legend',
};

export default function AssociateCard({ associate: a, onCardClick, onAwardClick, multiSelectMode, isSelected, onToggleSelect }: Props) {
  const { state } = useAppState();
  const [hovered, setHovered] = useState(false);

  function handleClick() {
    if (multiSelectMode && onToggleSelect) {
      onToggleSelect(a.id);
    } else {
      onCardClick(a.id);
    }
  }

  return (
    <motion.div
      whileHover={{ translateY: multiSelectMode ? 0 : -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`
        relative bg-white border border-l-[3px] rounded-xl p-3 cursor-pointer
        select-none transition-all border-[#DDD9D2] ${ACCENT[a.currentTier]}
        ${isSelected ? 'ring-2 ring-[#1C1917] ring-offset-1 shadow-md' : hovered ? 'shadow-md' : 'shadow-sm'}
      `}
      onClick={handleClick}
    >
      {/* Multi-select checkbox */}
      {multiSelectMode && (
        <div className={`
          absolute top-2 right-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
          ${isSelected ? 'bg-[#1C1917] border-[#1C1917]' : 'bg-white border-[#C4BEB8]'}
        `}>
          {isSelected && <span className="text-white text-[10px] leading-none font-bold">✓</span>}
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-2xl leading-none">{a.emoji}</span>
        {!multiSelectMode && (
          <div className="flex items-center gap-1">
            {a.streak > 0 && (
              <span className="text-[10px] text-orange-500 font-body leading-none">🔥{a.streak}</span>
            )}
            <TierBadge tier={a.currentTier} size="xs" />
          </div>
        )}
        {multiSelectMode && (
          <div className="mr-6">
            <TierBadge tier={a.currentTier} size="xs" />
          </div>
        )}
      </div>

      {/* Name */}
      <p className="font-body font-semibold text-[#1C1917] text-sm leading-tight truncate mb-0.5">
        {a.displayName}
      </p>

      {/* Points row */}
      <div className="flex items-baseline gap-1 mb-2">
        <PointCounter value={a.seasonPoints} className="font-heading text-lg leading-none text-[#1C1917]" />
        <span className="text-[10px] text-[#A8A29E] font-body">pts</span>
        {a.dailyPoints > 0 && (
          <span className="text-[10px] text-[#3B78B8] font-body ml-0.5">+{a.dailyPoints}</span>
        )}
      </div>

      {/* Progress bar */}
      <ProgressBar
        points={a.seasonPoints}
        tier={a.currentTier}
        configs={state.settings.tiers}
      />

      {a.potdWins > 0 && (
        <p className="mt-1 text-[9px] text-[#B08C1E]/70 font-body">👑 {a.potdWins}× POTD</p>
      )}

      {/* Hover award button (normal mode only) */}
      <AnimatePresence>
        {hovered && !multiSelectMode && (
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
