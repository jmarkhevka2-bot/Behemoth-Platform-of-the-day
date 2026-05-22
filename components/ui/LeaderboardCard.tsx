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
}

const MEDAL = ['🥇', '🥈', '🥉'];

const LeaderboardCard = forwardRef<HTMLDivElement, Props>(function LeaderboardCard(
  { associate: a, rank, onCardClick, onAwardClick, isTied }, ref
) {
  const isTop3 = rank <= 3;
  const isFirst = rank === 1;

  return (
    <motion.div
      ref={ref}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        bg-white border border-l-[3px] select-none transition-shadow
        ${isFirst
          ? 'gold-glow-pulse border-[#B08C1E]/30 accent-gold'
          : 'border-[#DDD9D2] accent-none hover:shadow-sm'}
      `}
      onClick={() => onCardClick(a.id)}
    >
      {/* Rank */}
      <div className="w-7 flex-shrink-0 text-right">
        {isTop3 ? (
          <span className="text-base leading-none">{MEDAL[rank - 1]}</span>
        ) : (
          <span className="font-heading text-sm text-[#C4BEB8]">{rank}</span>
        )}
      </div>

      {/* Emoji */}
      <span className="text-xl flex-shrink-0 leading-none">{a.emoji}</span>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-body font-semibold text-sm leading-tight ${isFirst ? 'text-[#B08C1E]' : 'text-[#1C1917]'}`}>
            {a.displayName}
          </span>
          <TierBadge tier={a.currentTier} size="xs" />
          {a.streak > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-500 font-body leading-none">
              🔥{a.streak}
            </span>
          )}
          {a.potdWins > 0 && (
            <span className="text-[9px] text-[#B08C1E]/60 font-body leading-none">👑×{a.potdWins}</span>
          )}
          {isTied && (
            <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-200 px-1 py-0.5 rounded font-body">TIE</span>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="flex-shrink-0 text-right">
        <PointCounter
          value={a.seasonPoints}
          className={`font-heading text-lg leading-none block ${isFirst ? 'text-[#B08C1E]' : 'text-[#1C1917]'}`}
        />
        {a.dailyPoints > 0 && (
          <span className="text-[10px] text-[#3B78B8] font-body">+{a.dailyPoints}</span>
        )}
      </div>

      {/* Award button */}
      <button
        onClick={(e) => { e.stopPropagation(); onAwardClick(a.id); }}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
          text-[#C4BEB8] hover:text-[#1C1917] hover:bg-[#F5F3EE] transition-colors text-sm font-heading"
        title="Award points"
      >
        +
      </button>
    </motion.div>
  );
});

export default LeaderboardCard;
