'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import { useSortedLeaderboard } from '@/lib/hooks/useAppState';
import { REASON_TAG_META } from '@/lib/constants';
import { formatTimestamp } from '@/lib/utils/dates';
import { getNextTierConfig } from '@/lib/utils/tiers';
import type { AwardEvent } from '@/lib/types';
import PodiumCard from '@/components/leaderboard/PodiumCard';
import ChasingCard from '@/components/leaderboard/ChasingCard';
import PackRow from '@/components/leaderboard/PackRow';
import StatCard from '@/components/leaderboard/StatCard';
import SectionHeader from '@/components/leaderboard/SectionHeader';

interface FeedEvent extends AwardEvent {
  associateName: string;
  associateEmoji: string;
}

interface Props {
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  isAdmin: boolean;
}

export default function Leaderboard({
  onCardClick,
  onAwardClick,
  isAdmin,
}: Props) {
  const { state } = useAppState();
  const sorted = useSortedLeaderboard();
  const podium = sorted.slice(0, 3);
  const chasing = sorted.slice(3, 10);
  const pack = sorted.slice(10);
  const [feedOpen, setFeedOpen] = useState(false);

  const totalPts = useMemo(
    () => state.associates.reduce((s, a) => s + a.seasonPoints, 0),
    [state.associates]
  );
  const tierHolders = useMemo(
    () => {
      const tiers = new Set<string>();
      state.associates.forEach(a => {
        if (a.currentTier !== 'none') tiers.add(a.currentTier);
      });
      return tiers.size;
    },
    [state.associates]
  );
  const bestStreak = useMemo(
    () => Math.max(0, ...state.associates.map(a => a.streak)),
    [state.associates]
  );

  const feed = useMemo(() => {
    if (!state.shift.id) return [];
    return state.associates
      .flatMap((a) =>
        a.awardHistory
          .filter((e) => e.shiftId === state.shift.id)
          .map((e): FeedEvent => ({
            ...e,
            associateName: a.displayName,
            associateEmoji: a.emoji,
          }))
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 30);
  }, [state.associates, state.shift.id]);

  return (
    <div
      className="h-full overflow-y-auto px-4 py-4 space-y-6"
      aria-label="Leaderboard"
      role="region"
      aria-live="polite"
      aria-atomic="false"
      style={{
        background: `
          radial-gradient(ellipse 800px 400px at center top, rgba(255,215,0,0.08) 0%, transparent 70%),
          var(--bg-primary)
        `,
      }}
    >
      {/* Hero Podium Section */}
      <div>
        <SectionHeader icon="🏆" title="HERO PODIUM" color="#FFD700" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-2 md:items-end">
          {podium[1] && (
            <PodiumCard
              rank={2}
              associate={podium[1]}
              isAdmin={isAdmin}
              onCardClick={onCardClick}
              onAwardClick={onAwardClick}
              nextTierConfig={getNextTierConfig(podium[1].seasonPoints, state.settings.tiers)}
            />
          )}

          {podium[0] && (
            <PodiumCard
              rank={1}
              associate={podium[0]}
              isAdmin={isAdmin}
              onCardClick={onCardClick}
              onAwardClick={onAwardClick}
              nextTierConfig={getNextTierConfig(podium[0].seasonPoints, state.settings.tiers)}
            />
          )}

          {podium[2] && (
            <PodiumCard
              rank={3}
              associate={podium[2]}
              isAdmin={isAdmin}
              onCardClick={onCardClick}
              onAwardClick={onAwardClick}
              nextTierConfig={getNextTierConfig(podium[2].seasonPoints, state.settings.tiers)}
            />
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="⭐" label="Total Pts" value={totalPts} />
        <StatCard icon="🏅" label="Tier Holders" value={tierHolders} />
        <StatCard icon="🔥" label="Best Streak" value={bestStreak} />
      </div>

      {/* Chasing the Podium Section */}
      {chasing.length > 0 && (
        <div>
          <SectionHeader icon="⚡" title="CHASING THE PODIUM" color="#C0C0C0" />
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chasing.map((a, i) => (
                <ChasingCard
                  key={a.id}
                  rank={4 + i}
                  associate={a}
                  isAdmin={isAdmin}
                  onCardClick={onCardClick}
                  onAwardClick={onAwardClick}
                  nextTierConfig={getNextTierConfig(a.seasonPoints, state.settings.tiers)}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}

      {/* The Pack Section */}
      {pack.length > 0 && (
        <div>
          <SectionHeader icon="🐑" title="THE PACK" color="#CD7F32" />
          <AnimatePresence>
            <div className="divide-y divide-[var(--border)] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]">
              {pack.map((a, i) => (
                <PackRow
                  key={a.id}
                  rank={11 + i}
                  associate={a}
                  isAdmin={isAdmin}
                  onCardClick={onCardClick}
                  onAwardClick={onAwardClick}
                  rowIndex={i}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}

      {/* Today's Activity Feed */}
      {feed.length > 0 && (
        <div>
          <button
            onClick={() => setFeedOpen(!feedOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
            aria-expanded={feedOpen}
            aria-controls="activity-feed"
          >
            <span className="font-heading text-xs tracking-widest">📢 TODAY&apos;S ACTIVITY ({feed.length})</span>
            <span className="text-xl leading-none">{feedOpen ? '▼' : '▶'}</span>
          </button>
          <AnimatePresence>
            {feedOpen && (
              <motion.div
                id="activity-feed"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-1.5 mt-2"
              >
                {feed.map((ev, i) => {
                  const meta = REASON_TAG_META[ev.reasonTag as keyof typeof REASON_TAG_META];
                  const icon = meta?.emoji || '⭐';
                  const label = meta?.label || ev.reason || 'Award';
                  return (
                    <div key={`${ev.id}-${i}`} className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[10px] text-[var(--text-muted)] font-body flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="flex-shrink-0 text-sm">{ev.associateEmoji}</span>
                        <span className="truncate">{ev.associateName}</span>
                        <span className="flex-shrink-0">{icon}</span>
                        <span className="flex-shrink-0">{label}</span>
                        <span className="flex-shrink-0 text-[var(--text-hint)]">+{ev.points}</span>
                      </div>
                      <span className="flex-shrink-0 text-[var(--text-hint)] ml-2">{formatTimestamp(ev.timestamp)}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
