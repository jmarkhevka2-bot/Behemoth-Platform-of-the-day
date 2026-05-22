'use client';

import type { Tier } from '@/lib/types';

interface Props {
  tier: Tier;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const TIER_META: Record<Tier, { emoji: string; label: string; bg: string; border: string; text: string }> = {
  none:    { emoji: '',   label: 'Rookie',          bg: '',               border: '',                 text: '' },
  bronze:  { emoji: '🥉', label: 'Bronze',          bg: 'bg-amber-50',   border: 'border-amber-200', text: 'text-amber-800' },
  silver:  { emoji: '🥈', label: 'Silver',          bg: 'bg-slate-100',  border: 'border-slate-300', text: 'text-slate-600' },
  gold:    { emoji: '🥇', label: 'Gold',            bg: 'bg-amber-50',   border: 'border-amber-300', text: 'text-amber-900' },
  diamond: { emoji: '💎', label: 'Diamond',         bg: 'bg-sky-50',     border: 'border-sky-200',   text: 'text-sky-700' },
  legend:  { emoji: '👑', label: 'Legend',          bg: 'bg-violet-100', border: 'border-violet-300',text: 'text-violet-800' },
};

const SIZE_CLASSES = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-0.5',
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1',
  lg: 'px-3 py-1.5 text-base gap-1.5',
};

export default function TierBadge({ tier, size = 'sm', showLabel = false }: Props) {
  if (tier === 'none') return null;

  const { emoji, label, bg, border, text } = TIER_META[tier];

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-body leading-none border
        ${bg} ${border} ${text}
        ${SIZE_CLASSES[size]}
        select-none
      `}
    >
      <span>{emoji}</span>
      {showLabel && <span className="font-medium">{label}</span>}
    </span>
  );
}

export { TIER_META };
