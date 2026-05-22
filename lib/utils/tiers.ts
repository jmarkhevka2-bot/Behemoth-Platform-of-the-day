import type { Tier, TierConfig } from '../types';
import { DEFAULT_TIER_CONFIGS } from '../constants';

export function getTier(points: number, configs: TierConfig[] = DEFAULT_TIER_CONFIGS): Tier {
  const sorted = [...configs].sort((a, b) => b.threshold - a.threshold);
  for (const cfg of sorted) {
    if (points >= cfg.threshold) return cfg.tier;
  }
  return 'none';
}

export function getNextTierConfig(points: number, configs: TierConfig[] = DEFAULT_TIER_CONFIGS): TierConfig | null {
  const sorted = [...configs].sort((a, b) => a.threshold - b.threshold);
  return sorted.find(c => c.threshold > points) ?? null;
}

export function getCurrentTierConfig(tier: Tier, configs: TierConfig[] = DEFAULT_TIER_CONFIGS): TierConfig | null {
  return configs.find(c => c.tier === tier) ?? null;
}

export function getTierProgress(points: number, configs: TierConfig[] = DEFAULT_TIER_CONFIGS): number {
  const sorted = [...configs].sort((a, b) => a.threshold - b.threshold);
  const next = sorted.find(c => c.threshold > points);
  if (!next) return 1;
  const prev = [...sorted].reverse().find(c => c.threshold <= points);
  const low = prev ? prev.threshold : 0;
  return Math.min(1, (points - low) / (next.threshold - low));
}

export const TIER_ORDER: Tier[] = ['none', 'bronze', 'silver', 'gold', 'diamond', 'legend'];

export function isTierHigher(a: Tier, b: Tier): boolean {
  return TIER_ORDER.indexOf(a) > TIER_ORDER.indexOf(b);
}
