'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import { useSound } from '@/lib/hooks/useSound';
import { REASON_TAG_META } from '@/lib/constants';
import type { ReasonTag } from '@/lib/types';

interface Props {
  targetIds: string[];
  onClose: () => void;
}

const REASON_TAGS = Object.keys(REASON_TAG_META) as ReasonTag[];

export default function BulkAwardPanel({ targetIds, onClose }: Props) {
  const { state, dispatch } = useAppState();
  const { playAward } = useSound();
  const [selectedTag, setSelectedTag] = useState<ReasonTag | 'custom' | null>(null);
  const [customNote, setCustomNote]   = useState('');
  const [customPts, setCustomPts]     = useState(1);
  const [confirming, setConfirming]   = useState(false);

  const associates = state.associates.filter(a => targetIds.includes(a.id));
  const ptValue    = selectedTag === 'custom' ? customPts : selectedTag ? (state.settings.pointValues[selectedTag] ?? 1) : 0;
  const totalPts   = ptValue * targetIds.length;

  function handleConfirm() {
    if (!selectedTag || confirming) return;
    setConfirming(true);
    const reason = selectedTag === 'custom' ? customNote || 'Custom award' : REASON_TAG_META[selectedTag].label;
    targetIds.forEach(id => {
      dispatch({ type: 'AWARD_POINTS', associateId: id, points: ptValue, reasonTag: selectedTag as ReasonTag | 'custom', reason, note: customNote || undefined });
    });
    playAward();
    setTimeout(() => { setConfirming(false); onClose(); }, 400);
  }

  const reasonBtnBase = 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all';
  const selectedCls   = 'border-[#1C1917] bg-[#1C1917] text-white';
  const idleCls       = 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-hint)] hover:bg-[var(--bg-card)]';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="w-full sm:max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-heading text-[var(--text-primary)] text-lg leading-tight">Awarding {targetIds.length} operators</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {associates.slice(0, 8).map(a => (
                <span key={a.id} className="text-lg leading-none" title={a.displayName}>{a.emoji}</span>
              ))}
              {associates.length > 8 && (
                <span className="text-xs text-[var(--text-muted)] font-body self-center">+{associates.length - 8} more</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors text-lg">✕</button>
        </div>

        {/* Reason grid */}
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
                  <button onClick={() => setCustomPts(Math.max(1, customPts - 1))} className="w-9 h-9 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] font-heading text-base">−</button>
                  <span className="w-8 text-center font-heading text-[var(--accent-gold)] text-lg">{customPts}</span>
                  <button onClick={() => setCustomPts(Math.min(20, customPts + 1))} className="w-9 h-9 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] font-heading text-base">+</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedTag && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl">
              <div className="flex items-center justify-between">
                <div><p className="text-[10px] text-[var(--text-muted)] font-body mb-0.5">Per operator</p><p className="font-heading text-[var(--text-primary)] text-xl leading-none">+{ptValue}</p></div>
                <div className="text-right"><p className="text-[10px] text-[var(--text-muted)] font-body mb-0.5">Total points given</p><p className="font-heading text-[var(--accent-gold)] text-2xl leading-none">+{totalPts}</p></div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-body text-center mt-1.5">{ptValue} × {targetIds.length} operators = {totalPts} pts</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={handleConfirm} disabled={!selectedTag}
          className={`w-full py-3 rounded-xl font-heading text-base transition-all ${selectedTag ? 'bg-[#1C1917] text-white hover:bg-[#2C2420] active:scale-[0.98]' : 'bg-[var(--bg-secondary)] text-[var(--text-hint)] cursor-not-allowed border border-[var(--border)]'}`}>
          {confirming ? `✓ AWARDED ${targetIds.length} OPERATORS!` : selectedTag ? `AWARD +${ptValue} TO ${targetIds.length} OPERATORS` : 'SELECT A REASON'}
        </button>
      </motion.div>
    </motion.div>
  );
}
