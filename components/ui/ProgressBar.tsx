'use client';

import { motion } from 'framer-motion';
import type { Tier, TierConfig } from '@/lib/types';
import { getTierProgress, getNextTierConfig } from '@/lib/utils/tiers';

const TIER_FILL_CLASS: Record<Tier, string> = {
  none:    'bg-[var(--border)]',
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
}

export default function ProgressBar({ points, tier, configs, className = '' }: Props) {
  const progress = getTierProgress(points, configs);
  const isMax = tier === 'legend';

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${TIER_FILL_CLASS[tier]}`}
          initial={{ width: 0 }}
          animate={{ width: `${isMax ? 100 : progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        />
      </div>
    </div>
  );
}
