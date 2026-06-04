'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Associate, TierConfig } from '@/lib/types';
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
  nextTierConfig: TierConfig | null;
}

export default function ChasingCard({
  rank,
  associate,
  isAdmin,
  onCardClick,
  onAwardClick,
  nextTierConfig,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const progressPercent = nextTierConfig
    ? Math.min(100, (associate.seasonPoints / nextTierConfig.threshold) * 100)
    : 100;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick(associate.id);
    }
  };

  return (
    <motion.div
      layout
      layoutId={`chasing-${associate.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onCardClick(associate.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative cursor-pointer p-4 rounded-xl bg-[var(--bg-card)] border border-l-4 transition-all duration-200 ${
        hovered ? 'shadow-md' : 'shadow-sm'
      }`}
      style={{
        borderLeftColor: TIER_COLORS[associate.currentTier],
        boxShadow: hovered
          ? `0 0 0 1px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)`
          : '0 0 0 1px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.08)',
      }}
      aria-label={`Rank ${rank}: ${associate.displayName} with ${associate.seasonPoints} points, tier ${associate.currentTier}`}
    >
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAwardClick(associate.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-lg flex items-center justify-center text-xs font-heading transition-colors"
          aria-label={`Award points to ${associate.displayName}`}
        >
          +
        </button>
      )}

      <div className="flex items-center gap-3 pt-1">
        <span className="text-4xl leading-none flex-shrink-0 w-12 text-center">{associate.emoji}</span>

        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-[var(--text-primary)] text-sm truncate">
            {associate.displayName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <TierBadge tier={associate.currentTier} size="xs" />
            <span className="text-[10px] text-[var(--text-muted)] font-body">
              {associate.currentTier === 'none' ? 'No tier' : ''}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right min-w-max">
          <PointCounter
            value={associate.seasonPoints}
            className="font-heading text-lg text-[var(--text-primary)] leading-none"
          />
          <p className="text-[9px] text-[var(--text-muted)] font-body mt-0.5">pts</p>
        </div>
      </div>

      <div className="mt-3 h-0.5 bg-[var(--border)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${TIER_COLORS[associate.currentTier]}, ${TIER_COLORS[associate.currentTier]}cc)` }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 20 }}
        />
      </div>
    </motion.div>
  );
}
