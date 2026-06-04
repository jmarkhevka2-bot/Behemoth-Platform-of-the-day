'use client';

import { useState, useEffect, useMemo } from 'react';
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

type Stage = 'select' | 'ceremony' | 'multi-select' | 'multi-ceremony';

export default function POTDCeremony({ onClose }: Props) {
  const { state, dispatch } = useAppState();
  const sorted = useSortedByDailyPoints();
  const { playPOTD } = useSound();
  const [stage, setStage]     = useState<Stage>('select');
  const [winner, setWinner]   = useState<Associate | null>(null);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());

  // Single winner ceremony effects
  useEffect(() => {
    if (stage !== 'ceremony' || !winner) return;
    const t1 = setTimeout(() => playPOTD(), 600);
    const t2 = setTimeout(() => {
      confetti({ particleCount: 180, spread: 120, origin: { y: 0.4 }, colors: ['#B08C1E', '#C9A840', '#F5D76E', '#1C1917', '#DDD9D2'] });
      confetti({ particleCount: 80, angle: 60,  spread: 80, origin: { x: 0, y: 0.5 }, colors: ['#B08C1E', '#C9A840'] });
      confetti({ particleCount: 80, angle: 120, spread: 80, origin: { x: 1, y: 0.5 }, colors: ['#B08C1E', '#C9A840'] });
    }, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [stage, winner, playPOTD]);

  // Multi-winner ceremony effects
  useEffect(() => {
    if (stage !== 'multi-ceremony') return;
    const t1 = setTimeout(() => playPOTD(), 400);
    const t2 = setTimeout(() => {
      confetti({ particleCount: 200, spread: 160, origin: { y: 0.4 }, colors: ['#B08C1E', '#C9A840', '#F5D76E'] });
      confetti({ particleCount: 100, angle: 60,  spread: 90, origin: { x: 0, y: 0.5 }, colors: ['#B08C1E', '#C9A840'] });
      confetti({ particleCount: 100, angle: 120, spread: 90, origin: { x: 1, y: 0.5 }, colors: ['#B08C1E', '#C9A840'] });
    }, 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [stage, playPOTD]);

  function handleCrown(a: Associate) { setWinner(a); setStage('ceremony'); }

  function handleConfirmWinner() {
    if (!winner) return;
    dispatch({ type: 'CROWN_POTD', associateId: winner.id });
    onClose();
  }

  function handleConfirmMulti() {
    if (multiSelected.size === 0) return;
    dispatch({ type: 'CROWN_MULTI_POTD', associateIds: Array.from(multiSelected) });
    setStage('multi-ceremony');
  }

  function handleMultiToggle(id: string) {
    setMultiSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  }

  const multiSelectedAssociates = useMemo(() =>
    state.associates.filter(a => multiSelected.has(a.id)),
    [state.associates, multiSelected]
  );

  const nameLetters  = winner ? winner.displayName.split('') : [];
  const topScorers   = sorted.filter(a => a.dailyPoints > 0).slice(0, 10);
  const zeroScorers  = sorted.filter(a => a.dailyPoints === 0);
  const allAssociates = [...sorted];

  const cardCls = (isSelected: boolean) => `
    p-2 bg-[var(--bg-card)] border rounded-xl text-center cursor-pointer transition-all select-none
    ${isSelected
      ? 'border-[var(--accent-gold)] potd-selected-glow'
      : 'border-[var(--border)] hover:border-[var(--accent-gold)]/40'}
  `;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]">
      <AnimatePresence mode="wait">

        {/* ── SELECT STAGE ── */}
        {stage === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-heading text-[var(--text-primary)] text-2xl tracking-wide">PLATFORM OF THE DAY</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStage('multi-select')}
                  className="px-3 py-1.5 text-xs font-heading rounded-lg border border-[var(--accent-gold)]/50 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"
                  title="Award POTD to multiple associates at once"
                >
                  ⚡ Multi-Award
                </button>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">✕</button>
              </div>
            </div>
            <p className="text-[var(--text-muted)] text-xs font-body mb-4">Sorted by today&apos;s points. You choose the winner.</p>

            <div className="flex-1 overflow-y-auto space-y-1.5 pb-2">
              {topScorers.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-3 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-sm">
                  <span className="font-heading text-sm w-5 text-right text-[var(--text-hint)] flex-shrink-0">{i + 1}</span>
                  <span className="text-xl leading-none">{a.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-[var(--text-primary)] text-sm">{a.displayName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--accent-blue)] font-heading">+{a.dailyPoints}</span>
                      <TierBadge tier={a.currentTier} size="xs" />
                    </div>
                  </div>
                  <button onClick={() => handleCrown(a)}
                    className="px-3 py-1.5 bg-[var(--accent-gold)] text-white font-heading text-xs rounded-xl hover:opacity-90 transition-all flex-shrink-0">
                    👑 Crown
                  </button>
                </motion.div>
              ))}
              {topScorers.length === 0 && (
                <p className="text-[var(--text-muted)] text-center font-body py-8 text-sm">No points awarded today yet</p>
              )}
            </div>

            {zeroScorers.length > 0 && (
              <>
                <p className="text-[var(--text-hint)] text-[10px] font-body text-center mt-2 mb-1.5">Or crown from full crew:</p>
                <div className="grid grid-cols-5 gap-1 max-h-24 overflow-y-auto">
                  {zeroScorers.map(a => (
                    <button key={a.id} onClick={() => handleCrown(a)}
                      className="p-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-center hover:bg-[var(--bg-secondary)] transition-colors"
                      title={a.displayName}>
                      <span className="text-lg leading-none">{a.emoji}</span>
                      <p className="text-[9px] text-[var(--text-muted)] font-body truncate mt-0.5">{a.displayName}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── MULTI-SELECT STAGE ── */}
        {stage === 'multi-select' && (
          <motion.div key="multi-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-[var(--text-primary)] text-xl tracking-wide">MULTI-AWARD MODE</h2>
                  <p className="text-[var(--text-muted)] text-xs font-body mt-0.5">Select all POTD recipients for this shift</p>
                </div>
                <button onClick={() => setStage('select')}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">✕</button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {allAssociates.map(a => {
                  const isSelected = multiSelected.has(a.id);
                  return (
                    <div key={a.id} className={cardCls(isSelected)} onClick={() => handleMultiToggle(a.id)}>
                      {/* Checkmark */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mx-auto mb-1 transition-all ${
                        isSelected ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)]' : 'border-[var(--border)] bg-transparent'
                      }`}>
                        {isSelected && <span className="text-white text-[8px] font-bold">👑</span>}
                      </div>
                      <span className="text-2xl leading-none block">{a.emoji}</span>
                      <p className="text-[10px] text-[var(--text-primary)] font-body truncate mt-1">{a.displayName}</p>
                      {a.dailyPoints > 0 && (
                        <p className="text-[9px] text-[var(--accent-blue)] font-heading">+{a.dailyPoints}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating confirm bar */}
            <div className="flex-shrink-0 p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  {multiSelected.size > 0 ? (
                    <p className="text-sm font-body text-[var(--text-primary)]">
                      <span className="font-heading text-[var(--accent-gold)]">{multiSelected.size}</span>
                      {' '}associate{multiSelected.size !== 1 ? 's' : ''} selected
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] font-body">Tap cards to select</p>
                  )}
                  {multiSelected.size > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {multiSelectedAssociates.slice(0, 6).map(a => (
                        <span key={a.id} className="text-base leading-none">{a.emoji}</span>
                      ))}
                      {multiSelected.size > 6 && <span className="text-[10px] text-[var(--text-muted)] self-center">+{multiSelected.size - 6}</span>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {multiSelected.size > 0 && (
                    <button onClick={() => setMultiSelected(new Set())}
                      className="px-3 py-2 border border-[var(--border)] text-[var(--text-secondary)] text-xs font-body rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                      Clear
                    </button>
                  )}
                  <button onClick={handleConfirmMulti} disabled={multiSelected.size === 0}
                    className="px-4 py-2 bg-[var(--accent-gold)] text-white font-heading text-sm rounded-xl disabled:opacity-40 hover:opacity-90 transition-all">
                    Award +5pts to {multiSelected.size || '?'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SINGLE CEREMONY STAGE ── */}
        {stage === 'ceremony' && (
          <motion.div key="ceremony" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            {/* Spotlight */}
            <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
              style={{ transformOrigin: 'top center' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-72 pointer-events-none">
              <div className="w-full h-full"
                style={{ background: 'linear-gradient(180deg, rgba(176,140,30,0.15) 0%, transparent 100%)', clipPath: 'polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)' }} />
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="font-heading text-[var(--accent-gold)] text-sm tracking-[0.35em] mb-5">PLATFORM OF THE DAY</motion.p>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.45, type: 'spring', stiffness: 200, damping: 14 }}
              className="text-7xl mb-4 block leading-none">{winner?.emoji}</motion.span>

            {/* Letter reveal */}
            <div className="flex justify-center flex-wrap gap-0 mb-3">
              {nameLetters.map((ch, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 + i * 0.055 }}
                  className="font-heading text-[var(--text-primary)] text-5xl sm:text-6xl leading-none"
                  style={{ display: ch === ' ' ? 'inline-block' : undefined, width: ch === ' ' ? '0.35em' : undefined }}>
                  {ch}
                </motion.span>
              ))}
            </div>

            {winner && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                className="flex items-center gap-2 justify-center mb-6">
                <TierBadge tier={winner.currentTier} size="sm" showLabel />
                <span className="text-[var(--text-muted)] text-xs font-body">{winner.dailyPoints} pts today</span>
              </motion.div>
            )}

            {/* Runners up */}
            {sorted.filter(a => a.id !== winner?.id && a.dailyPoints > 0).slice(0, 2).length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mb-7">
                <p className="text-[var(--text-hint)] text-[10px] font-body mb-2 tracking-wider">RUNNERS UP</p>
                <div className="flex gap-5 justify-center">
                  {sorted.filter(a => a.id !== winner?.id && a.dailyPoints > 0).slice(0, 2).map(a => (
                    <div key={a.id} className="text-center">
                      <span className="text-2xl block leading-none mb-1">{a.emoji}</span>
                      <p className="text-[var(--text-secondary)] text-xs font-body">{a.displayName}</p>
                      <p className="text-[var(--accent-blue)] text-xs font-heading">+{a.dailyPoints}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="flex gap-3">
              <button onClick={() => setStage('select')}
                className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] text-sm font-body rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                ← Change
              </button>
              <button onClick={handleConfirmWinner}
                className="px-8 py-2.5 bg-[#1C1917] text-white font-heading text-base rounded-xl hover:bg-[#2C2420] transition-colors">
                CONFIRM 👑
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ── MULTI CEREMONY STAGE ── */}
        {stage === 'multi-ceremony' && (
          <motion.div key="multi-ceremony" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            {/* Spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-80 pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(201,168,64,0.2) 0%, transparent 100%)', clipPath: 'polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)' }} />

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="font-heading text-[var(--accent-gold)] text-sm tracking-[0.35em] mb-6">PLATFORM OF THE DAY</motion.p>

            {/* Names reveal — staggered */}
            <div className="relative z-10 mb-6 space-y-2 max-h-64 overflow-y-auto px-4">
              {multiSelectedAssociates.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 300, damping: 28 }}
                  className="flex items-center justify-center gap-3">
                  <span className="text-3xl leading-none">{a.emoji}</span>
                  <span className="font-heading text-[var(--text-primary)] text-3xl sm:text-4xl">{a.displayName}</span>
                  <TierBadge tier={a.currentTier} size="sm" />
                </motion.div>
              ))}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + multiSelectedAssociates.length * 0.12 + 0.3 }}
              className="text-[var(--text-muted)] text-sm font-body mb-8">
              {multiSelectedAssociates.length} Platform{multiSelectedAssociates.length !== 1 ? 's' : ''} of the Day · +{state.settings.pointValues.potd ?? 5} pts each
            </motion.p>

            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + multiSelectedAssociates.length * 0.12 + 0.8 }}
              onClick={onClose}
              className="px-10 py-3 bg-[#1C1917] text-white font-heading text-base rounded-xl hover:bg-[#2C2420] transition-colors">
              DONE 👑
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
