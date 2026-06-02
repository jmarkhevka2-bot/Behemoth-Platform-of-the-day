'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BADGE_META } from '@/lib/utils/badges';
import type { BadgeKey } from '@/lib/types';

interface Props {
  badge: BadgeKey;
  associateName: string;
  associateEmoji: string;
  onDismiss: () => void;
}

export default function BadgeUnlockToast({ badge, associateName, associateEmoji, onDismiss }: Props) {
  const meta = BADGE_META[badge];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 80, scale: 0.92 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="fixed bottom-24 right-4 z-[70] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl cursor-pointer max-w-xs"
        style={{
          background: 'linear-gradient(135deg, #1C1917, #2D2A27)',
          border: '1px solid rgba(201,168,64,0.4)',
          boxShadow: '0 0 0 1px rgba(201,168,64,0.25), 0 8px 32px rgba(0,0,0,0.4)',
        }}
        onClick={onDismiss}
      >
        {/* Badge icon with glow */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 flex items-center justify-center"
            style={{ boxShadow: '0 0 12px rgba(201,168,64,0.3)' }}>
            <span className="text-xl leading-none">{meta.emoji}</span>
          </div>
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p className="text-[10px] text-[var(--accent-gold)] font-heading tracking-widest mb-0.5">ACHIEVEMENT UNLOCKED</p>
          <p className="text-white font-body font-semibold text-sm leading-tight">{meta.name}</p>
          <p className="text-white/50 font-body text-[10px] truncate">{associateEmoji} {associateName} · {meta.flavour}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
