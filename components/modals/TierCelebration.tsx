'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppState } from '@/lib/hooks/useAppState';
import { useAssociateById } from '@/lib/hooks/useAppState';
import { useSound } from '@/lib/hooks/useSound';
import { getCurrentTierConfig } from '@/lib/utils/tiers';
import type { Tier } from '@/lib/types';

const TIER_CONFETTI: Record<Tier, string[]> = {
  none:    ['#DDD9D2'],
  bronze:  ['#C07A3A', '#E8943A', '#FFB347'],
  silver:  ['#8899AA', '#C0C8D0', '#E8ECF0'],
  gold:    ['#B08C1E', '#C9A840', '#F5D76E'],
  diamond: ['#3B78B8', '#7BB4E8', '#B9D9F5'],
  legend:  ['#7C3AED', '#B08C1E', '#C9A840', '#A78BFA'],
};
const TIER_LABELS: Record<Tier, string> = {
  none: '', bronze: 'BRONZE OPERATOR', silver: 'SILVER OPERATOR',
  gold: 'GOLD OPERATOR', diamond: 'DIAMOND OPERATOR', legend: 'BEHEMOTH LEGEND',
};
const TIER_ACCENT: Record<Tier, string> = {
  none: 'var(--border)', bronze: '#C07A3A', silver: '#8899AA',
  gold: '#B08C1E', diamond: '#3B78B8', legend: '#7C3AED',
};

interface Props { onDone: () => void; }

export default function TierCelebration({ onDone }: Props) {
  const { state, dispatch } = useAppState();
  const pending    = state.pendingCelebration;
  const associate  = useAssociateById(pending?.associateId ?? null);
  const { playTierUnlock } = useSound();
  const tierConfig = pending ? getCurrentTierConfig(pending.newTier, state.settings.tiers) : null;

  useEffect(() => {
    if (!pending) return;
    const t1 = setTimeout(() => playTierUnlock(), 400);
    const colors = TIER_CONFETTI[pending.newTier];
    const t2 = setTimeout(() => {
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 }, colors, scalar: 1.2 });
      confetti({ particleCount: 80,  angle: 60,  spread: 60, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 80,  angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors });
    }, 800);
    const t3 = setTimeout(() => { dispatch({ type: 'CLEAR_PENDING_CELEBRATION' }); onDone(); }, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [pending, playTierUnlock, dispatch, onDone]);

  if (!pending || !associate) return null;
  const tier = pending.newTier;
  const accentColor = TIER_ACCENT[tier];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-[var(--bg-primary)] flex flex-col items-center justify-center">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${accentColor}18 0%, transparent 70%)` }} />

      <div className="relative flex flex-col items-center text-center px-6">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          className={`tier-${tier} shimmer-overlay rounded-3xl px-8 py-4 mb-6 shadow-lg`}>
          <p className="font-heading text-5xl">{tierConfig?.emoji ?? '🏆'}</p>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="font-heading text-5xl sm:text-7xl text-[var(--text-primary)] mb-2">
          {associate.emoji} {associate.displayName}
        </motion.p>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="font-heading text-2xl sm:text-3xl tracking-widest" style={{ color: accentColor }}>
          {TIER_LABELS[tier]}
        </motion.p>

        {tierConfig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="mt-5 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl max-w-sm shadow-sm">
            <p className="text-[10px] text-[var(--text-muted)] font-body mb-1 uppercase tracking-wider">Reward unlocked</p>
            <p className="text-[var(--text-secondary)] font-body text-sm leading-snug">{tierConfig.reward}</p>
          </motion.div>
        )}

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          onClick={() => { dispatch({ type: 'CLEAR_PENDING_CELEBRATION' }); onDone(); }}
          className="mt-8 px-8 py-3 border border-[var(--border)] text-[var(--text-secondary)] font-heading text-sm rounded-xl hover:bg-[var(--bg-card)] transition-colors">
          CELEBRATE! 🎉
        </motion.button>
      </div>
    </motion.div>
  );
}
