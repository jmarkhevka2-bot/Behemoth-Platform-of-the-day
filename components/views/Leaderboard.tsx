'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import { useSortedLeaderboard } from '@/lib/hooks/useAppState';
import { REASON_TAG_META } from '@/lib/constants';
import { formatTimestamp } from '@/lib/utils/dates';
import { getNextTierConfig } from '@/lib/utils/tiers';
import TierBadge from '@/components/ui/TierBadge';
import PointCounter from '@/components/ui/PointCounter';
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

const TIER_COLORS: Record<string, string> = {
  none: '#666666',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#B9F2FF',
  legend: '#9B59B6',
};

function PodiumCard({
  rank,
  associate,
  isAdmin,
  onCardClick,
  onAwardClick,
  nextTierConfig,
}: {
  rank: 1 | 2 | 3;
  associate: any;
  isAdmin: boolean;
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  nextTierConfig: any;
}) {
  const [hovered, setHovered] = useState(false);

  const gradients: Record<number, string> = {
    1: 'from-yellow-400 via-yellow-600 to-yellow-500',
    2: 'from-gray-100 via-gray-400 to-gray-300',
    3: 'from-amber-700 via-amber-900 to-amber-800',
  };

  const glows: Record<number, string> = {
    1: 'shadow-2xl podium-one-glow',
    2: 'shadow-lg hover:shadow-xl',
    3: 'shadow-lg hover:shadow-xl',
  };

  const progressPercent = nextTierConfig
    ? Math.min(100, (associate.seasonPoints / nextTierConfig.threshold) * 100)
    : 100;

  return (
    <motion.div
      layout
      layoutId={`podium-${associate.id}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onCardClick(associate.id)}
      className={`relative cursor-pointer ${rank === 1 ? 'md:scale-110 md:mb-4' : ''}`}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`bg-gradient-to-br ${gradients[rank]} rounded-2xl p-6 text-center transition-all duration-300 ${glows[rank]}`}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ opacity: 0.1 }}
          />
        </div>

        <div className="absolute top-3 left-3 text-2xl font-heading font-bold text-white opacity-80">
          #{rank}
        </div>

        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAwardClick(associate.id);
            }}
            className="absolute top-3 right-3 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
          >
            +
          </button>
        )}

        <div className="text-6xl leading-none mb-2">{associate.emoji}</div>

        <p className="font-heading text-2xl font-bold text-white mb-1">
          {associate.displayName}
        </p>

        <div className="flex items-center justify-center gap-2 mb-3">
          <TierBadge tier={associate.currentTier} size="sm" showLabel />
        </div>

        <div className="text-center mb-4">
          <PointCounter
            value={associate.seasonPoints}
            className="font-heading text-5xl font-bold text-white leading-tight"
          />
          <p className="text-xs font-body text-white/70 mt-1">season pts</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-3 text-sm">
          {associate.potdWins > 0 && (
            <span className="font-body text-white/80">🏆 {associate.potdWins}</span>
          )}
          {associate.streak > 0 && (
            <span className="font-body text-white/80">🔥 {associate.streak}</span>
          )}
        </div>

        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/60"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function SectionHeader({
  icon,
  title,
  color,
}: {
  icon: string;
  title: string;
  color: string;
}) {
  return (
    <div className="mb-3">
      <h3 className="font-heading text-sm font-bold tracking-widest" style={{ color }}>
        {icon} {title}
      </h3>
      <div className="h-px mt-2" style={{ backgroundColor: `${color}40` }} />
    </div>
  );
}

function ChasingCard({
  rank,
  associate,
  isAdmin,
  onCardClick,
  onAwardClick,
  nextTierConfig,
}: {
  rank: number;
  associate: any;
  isAdmin: boolean;
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  nextTierConfig: any;
}) {
  const [hovered, setHovered] = useState(false);
  const progressPercent = nextTierConfig
    ? Math.min(100, (associate.seasonPoints / nextTierConfig.threshold) * 100)
    : 100;

  return (
    <motion.div
      layout
      layoutId={`chasing-${associate.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onCardClick(associate.id)}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative cursor-pointer p-4 rounded-xl bg-[#1A1A1A] border border-l-4 transition-all duration-200 ${
        hovered ? 'shadow-md' : 'shadow-sm'
      }`}
      style={{
        borderLeftColor: TIER_COLORS[associate.currentTier],
        boxShadow: hovered
          ? `0 0 12px ${TIER_COLORS[associate.currentTier]}40`
          : undefined,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl pointer-events-none" />

      <div className="absolute top-4 left-4 text-lg font-heading font-bold text-[var(--text-primary)]">
        #{rank}
      </div>

      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAwardClick(associate.id);
          }}
          className="absolute top-4 right-4 w-7 h-7 bg-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/20 text-[var(--text-primary)] rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
        >
          +
        </button>
      )}

      <div className="flex items-center gap-3 pt-1">
        <span className="text-4xl leading-none flex-shrink-0">{associate.emoji}</span>

        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-[var(--text-primary)] text-sm truncate">
            {associate.displayName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <TierBadge tier={associate.currentTier} size="xs" />
            <span className="text-[10px] text-[var(--text-muted)] font-body">
              {associate.currentTier === 'none' ? 'No tier' : ''}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <PointCounter
            value={associate.seasonPoints}
            className="font-heading text-lg text-[var(--text-primary)] leading-none"
          />
          <p className="text-[9px] text-[var(--text-muted)] font-body mt-0.5">pts</p>
        </div>
      </div>

      <div className="mt-3 h-0.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
        <motion.div
          className="h-full"
          style={{ backgroundColor: TIER_COLORS[associate.currentTier] }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

function PackRow({
  rank,
  associate,
  isAdmin,
  onCardClick,
  onAwardClick,
  rowIndex,
}: {
  rank: number;
  associate: any;
  isAdmin: boolean;
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  rowIndex: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      layoutId={`pack-${associate.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onCardClick(associate.id)}
      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all border-b border-l-[2px] ${
        rowIndex % 2 === 0 ? 'bg-[#111111]' : 'bg-[#141414]'
      } ${hovered ? 'bg-[#1E1E1E]' : ''}`}
      style={{
        borderLeftColor: hovered
          ? TIER_COLORS[associate.currentTier]
          : `${TIER_COLORS[associate.currentTier]}40`,
      }}
    >
      <span className="text-sm font-heading font-bold text-[var(--text-muted)] w-8 flex-shrink-0">
        #{rank}
      </span>

      <span className="text-2xl leading-none flex-shrink-0">{associate.emoji}</span>

      <span className="text-sm font-body font-medium text-[var(--text-primary)] flex-1 truncate">
        {associate.displayName}
      </span>

      <TierBadge tier={associate.currentTier} size="xs" />

      <PointCounter
        value={associate.seasonPoints}
        className="font-heading text-sm font-bold text-[var(--text-primary)] flex-shrink-0"
      />
      <span className="text-[9px] text-[var(--text-muted)] font-body w-8 text-right flex-shrink-0">
        pts
      </span>

      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAwardClick(associate.id);
          }}
          className="ml-1 w-6 h-6 bg-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/20 text-[var(--text-primary)] rounded-lg flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0"
        >
          +
        </button>
      )}
    </motion.div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number | string;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-[#1A1A1A] border border-[var(--border-subtle)] text-center"
    >
      <div className="text-2xl leading-none mb-2">{icon}</div>
      <PointCounter
        value={typeof value === 'number' ? value : parseInt(value as string)}
        className="font-heading text-2xl font-bold text-[#FFD700] leading-none"
      />
      <p className="text-[10px] text-[var(--text-muted)] font-body mt-2">{label}</p>
    </motion.div>
  );
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

  const tiedMap = useMemo(() => {
    const counts: Record<number, number> = {};
    sorted.forEach((a) => {
      counts[a.seasonPoints] = (counts[a.seasonPoints] ?? 0) + 1;
    });
    return counts;
  }, [sorted]);

  const totalPts = useMemo(
    () => state.associates.reduce((s, a) => s + a.seasonPoints, 0),
    [state.associates]
  );
  const tierHolders = useMemo(
    () => state.associates.filter((a) => a.currentTier !== 'none').length,
    [state.associates]
  );
  const bestStreak = useMemo(
    () => Math.max(...state.associates.map((a) => a.streak), 0),
    [state.associates]
  );

  const todaysFeed = useMemo((): FeedEvent[] => {
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
      style={{
        background: `
          radial-gradient(ellipse 800px 400px at center top, rgba(255,215,0,0.08) 0%, transparent 70%),
          var(--bg-primary)
        `,
      }}
    >
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

      {chasing.length > 0 && (
        <div>
          <SectionHeader icon="⚡" title="CHASING THE PODIUM" color="#FFD700" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {chasing.map((associate, index) => (
                <ChasingCard
                  key={associate.id}
                  rank={4 + index}
                  associate={associate}
                  isAdmin={isAdmin}
                  onCardClick={onCardClick}
                  onAwardClick={onAwardClick}
                  nextTierConfig={getNextTierConfig(
                    associate.seasonPoints,
                    state.settings.tiers
                  )}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {pack.length > 0 && (
        <div>
          <SectionHeader icon="👥" title="THE PACK" color="#666666" />
          <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            <AnimatePresence mode="popLayout">
              {pack.map((associate, index) => (
                <PackRow
                  key={associate.id}
                  rank={11 + index}
                  associate={associate}
                  isAdmin={isAdmin}
                  onCardClick={onCardClick}
                  onAwardClick={onAwardClick}
                  rowIndex={index}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="pt-2">
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon="⭐" value={totalPts} label="Total Pts" />
          <StatCard icon="🎖️" value={tierHolders} label="Tier Holders" />
          <StatCard icon="🔥" value={bestStreak} label="Best Streak" />
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <button
          onClick={() => setFeedOpen((v) => !v)}
          className="w-full flex items-center justify-between text-xs font-heading tracking-widest text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors py-2 select-none"
        >
          <span>TODAY&apos;S ACTIVITY</span>
          <span className="flex items-center gap-2">
            {todaysFeed.length > 0 && (
              <span className="px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-[9px]">
                {todaysFeed.length}
              </span>
            )}
            <motion.span
              animate={{ rotate: feedOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▾
            </motion.span>
          </span>
        </button>

        <AnimatePresence>
          {feedOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {todaysFeed.length === 0 ? (
                <p className="text-xs text-[var(--text-hint)] font-body py-4 text-center">
                  No awards given yet this shift
                </p>
              ) : (
                <div className="mt-3 space-y-1.5 max-h-80 overflow-y-auto">
                  {todaysFeed.map((ev) => {
                    const meta =
                      ev.reasonTag !== 'custom' ? REASON_TAG_META[ev.reasonTag] : null;
                    const isDeduction = ev.points < 0;
                    return (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2.5 px-3 py-2.5 bg-[#1A1A1A] border border-[var(--border-subtle)] rounded-lg text-xs"
                      >
                        <span className="text-base leading-none flex-shrink-0">
                          {ev.associateEmoji}
                        </span>
                        <span className="text-[var(--text-secondary)] font-body flex-shrink-0 min-w-fit">
                          {ev.associateName}
                        </span>
                        <span className="flex-1 text-[var(--text-muted)] font-body truncate">
                          {meta?.emoji ?? '✏️'} {ev.reason}
                        </span>
                        <span
                          className={`font-heading flex-shrink-0 ${
                            isDeduction ? 'text-red-500' : 'text-[var(--accent-gold)]'
                          }`}
                        >
                          {isDeduction ? ev.points : `+${ev.points}`}
                        </span>
                        <span className="text-[var(--text-hint)] font-body flex-shrink-0 text-[9px]">
                          {formatTimestamp(ev.timestamp)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pb-2" />
    </div>
  );
}
