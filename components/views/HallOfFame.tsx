'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import TierBadge from '@/components/ui/TierBadge';

export default function HallOfFame() {
  const { state } = useAppState();
  const { associates } = state;

  const legends    = useMemo(() => associates.filter(a => a.currentTier === 'legend').sort((a, b) => b.seasonPoints - a.seasonPoints), [associates]);
  const potdChamps = useMemo(() => [...associates].sort((a, b) => b.potdWins - a.potdWins).filter(a => a.potdWins > 0).slice(0, 10), [associates]);
  const topPoints  = useMemo(() => [...associates].sort((a, b) => b.seasonPoints - a.seasonPoints)[0], [associates]);
  const topStreak  = useMemo(() => [...associates].sort((a, b) => b.streak - a.streak)[0], [associates]);
  const totalSeasonPts = useMemo(() => associates.reduce((s, a) => s + a.seasonPoints, 0), [associates]);
  const totalPOTDs     = useMemo(() => associates.reduce((s, a) => s + a.potdWins, 0), [associates]);

  return (
    <div className="h-full overflow-y-auto px-3 py-4 space-y-6">

      {/* Legends Wall */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">👑</span>
          <h2 className="font-heading text-xs tracking-widest text-[var(--text-muted)]">BEHEMOTH LEGENDS</h2>
        </div>
        {legends.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 text-center shadow-sm">
            <p className="text-3xl mb-2 opacity-20">👑</p>
            <p className="text-[var(--text-muted)] font-body text-sm">No legends yet — 500 pts to enshrine.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {legends.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="tier-legend shimmer-overlay rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl leading-none">{a.emoji}</span>
                <div>
                  <p className="font-body font-semibold text-white text-lg leading-tight">{a.displayName} {a.lastName}</p>
                  <p className="text-white/70 text-xs font-body mt-0.5">{a.seasonPoints} pts · 👑 {a.potdWins}× POTD</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* POTD Champions */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🏆</span>
          <h2 className="font-heading text-xs tracking-widest text-[var(--text-muted)]">POTD CHAMPIONS</h2>
        </div>
        {potdChamps.length === 0 ? (
          <p className="text-[var(--text-muted)] font-body text-sm text-center py-4">No POTD wins recorded yet</p>
        ) : (
          <div className="space-y-1.5">
            {potdChamps.map((a, i) => (
              <div key={a.id}
                className="flex items-center gap-3 px-3 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] border-l-[3px] rounded-xl shadow-sm"
                style={{ borderLeftColor: i === 0 ? 'var(--accent-gold)' : 'var(--border)' }}>
                <span className="font-heading text-sm w-5 text-right text-[var(--text-hint)] flex-shrink-0">{i + 1}</span>
                <span className="text-xl leading-none">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-[var(--text-primary)] text-sm truncate">{a.displayName}</p>
                  <TierBadge tier={a.currentTier} size="xs" />
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-heading text-[var(--accent-gold)] text-lg leading-none">{a.potdWins}</p>
                  <p className="text-[9px] text-[var(--text-muted)] font-body">wins</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Season Records */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">📊</span>
          <h2 className="font-heading text-xs tracking-widest text-[var(--text-muted)]">SEASON RECORDS</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: topPoints?.emoji ?? '—', value: topPoints?.seasonPoints ?? 0, valueClass: 'text-[var(--accent-gold)]', label: 'Most season pts', name: topPoints?.displayName ?? '—' },
            { emoji: topStreak?.streak ? '🔥' : '—', value: topStreak?.streak ?? 0, valueClass: 'text-orange-500', label: 'Best active streak', name: topStreak?.streak ? topStreak.displayName : '—' },
          ].map((s, i) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl mb-1 leading-none">{s.emoji}</p>
              <p className={`font-heading text-xl leading-none ${s.valueClass}`}>{s.value}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-body mt-1.5">{s.label}</p>
              <p className="text-xs text-[var(--text-secondary)] font-body mt-1">{s.name}</p>
            </div>
          ))}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-center shadow-sm">
            <p className="font-heading text-[var(--accent-blue)] text-2xl leading-none">{totalSeasonPts}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-body mt-2">Total crew pts</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-center shadow-sm">
            <p className="font-heading text-[var(--accent-gold)] text-2xl leading-none">{totalPOTDs}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-body mt-2">POTD ceremonies</p>
          </div>
        </div>
      </section>

      {/* Tier Breakdown */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🎖️</span>
          <h2 className="font-heading text-xs tracking-widest text-[var(--text-muted)]">TIER BREAKDOWN</h2>
        </div>
        <div className="space-y-1.5">
          {(['legend','diamond','gold','silver','bronze'] as const).map(tier => {
            const count = associates.filter(a => a.currentTier === tier).length;
            return (
              <div key={tier} className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-sm">
                <TierBadge tier={tier} size="sm" showLabel />
                <div className="flex-1 bg-[var(--bg-secondary)] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full tier-${tier} rounded-full transition-all duration-500`}
                    style={{ width: `${associates.length ? (count / associates.length) * 100 : 0}%` }} />
                </div>
                <span className="font-heading text-[var(--text-secondary)] text-sm w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
