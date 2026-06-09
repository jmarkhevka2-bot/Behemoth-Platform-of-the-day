'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { Associate, TierConfig } from '@/lib/types';
import { useAppState } from '@/lib/hooks/useAppState';
import { getTierProgress } from '@/lib/utils/tiers';
import PointCounter from '@/components/ui/PointCounter';
import ProgressBar from '@/components/ui/ProgressBar';

interface Props {
  rank: 1 | 2 | 3;
  associate: Associate;
  isAdmin: boolean;
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  nextTierConfig: TierConfig | null;
}

export default function PodiumCard({
  rank,
  associate,
  isAdmin,
  onCardClick,
  onAwardClick,
  nextTierConfig,
}: Props) {
  const { state } = useAppState();

  const gradients: Record<number, string> = {
    1: 'from-yellow-400 via-yellow-600 to-yellow-500',
    2: 'from-gray-100 via-gray-400 to-gray-300',
    3: 'from-amber-700 via-amber-900 to-amber-800',
  };

  const glows: Record<number, string> = {
    1: 'shadow-2xl podium-one-glow',
    2: 'shadow-lg hover:shadow-xl',
    3: 'shadow-lg hover:shadow-xl',
  };

  // Check if associate is at a tier threshold
  const tierProgress = useMemo(() =>
    getTierProgress(associate.seasonPoints, state.settings.tiers),
    [associate.seasonPoints, state.settings.tiers]
  );
  const isAtTierThreshold = tierProgress >= 0.85 && associate.currentTier !== 'legend';
  const tierGlowClass = isAtTierThreshold ? `tier-glow-${associate.currentTier}` : '';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick(associate.id);
    }
  };

  return (
    <motion.div
      layout
      layoutId={`podium-${associate.id}`}
      onClick={() => onCardClick(associate.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={`relative cursor-pointer ${rank === 1 ? 'md:scale-110 md:mb-4' : ''}`}
      aria-label={`Rank ${rank}: ${associate.displayName} with ${associate.seasonPoints} points`}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`bg-gradient-to-br ${gradients[rank]} rounded-2xl p-6 text-center transition-all duration-300 ${glows[rank]} ${tierGlowClass}`}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ opacity: 0.1 }}
          />
        </div>

        <div className="absolute top-3 left-3 text-2xl font-heading font-bold text-white opacity-80">
          #{rank}
        </div>

        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAwardClick(associate.id);
            }}
            className="absolute top-3 right-3 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
            aria-label={`Award points to ${associate.displayName}`}
          >
            +
          </button>
        )}

        <div className="mt-8">
          <div className="text-5xl leading-none font-heading font-bold text-white mb-2">
            <PointCounter value={associate.seasonPoints} />
          </div>
          <p className="text-sm text-white/80 font-body">Season Points</p>
        </div>

        {nextTierConfig && (
          <div className="mt-4">
            <ProgressBar points={associate.seasonPoints} tier={associate.currentTier} configs={[]} className="w-full" />
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-2xl leading-none">{associate.emoji}</span>
          <div className="text-left">
            <p className="font-body font-semibold text-white text-sm leading-tight">{associate.displayName}</p>
            <p className="text-xs text-white/60 font-body">{associate.currentTier}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
