'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { Associate } from '@/lib/types';
import TierBadge from './TierBadge';
import PointCounter from './PointCounter';

interface Props {
  associate: Associate;
  rank: number;
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  isTied?: boolean;
  isAdmin?: boolean;
}

const MEDAL = ['🥇', '🥈', '🥉'];

const LeaderboardCard = forwardRef<HTMLDivElement, Props>(function LeaderboardCard(
  { associate: a, rank, onCardClick, onAwardClick, isTied, isAdmin = true }, ref
) {
  const isTop3  = rank <= 3;
  const isFirst = rank === 1;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick(a.id);
    }
  };

  const ariaLabel = `Rank ${rank}: ${a.displayName} with ${a.seasonPoints} points${a.currentTier !== 'none' ? `, tier ${a.currentTier}` : ''}${a.dailyPoints > 0 ? `, ${a.dailyPoints} points today` : ''}`;

  return (
    <motion.div
      ref={ref}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      role="button"
      tabIndex={0}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        bg-[var(--bg-card)] border border-l-[3px] select-none transition-shadow active:scale-95
        ${isFirst
          ? 'gold-glow-pulse border-[var(--accent-gold)]/30 accent-gold'
          : 'border-[var(--border)] accent-none hover:shadow-sm'}
      `}
      onClick={() => onCardClick(a.id)}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      {/* Rank */}
      <div className="w-10 flex-shrink-0 text-center">
        {isTop3
          ? <span className="text-base leading-none">{MEDAL[rank - 1]}</span>
          : <span className="font-heading text-lg font-bold text-[var(--text-primary)]">#{rank}</span>
        }
      </div>

      {/* Emoji */}
      <span className="text-xl flex-shrink-0 leading-none">{a.emoji}</span>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-body font-semibold leading-tight ${isTop3 ? 'text-lg' : 'text-sm'} ${isFirst ? 'text-[var(--accent-gold)]' : 'text-[var(--text-primary)]'}`}>
            {a.displayName}
          </span>
          <TierBadge tier={a.currentTier} size="xs" />
          {a.streak > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-500 font-body leading-none">
              🔥{a.streak}
            </span>
          )}
          {a.potdWins > 0 && (
            <span className="text-[9px] text-[var(--accent-gold)]/60 font-body leading-none">👑×{a.potdWins}</span>
          )}
          {isTied && (
            <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-200 px-1 py-0.5 rounded font-body">TIE</span>
          )}
          {a.badges.length > 0 && (
            <span className="text-[9px] text-[var(--text-hint)] font-body leading-none">🏅{a.badges.length}</span>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="flex-shrink-0 text-right ml-4 min-w-[60px]">
        <PointCounter
          value={a.seasonPoints}
          className={`font-heading text-2xl leading-none block font-bold ${isFirst ? 'text-[var(--accent-gold)]' : 'text-[var(--text-primary)]'}`}
        />
        {a.dailyPoints > 0 && (
          <span className="text-[11px] text-[var(--accent-blue)] font-body font-semibold">+{a.dailyPoints}</span>
        )}
      </div>

      {/* Points display — click to award points */}
      <button
        onClick={(e) => { e.stopPropagation(); onAwardClick(a.id); }}
        className="flex-shrink-0 flex items-center justify-center rounded-lg
          text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors font-heading font-bold text-2xl"
        aria-label={`Award points to ${a.displayName}`}
        title="Click to award points"
      >
        {a.seasonPoints}
      </button>
    </motion.div>
  );
});

export default LeaderboardCard;
