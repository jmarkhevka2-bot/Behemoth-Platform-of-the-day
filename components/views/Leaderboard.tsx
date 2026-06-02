'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import { useSortedLeaderboard } from '@/lib/hooks/useAppState';
import { REASON_TAG_META } from '@/lib/constants';
import { formatTimestamp } from '@/lib/utils/dates';
import LeaderboardCard from '@/components/ui/LeaderboardCard';
import type { AwardEvent } from '@/lib/types';

interface FeedEvent extends AwardEvent {
  associateName: string;
  associateEmoji: string;
}

interface Props {
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  isAdmin: boolean;
}

export default function Leaderboard({ onCardClick, onAwardClick, isAdmin }: Props) {
  const { state } = useAppState();
  const sorted    = useSortedLeaderboard();
  const topTen    = sorted.slice(0, 10);
  const rest      = sorted.slice(10);
  const [feedOpen, setFeedOpen] = useState(false);

  const tiedMap = useMemo(() => {
    const counts: Record<number, number> = {};
    sorted.forEach(a => { counts[a.seasonPoints] = (counts[a.seasonPoints] ?? 0) + 1; });
    return counts;
  }, [sorted]);

  const totalPts    = useMemo(() => state.associates.reduce((s, a) => s + a.seasonPoints, 0), [state.associates]);
  const tierHolders = useMemo(() => state.associates.filter(a => a.currentTier !== 'none').length, [state.associates]);
  const bestStreak  = useMemo(() => Math.max(...state.associates.map(a => a.streak), 0), [state.associates]);

  const todaysFeed = useMemo((): FeedEvent[] => {
    if (!state.shift.id) return [];
    return state.associates
      .flatMap(a => a.awardHistory
        .filter(e => e.shiftId === state.shift.id)
        .map((e): FeedEvent => ({ ...e, associateName: a.displayName, associateEmoji: a.emoji }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 30);
  }, [state.associates, state.shift.id]);

  return (
    <div className="h-full overflow-y-auto px-3 py-3 space-y-1.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] mb-2.5">
        <h2 className="font-heading text-xs tracking-widest text-[var(--text-muted)]">SEASON STANDINGS</h2>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[var(--text-hint)] font-body">{totalPts} total pts</span>
          <span className="text-[10px] text-[var(--text-hint)] font-body">{tierHolders} tier holders</span>
        </div>
      </div>

      {/* Top 10 */}
      <AnimatePresence mode="popLayout">
        {topTen.map((a, index) => (
          <motion.div key={a.id} layout layoutId={a.id}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}>
            <LeaderboardCard associate={a} rank={index + 1} onCardClick={onCardClick} onAwardClick={onAwardClick}
              isTied={a.seasonPoints > 0 && tiedMap[a.seasonPoints] > 1} isAdmin={isAdmin} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Remaining crew */}
      {rest.length > 0 && (
        <details className="mt-3">
          <summary className="text-[11px] text-[var(--text-muted)] cursor-pointer font-body py-1.5 hover:text-[var(--text-secondary)] transition-colors select-none">
            + {rest.length} more operators
          </summary>
          <div className="mt-2 space-y-1.5">
            {rest.map((a, index) => (
              <LeaderboardCard key={a.id} associate={a} rank={topTen.length + index + 1}
                onCardClick={onCardClick} onAwardClick={onAwardClick}
                isTied={a.seasonPoints > 0 && tiedMap[a.seasonPoints] > 1} isAdmin={isAdmin} />
            ))}
          </div>
        </details>
      )}

      {/* Season stats */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-heading text-[var(--accent-gold)] text-xl">{totalPts}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-body mt-0.5">Total Pts</p>
          </div>
          <div>
            <p className="font-heading text-[var(--accent-blue)] text-xl">{tierHolders}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-body mt-0.5">Tier Holders</p>
          </div>
          <div>
            <p className="font-heading text-[var(--text-primary)] text-xl">{bestStreak}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-body mt-0.5">Best Streak</p>
          </div>
        </div>
      </div>

      {/* Today's activity feed */}
      <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
        <button
          onClick={() => setFeedOpen(v => !v)}
          className="w-full flex items-center justify-between text-[11px] text-[var(--text-muted)] font-body hover:text-[var(--text-secondary)] transition-colors py-1 select-none"
        >
          <span className="font-heading tracking-widest text-[10px]">TODAY&apos;S ACTIVITY</span>
          <span className="flex items-center gap-1.5">
            {todaysFeed.length > 0 && (
              <span className="px-1.5 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-[10px]">
                {todaysFeed.length}
              </span>
            )}
            <span className={`transition-transform ${feedOpen ? 'rotate-180' : ''}`}>▾</span>
          </span>
        </button>
        <AnimatePresence>
          {feedOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              {todaysFeed.length === 0 ? (
                <p className="text-xs text-[var(--text-hint)] font-body py-3 text-center">No awards given yet this shift</p>
              ) : (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                  {todaysFeed.map(ev => {
                    const meta = ev.reasonTag !== 'custom' ? REASON_TAG_META[ev.reasonTag] : null;
                    const isDeduction = ev.points < 0;
                    return (
                      <div key={ev.id} className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs">
                        <span className="text-base leading-none flex-shrink-0">{ev.associateEmoji}</span>
                        <span className="text-[var(--text-secondary)] font-body flex-shrink-0">{ev.associateName}</span>
                        <span className="flex-1 text-[var(--text-muted)] font-body truncate">{meta?.emoji ?? '✏️'} {ev.reason}</span>
                        <span className={`font-heading flex-shrink-0 ${isDeduction ? 'text-red-500' : 'text-[var(--accent-gold)]'}`}>
                          {isDeduction ? ev.points : `+${ev.points}`}
                        </span>
                        <span className="text-[var(--text-hint)] font-body flex-shrink-0">{formatTimestamp(ev.timestamp)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
