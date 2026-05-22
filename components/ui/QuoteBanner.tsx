'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MOTIVATIONAL_QUOTES } from '@/lib/constants';

export default function QuoteBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx(i => (i + 1) % MOTIVATIONAL_QUOTES.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-5 overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="text-xs text-white/35 italic text-center font-body px-2 truncate max-w-xs sm:max-w-md"
        >
          &ldquo;{MOTIVATIONAL_QUOTES[idx]}&rdquo;
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
