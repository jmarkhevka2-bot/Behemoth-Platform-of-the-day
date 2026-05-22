'use client';

import { motion } from 'framer-motion';
import type { Tier, TierConfig } from '@/lib/types';
import { getTierProgress, getNextTierConfig } from '@/lib/utils/tiers';

const TIER_FILL_CLASS: Record<Tier, string> = {
  none:    'bg-white/20',
  bronze:  'tier-bronze',
  silver:  'tier-silver',
  gold:    'tier-gold',
  diamond: 'tier-diamond',
  legend:  'tier-legend',
};

interface Props {
  points: number;
  tier: Tier;
  configs: TierConfig[];
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ points, tier, configs, className = '', showLabel = false }: Props) {
  const progress = getTierProgress(points, configs);
  const next = getNextTierConfig(points, configs);
  const isMax = tier === 'legend';

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${TIER_FILL_CLASS[tier]} ${isMax ? '' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${isMax ? 100 : progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        />
      </div>
      {showLabel && !isMax && next && (
        <p className="text-[10px] text-white/30 mt-0.5 text-right">
          {next.threshold - points} pts to {next.label}
        </p>
      )}
      {showLabel && isMax && (
        <p className="text-[10px] text-accent-yellow mt-0.5 text-right">LEGEND ✦</p>
      )}
    </div>
  );
}
