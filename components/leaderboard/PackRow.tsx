'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Associate } from '@/lib/types';
import TierBadge from '@/components/ui/TierBadge';
import PointCounter from '@/components/ui/PointCounter';

const TIER_COLORS: Record<string, string> = {
  none: '#666666',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#B9F2FF',
  legend: '#9B59B6',
};

interface Props {
  rank: number;
  associate: Associate;
  isAdmin: boolean;
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  rowIndex: number;
}

export default function PackRow({
  rank,
  associate,
  isAdmin,
  onCardClick,
  onAwardClick,
  rowIndex,
}: Props) {
  const [hovered, setHovered] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick(associate.id);
    }
  };

  return (
    <motion.div
      layout
      layoutId={`pack-${associate.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onCardClick(associate.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all border-b border-l-[2px] ${
        rowIndex % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-secondary)]'
      } ${hovered ? 'bg-[var(--bg-card-hover)]' : ''}`}
      style={{
        borderLeftColor: hovered
          ? TIER_COLORS[associate.currentTier]
          : `${TIER_COLORS[associate.currentTier]}40`,
      }}
      aria-label={`Rank ${rank}: ${associate.displayName} with ${associate.seasonPoints} points`}
    >
      <span className="text-sm font-heading font-bold text-[var(--text-muted)] w-7 flex-shrink-0 text-right">
        #{rank}
      </span>

      <span className="text-2xl leading-none flex-shrink-0 w-10 text-center">{associate.emoji}</span>

      <span className="text-sm font-body font-medium text-[var(--text-primary)] flex-1 min-w-0 truncate">
        {associate.displayName}
      </span>

      <TierBadge tier={associate.currentTier} size="xs" />

      <PointCounter
        value={associate.seasonPoints}
        className="font-heading text-sm font-bold text-[var(--text-primary)] flex-shrink-0"
      />
      <span className="text-[9px] text-[var(--text-muted)] font-body w-8 text-right flex-shrink-0">
        pts
      </span>

      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAwardClick(associate.id);
          }}
          className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-[var(--text-hint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded text-xs font-heading transition-colors"
          aria-label={`Award points to ${associate.displayName}`}
        >
          +
        </button>
      )}
    </motion.div>
  );
}
