'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';

interface Props {
  visible:    boolean;
  onDismiss:  () => void;
}

export default function ShiftStartBanner({ visible, onDismiss }: Props) {
  const { state } = useAppState();
  const rival1 = state.dailyRival ? state.associates.find(a => a.id === state.dailyRival!.id1) : null;
  const rival2 = state.dailyRival ? state.associates.find(a => a.id === state.dailyRival!.id2) : null;

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-[80] flex flex-col items-center py-3 px-4"
          style={{
            background: 'linear-gradient(135deg, #1C1917, #252220)',
            borderBottom: '1px solid rgba(201,168,64,0.3)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onClick={onDismiss}
        >
          <p className="font-heading text-[var(--accent-gold)] text-sm tracking-widest">
            ⚡ SHIFT STARTED — Good luck out there 🚀
          </p>
          {rival1 && rival2 && (
            <p className="text-white/60 text-xs font-body mt-1">
              Today&apos;s rivalry: <span className="text-white/90">{rival1.emoji} {rival1.displayName}</span>
              <span className="text-[var(--accent-gold)] mx-1.5">⚔️</span>
              <span className="text-white/90">{rival2.emoji} {rival2.displayName}</span>
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
