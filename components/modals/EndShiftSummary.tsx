'use client';

import { motion } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import { exportToCSV, exportToJSON } from '@/lib/utils/export';
import { formatDuration, formatTimestamp } from '@/lib/utils/dates';
import { REASON_TAG_META } from '@/lib/constants';
import TierBadge from '@/components/ui/TierBadge';

interface Props {
  onClose:    () => void;
  onStartNew: () => void;
}

export default function EndShiftSummary({ onClose }: Props) {
  const { state, dispatch } = useAppState();
  const data = state.lastEndShiftData;
  if (!data) return null;

  const byAssociate = data.awards.reduce<Record<string, { name: string; emoji: string; points: number; count: number }>>((acc, ev) => {
    if (ev.points <= 0) return acc;
    const a = state.associates.find(x => x.id === ev.associateId);
    if (!a) return acc;
    if (!acc[ev.associateId]) acc[ev.associateId] = { name: a.displayName, emoji: a.emoji, points: 0, count: 0 };
    acc[ev.associateId].points += ev.points;
    acc[ev.associateId].count  += 1;
    return acc;
  }, {});

  const topMovers = Object.values(byAssociate).sort((a, b) => b.points - a.points).slice(0, 5);
  const rival     = data.rivalResult;

  function handleClose() { dispatch({ type: 'RESET_DAILY' }); onClose(); }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading text-[var(--text-primary)] text-xl tracking-wide">SHIFT COMPLETE</h2>
            <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">✕</button>
          </div>
          <div className="flex gap-3 text-xs font-body text-[var(--text-muted)]">
            <span>{data.date}</span><span>·</span><span>{formatDuration(data.shiftDuration)}</span><span>·</span><span>{data.awards.length} awards</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* POTD winner or skipped note */}
          {data.potdWinnerSnapshot ? (
            <div className="tier-gold shimmer-overlay rounded-xl p-4 flex items-center gap-3">
              <span className="text-3xl leading-none">{data.potdWinnerSnapshot.emoji}</span>
              <div>
                <p className="text-[10px] text-black/40 font-body mb-0.5">Platform of the Day</p>
                <p className="font-body font-semibold text-black text-xl leading-tight">{data.potdWinnerSnapshot.displayName}</p>
                <TierBadge tier={data.potdWinnerSnapshot.currentTier} size="sm" showLabel />
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-center">
              <p className="text-[var(--text-hint)] font-body text-sm">No POTD crowned today</p>
            </div>
          )}

          {/* Rivalry result */}
          {rival && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4">
              <p className="text-[10px] text-[var(--text-muted)] font-heading tracking-widest mb-3">⚔️ RIVALRY RESULT</p>
              <div className="flex items-center justify-between gap-4">
                {[
                  { id: rival.id1, name: rival.name1, emoji: rival.emoji1, pts: rival.pts1 },
                  { id: rival.id2, name: rival.name2, emoji: rival.emoji2, pts: rival.pts2 },
                ].map((r, i) => {
                  const isWinner = rival.winnerId === r.id;
                  return (
                    <div key={r.id} className={`flex-1 text-center ${i === 0 ? 'text-left' : 'text-right'}`}>
                      <span className="text-3xl leading-none block">{r.emoji}</span>
                      <p className={`font-body font-semibold text-sm mt-1 ${isWinner ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)]'}`}>{r.name}</p>
                      <p className={`font-heading text-2xl leading-none mt-0.5 ${isWinner ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)]'}`}>+{r.pts}</p>
                    </div>
                  );
                })}
                <div className="text-center flex-shrink-0 px-2">
                  <span className="text-xl">⚔️</span>
                  {rival.tied ? (
                    <p className="text-[10px] text-[var(--text-hint)] font-body mt-1">TIE<br/>+2 each</p>
                  ) : (
                    <p className="text-[10px] text-[var(--accent-gold)] font-body mt-1">WINNER<br/>+3 pts</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Pts Given',  value: data.totalPointsGiven,          color: 'text-[var(--accent-gold)]' },
              { label: 'Awards',     value: data.awards.length,             color: 'text-[var(--accent-blue)]' },
              { label: 'Operators',  value: Object.keys(byAssociate).length, color: 'text-[var(--text-secondary)]' },
            ].map(s => (
              <div key={s.label} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-3 text-center">
                <p className={`font-heading text-2xl leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-body mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Top performers */}
          {topMovers.length > 0 && (
            <div>
              <p className="text-[10px] text-[var(--text-muted)] font-body mb-2 uppercase tracking-wider">Top Performers</p>
              <div className="space-y-1">
                {topMovers.map((m, i) => (
                  <motion.div key={m.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2.5 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl">
                    <span className="font-heading text-xs text-[var(--text-hint)] w-4">{i + 1}</span>
                    <span className="text-lg leading-none">{m.emoji}</span>
                    <span className="flex-1 font-body text-sm text-[var(--text-secondary)]">{m.name}</span>
                    <span className="font-heading text-[var(--accent-gold)] text-sm">+{m.points}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-body">{m.count}×</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All awards (collapsible) */}
          {data.awards.length > 0 && (
            <details>
              <summary className="text-[10px] text-[var(--text-muted)] cursor-pointer font-body hover:text-[var(--text-secondary)] transition-colors select-none py-1">
                View all {data.awards.length} awards
              </summary>
              <div className="mt-2 space-y-1 max-h-44 overflow-y-auto">
                {data.awards.map(ev => {
                  const a    = state.associates.find(x => x.id === ev.associateId);
                  const meta = ev.reasonTag !== 'custom' ? REASON_TAG_META[ev.reasonTag] : null;
                  return (
                    <div key={ev.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-xs">
                      <span className="leading-none">{meta?.emoji ?? '✏️'}</span>
                      <span className="text-[var(--text-secondary)] font-body">{a?.displayName ?? '—'}</span>
                      <span className="flex-1 text-[var(--text-muted)] font-body truncate">{ev.reason}</span>
                      <span className="text-[var(--accent-gold)] font-heading">+{ev.points}</span>
                      <span className="text-[var(--text-hint)] font-body">{formatTimestamp(ev.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            </details>
          )}

          {/* Export */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => exportToCSV(state.associates)}
              className="py-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-body rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors">Export CSV</button>
            <button onClick={() => exportToJSON(state)}
              className="py-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-body rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors">Export JSON</button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border-subtle)]">
          <button onClick={handleClose}
            className="w-full py-2.5 bg-[#1C1917] text-white font-heading text-sm rounded-xl hover:bg-[#2C2420] transition-colors">
            Close Summary
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
