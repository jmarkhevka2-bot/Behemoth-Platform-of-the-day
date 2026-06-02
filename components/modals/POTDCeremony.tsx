'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppState } from '@/lib/hooks/useAppState';
import { useSortedByDailyPoints } from '@/lib/hooks/useAppState';
import { useSound } from '@/lib/hooks/useSound';
import type { Associate } from '@/lib/types';
import TierBadge from '@/components/ui/TierBadge';

interface Props {
  onClose: () => void;
}

type Stage = 'select' | 'ceremony';

export default function POTDCeremony({ onClose }: Props) {
  const { dispatch } = useAppState();
  const sorted = useSortedByDailyPoints();
  const { playPOTD } = useSound();
  const [stage, setStage] = useState<Stage>('select');
  const [winner, setWinner] = useState<Associate | null>(null);

  function handleCrown(a: Associate) {
    setWinner(a);
    setStage('ceremony');
  }

  useEffect(() => {
    if (stage !== 'ceremony' || !winner) return;
    const t1 = setTimeout(() => playPOTD(), 600);
    const t2 = setTimeout(() => {
      confetti({ particleCount: 180, spread: 120, origin: { y: 0.4 }, colors: ['#B08C1E', '#C9A840', '#F5D76E', '#1C1917', '#DDD9D2'] });
      confetti({ particleCount: 80, angle: 60, spread: 80, origin: { x: 0, y: 0.5 }, colors: ['#B08C1E', '#C9A840'] });
      confetti({ particleCount: 80, angle: 120, spread: 80, origin: { x: 1, y: 0.5 }, colors: ['#B08C1E', '#C9A840'] });
    }, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [stage, winner, playPOTD]);

  function handleConfirmWinner() {
    if (!winner) return;
    dispatch({ type: 'CROWN_POTD', associateId: winner.id });
    onClose();
  }

  const nameLetters = winner ? winner.displayName.split('') : [];
  const topScorers = sorted.filter(a => a.dailyPoints > 0).slice(0, 10);
  const zeroScorers = sorted.filter(a => a.dailyPoints === 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#F5F3EE]"
    >
      <AnimatePresence mode="wait">
        {stage === 'select' ? (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-heading text-[#1C1917] text-2xl tracking-wide">PLATFORM OF THE DAY</h2>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#A8A29E] hover:text-[#6B6560] hover:bg-white transition-colors">✕</button>
            </div>
            <p className="text-[#A8A29E] text-xs font-body mb-4">Sorted by today&apos;s points. You choose the winner.</p>

            <div className="flex-1 overflow-y-auto space-y-1.5 pb-2">
              {topScorers.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-3 py-2.5 bg-white border border-[#DDD9D2] rounded-xl shadow-sm"
                >
                  <span className="font-heading text-sm w-5 text-right text-[#C4BEB8] flex-shrink-0">{i + 1}</span>
                  <span className="text-xl leading-none">{a.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-[#1C1917] text-sm">{a.displayName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#3B78B8] font-heading">+{a.dailyPoints}</span>
                      <TierBadge tier={a.currentTier} size="xs" />
                    </div>
                  </div>
                  <button
                    onClick={() => handleCrown(a)}
                    className="px-3 py-1.5 bg-[#B08C1E] text-white font-heading text-xs rounded-xl hover:bg-[#9A7A18] transition-colors flex-shrink-0"
                  >
                    👑 Crown
                  </button>
                </motion.div>
              ))}

              {topScorers.length === 0 && (
                <p className="text-[#A8A29E] text-center font-body py-8 text-sm">No points awarded today yet</p>
              )}
            </div>

            {zeroScorers.length > 0 && (
              <>
                <p className="text-[#C4BEB8] text-[10px] font-body text-center mt-2 mb-1.5">Or crown from full crew:</p>
                <div className="grid grid-cols-5 gap-1 max-h-24 overflow-y-auto">
                  {zeroScorers.map(a => (
                    <button
                      key={a.id}
                      onClick={() => handleCrown(a)}
                      className="p-1.5 bg-white border border-[#DDD9D2] rounded-lg text-center hover:bg-[#F5F3EE] transition-colors"
                      title={a.displayName}
                    >
                      <span className="text-lg leading-none">{a.emoji}</span>
                      <p className="text-[9px] text-[#A8A29E] font-body truncate mt-0.5">{a.displayName}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="ceremony"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden"
          >
            {/* Subtle spotlight */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
              style={{ transformOrigin: 'top center' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-72 pointer-events-none"
            >
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(180deg, rgba(176,140,30,0.15) 0%, transparent 100%)',
                  clipPath: 'polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)',
                }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="font-heading text-[#B08C1E] text-sm tracking-[0.35em] mb-5"
            >
              PLATFORM OF THE DAY
            </motion.p>

            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 200, damping: 14 }}
              className="text-7xl mb-4 block leading-none"
            >
              {winner?.emoji}
            </motion.span>

            {/* Letter-by-letter name */}
            <div className="flex justify-center flex-wrap gap-0 mb-3">
              {nameLetters.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.055 }}
                  className="font-heading text-[#1C1917] text-5xl sm:text-6xl leading-none"
                  style={{ display: ch === ' ' ? 'inline-block' : undefined, width: ch === ' ' ? '0.35em' : undefined }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            {winner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="flex items-center gap-2 justify-center mb-6"
              >
                <TierBadge tier={winner.currentTier} size="sm" showLabel />
                <span className="text-[#A8A29E] text-xs font-body">{winner.dailyPoints} pts today</span>
              </motion.div>
            )}

            {/* Runners up */}
            {sorted.filter(a => a.id !== winner?.id && a.dailyPoints > 0).slice(0, 2).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="mb-7"
              >
                <p className="text-[#C4BEB8] text-[10px] font-body mb-2 tracking-wider">RUNNERS UP</p>
                <div className="flex gap-5 justify-center">
                  {sorted.filter(a => a.id !== winner?.id && a.dailyPoints > 0).slice(0, 2).map(a => (
                    <div key={a.id} className="text-center">
                      <span className="text-2xl block leading-none mb-1">{a.emoji}</span>
                      <p className="text-[#6B6560] text-xs font-body">{a.displayName}</p>
                      <p className="text-[#3B78B8] text-xs font-heading">+{a.dailyPoints}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9 }}
              className="flex gap-3"
            >
              <button
                onClick={() => setStage('select')}
                className="px-4 py-2 border border-[#DDD9D2] text-[#6B6560] text-sm font-body rounded-xl hover:bg-white transition-colors"
              >
                ← Change
              </button>
              <button
                onClick={handleConfirmWinner}
                className="px-8 py-2.5 bg-[#1C1917] text-white font-heading text-base rounded-xl hover:bg-[#2C2420] transition-colors"
              >
                CONFIRM 👑
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
