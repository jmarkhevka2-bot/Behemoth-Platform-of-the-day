'use client';

import { motion } from 'framer-motion';
import type { Associate } from '@/lib/types';
import TierBadge from '@/components/ui/TierBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAppState } from '@/lib/hooks/useAppState';

interface Props {
  associate: Associate;
  rank: number;
  isAdmin: boolean;
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
}

export default function ChasingPodiumCard({
  associate: a,
  rank,
  isAdmin,
  onCardClick,
  onAwardClick,
}: Props) {
  const { state } = useAppState();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick(a.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="h-full"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onCardClick(a.id)}
        onKeyDown={handleKeyDown}
        className="h-full relative bg-gradient-to-br from-[var(--bg-card)] to-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden group cursor-pointer transition-all hover:border-[#3A3A3A] hover:shadow-lg active:scale-95"
      >
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-gold)]/0 via-transparent to-[var(--accent-gold)]/0 group-hover:from-[var(--accent-gold)]/5 group-hover:via-transparent group-hover:to-[var(--accent-gold)]/5 transition-all duration-300" />

        {/* Content */}
        <div className="relative h-full p-4 flex items-center gap-4">
          {/* Rank - Large and Bold on Left */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-heading font-black text-[var(--accent-gold)] leading-none">
              {rank}
            </div>
            <div className="text-[10px] font-heading tracking-widest text-[var(--text-muted)] mt-1">
              POS
            </div>
          </div>

          {/* Center: Name, Emoji, Tier */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl flex-shrink-0">{a.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-[var(--text-primary)] text-sm leading-tight truncate">
                  {a.displayName}
                </p>
              </div>
            </div>

            {/* Tier and Streak Row */}
            <div className="flex items-center gap-2 mb-2">
              <TierBadge tier={a.currentTier} size="xs" />
              {a.streak > 0 && (
                <span className="text-[10px] text-orange-500 font-body leading-none">🔥 {a.streak}</span>
              )}
              {a.potdWins > 0 && (
                <span className="text-[9px] text-[var(--accent-gold)] font-body">👑 {a.potdWins}</span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full">
              <ProgressBar points={a.seasonPoints} tier={a.currentTier} configs={state.settings.tiers} />
            </div>
          </div>

          {/* Right: Points and Action */}
          <div className="flex-shrink-0 text-right flex flex-col items-end gap-1.5">
            {/* Season Points */}
            <div>
              <div className="text-3xl font-heading font-black text-[var(--text-primary)] leading-none">
                {a.seasonPoints}
              </div>
              <div className="text-[9px] text-[var(--text-muted)] font-body tracking-widest">PTS</div>
            </div>

            {/* Daily Points Badge */}
            {a.dailyPoints > 0 && (
              <div className="px-2 py-1 rounded-md bg-[var(--accent-blue)]/20 border border-[var(--accent-blue)]/30">
                <span className="text-[10px] text-[var(--accent-blue)] font-heading font-bold">
                  +{a.dailyPoints}
                </span>
              </div>
            )}

            {/* Award Button */}
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAwardClick(a.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent-gold)]/20 border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] font-heading font-bold text-xs hover:bg-[var(--accent-gold)]/30 hover:border-[var(--accent-gold)]/60 transition-all"
                title="Click to award points"
              >
                +
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
