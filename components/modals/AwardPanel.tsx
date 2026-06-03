'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import { useAssociateById } from '@/lib/hooks/useAppState';
import { useSound } from '@/lib/hooks/useSound';
import { REASON_TAG_META } from '@/lib/constants';
import { getTier, getNextTierConfig } from '@/lib/utils/tiers';
import type { ReasonTag } from '@/lib/types';
import TierBadge from '@/components/ui/TierBadge';

interface Props {
  targetId: string;
  onClose: () => void;
}

const REASON_TAGS = Object.keys(REASON_TAG_META) as ReasonTag[];
type Mode = 'award' | 'deduct';

export default function AwardPanel({ targetId, onClose }: Props) {
  const { state, dispatch } = useAppState();
  const associate = useAssociateById(targetId);
  const { playAward } = useSound();

  const [mode, setMode]               = useState<Mode>('award');
  const [selectedTag, setSelectedTag] = useState<ReasonTag | 'custom' | null>(null);
  const [customNote, setCustomNote]   = useState('');
  const [customPts, setCustomPts]     = useState(1);
  const [deductPts, setDeductPts]     = useState(1);
  const [deductReason, setDeductReason] = useState('');
  const [confirming, setConfirming]   = useState(false);

  if (!associate) return null;

  // Block awards outside shift hours
  if (!state.shift.active) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          className="w-full sm:max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl text-center">
          <p className="text-3xl mb-3">⏰</p>
          <p className="font-heading text-[var(--text-primary)] text-lg mb-1">Shift Not Active</p>
          <p className="text-[var(--text-muted)] font-body text-sm mb-4">Awards are only available between 10:00 AM and 10:00 PM ET.</p>
          <button onClick={onClose}
            className="px-6 py-2.5 bg-[#1C1917] text-white font-heading text-sm rounded-xl hover:bg-[#2C2420] transition-colors">
            Got it
          </button>
        </motion.div>
      </motion.div>
    );
  }

  const ptValue   = selectedTag === 'custom' ? customPts : selectedTag ? (state.settings.pointValues[selectedTag] ?? 1) : 0;
  const newTotal  = associate.seasonPoints + ptValue;
  const newTier   = selectedTag ? getTier(newTotal, state.settings.tiers) : associate.currentTier;
  const tierUnlock = newTier !== associate.currentTier;
  const nextTier  = getNextTierConfig(newTotal, state.settings.tiers);

  function handleConfirmAward() {
    if (!selectedTag || confirming) return;
    setConfirming(true);
    const reason = selectedTag === 'custom' ? customNote || 'Custom award' : REASON_TAG_META[selectedTag].label;
    dispatch({ type: 'AWARD_POINTS', associateId: targetId, points: ptValue, reasonTag: selectedTag, reason, note: customNote || undefined });
    playAward();
    setTimeout(() => { setConfirming(false); onClose(); }, 400);
  }
  function handleConfirmDeduct() {
    if (confirming) return;
    setConfirming(true);
    dispatch({ type: 'DEDUCT_POINTS', associateId: targetId, points: deductPts, reason: deductReason || 'Manual deduction' });
    setTimeout(() => { setConfirming(false); onClose(); }, 400);
  }

  const panelCls = 'w-full sm:max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl';
  const reasonBtnBase = 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all';
  const selectedCls   = 'border-[#1C1917] bg-[#1C1917] text-white';
  const idleCls       = 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-hint)] hover:bg-[var(--bg-card)]';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }} className={panelCls}>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{associate.emoji}</span>
            <div>
              <p className="font-body font-semibold text-[var(--text-primary)] text-lg leading-tight">{associate.displayName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-[var(--text-muted)] font-body">{associate.seasonPoints} pts</span>
                <TierBadge tier={associate.currentTier} size="xs" showLabel />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors text-lg">✕</button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl mb-4">
          <button onClick={() => { setMode('award'); setSelectedTag(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-heading transition-colors ${mode === 'award' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
            + AWARD
          </button>
          <button onClick={() => { setMode('deduct'); setSelectedTag(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-heading transition-colors ${mode === 'deduct' ? 'bg-[var(--bg-card)] text-red-500 shadow-sm' : 'text-[var(--text-muted)]'}`}>
            − DEDUCT
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'award' ? (
            <motion.div key="award" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {REASON_TAGS.map(tag => {
                  const meta = REASON_TAG_META[tag];
                  const pts = state.settings.pointValues[tag] ?? 1;
                  const isSelected = selectedTag === tag;
                  return (
                    <button key={tag} onClick={() => setSelectedTag(tag)} className={`${reasonBtnBase} ${isSelected ? selectedCls : idleCls}`}>
                      <span className="text-lg flex-shrink-0 leading-none">{meta.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-body leading-tight truncate">{meta.label}</p>
                        <p className={`text-sm font-heading leading-none mt-0.5 ${isSelected ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'}`}>+{pts}</p>
                      </div>
                    </button>
                  );
                })}
                <button onClick={() => setSelectedTag('custom')} className={`${reasonBtnBase} col-span-2 ${selectedTag === 'custom' ? selectedCls : idleCls}`}>
                  <span className="text-lg leading-none">✏️</span>
                  <div>
                    <p className="text-xs font-body">Custom Award</p>
                    <p className={`text-[10px] font-body mt-0.5 ${selectedTag === 'custom' ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>Set your own reason & points</p>
                  </div>
                </button>
              </div>

              <AnimatePresence>
                {selectedTag === 'custom' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-2">
                    <div className="flex gap-2 pt-1">
                      <input type="text" value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="Reason (optional)"
                        className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-body outline-none focus:border-[var(--accent-gold)]/50 placeholder:text-[var(--text-hint)] transition-colors" />
                      <div className="flex items-center gap-1">
                        <button onClick={() => setCustomPts(Math.max(1, customPts - 1))} className="w-9 h-9 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors font-heading text-base">−</button>
                        <span className="w-8 text-center font-heading text-[var(--accent-gold)] text-lg">{customPts}</span>
                        <button onClick={() => setCustomPts(Math.min(20, customPts + 1))} className="w-9 h-9 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors font-heading text-base">+</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedTag && selectedTag !== 'custom' && (
                <div className="mb-2">
                  <input type="text" value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="Optional note..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-body outline-none focus:border-[var(--accent-gold)]/50 placeholder:text-[var(--text-hint)] transition-colors" />
                </div>
              )}

              <AnimatePresence>
                {selectedTag && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div><p className="text-[10px] text-[var(--text-muted)] font-body mb-0.5">New total</p><p className="font-heading text-[var(--accent-gold)] text-2xl leading-none">{newTotal}</p></div>
                      <div className="text-right"><p className="text-[10px] text-[var(--text-muted)] font-body mb-0.5">Awarding</p><p className="font-heading text-[var(--text-primary)] text-xl leading-none">+{ptValue}</p></div>
                    </div>
                    {tierUnlock ? (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-[var(--accent-gold)] font-body text-center">🎉 Will unlock {newTier.toUpperCase()} tier</motion.p>
                    ) : nextTier ? (
                      <p className="text-[10px] text-[var(--text-muted)] font-body text-center mt-1.5">{nextTier.threshold - newTotal} pts to {nextTier.label}</p>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={handleConfirmAward} disabled={!selectedTag}
                className={`w-full py-3 rounded-xl font-heading text-base transition-all ${selectedTag ? 'bg-[#1C1917] text-white hover:bg-[#2C2420] active:scale-[0.98]' : 'bg-[var(--bg-secondary)] text-[var(--text-hint)] cursor-not-allowed border border-[var(--border)]'}`}>
                {confirming ? '✓ AWARDED!' : selectedTag ? `AWARD +${ptValue} PTS` : 'SELECT A REASON'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="deduct" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-4 px-4 py-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-[10px] text-red-400 font-body mb-3 uppercase tracking-wider">Points to remove</p>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setDeductPts(Math.max(1, deductPts - 1))} className="w-11 h-11 bg-white border border-red-200 rounded-xl text-red-500 hover:bg-red-100 transition-colors font-heading text-xl">−</button>
                  <span className="w-14 text-center font-heading text-red-600 text-4xl leading-none">{deductPts}</span>
                  <button onClick={() => setDeductPts(Math.min(associate.seasonPoints || 20, deductPts + 1))} className="w-11 h-11 bg-white border border-red-200 rounded-xl text-red-500 hover:bg-red-100 transition-colors font-heading text-xl">+</button>
                </div>
                <p className="text-center text-xs text-red-400 font-body mt-2">{associate.seasonPoints} → {Math.max(0, associate.seasonPoints - deductPts)} season pts</p>
              </div>
              <div className="mb-4">
                <input type="text" value={deductReason} onChange={e => setDeductReason(e.target.value)} placeholder="Reason (optional)"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-body outline-none focus:border-red-300 placeholder:text-[var(--text-hint)] transition-colors" />
              </div>
              <button onClick={handleConfirmDeduct} disabled={confirming}
                className="w-full py-3 rounded-xl font-heading text-base bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-60">
                {confirming ? '✓ DEDUCTED' : `DEDUCT −${deductPts} PTS`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
