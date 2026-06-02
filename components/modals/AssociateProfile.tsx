'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAssociateById } from '@/lib/hooks/useAppState';
import { useAppState } from '@/lib/hooks/useAppState';
import { getTierProgress, getNextTierConfig, getCurrentTierConfig } from '@/lib/utils/tiers';
import { formatTimestamp } from '@/lib/utils/dates';
import { REASON_TAG_META } from '@/lib/constants';
import TierBadge from '@/components/ui/TierBadge';

interface Props {
  id: string;
  onClose: () => void;
  onAward: (id: string) => void;
  isAdmin: boolean;
}

const RING_COLOR: Record<string, string> = {
  none:    '#DDD9D2',
  bronze:  '#C07A3A',
  silver:  '#8899AA',
  gold:    '#B08C1E',
  diamond: '#3B78B8',
  legend:  '#7C3AED',
};

export default function AssociateProfile({ id, onClose, onAward, isAdmin }: Props) {
  const { state, dispatch } = useAppState();
  const associate = useAssociateById(id);
  const [editingEmoji, setEditingEmoji] = useState(false);
  const [emojiInput, setEmojiInput] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [notesValue, setNotesValue] = useState(associate?.notes ?? '');

  if (!associate) return null;

  const a = associate;
  const progress = getTierProgress(a.seasonPoints, state.settings.tiers);
  const nextTier = getNextTierConfig(a.seasonPoints, state.settings.tiers);
  const currentTierConfig = getCurrentTierConfig(a.currentTier, state.settings.tiers);
  const isLegend = a.currentTier === 'legend';

  const R = 46;
  const C = 2 * Math.PI * R;
  const pct = isLegend ? 1 : progress;

  function saveEmoji() {
    if (emojiInput.trim()) dispatch({ type: 'UPDATE_ASSOCIATE', id, updates: { emoji: emojiInput.trim() } });
    setEditingEmoji(false);
  }

  function saveName() {
    if (nameInput.trim()) dispatch({ type: 'UPDATE_ASSOCIATE', id, updates: { displayName: nameInput.trim() } });
    setEditingName(false);
  }

  function handleNotesBlur() {
    dispatch({ type: 'UPDATE_ASSOCIATE', id, updates: { notes: notesValue } });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 modal-backdrop flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="w-full max-w-md bg-white border border-[#DDD9D2] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Hero */}
        <div className="px-5 pt-5 pb-4 border-b border-[#E8E4DF]">
          <div className="flex items-start justify-between mb-3">
            {/* Emoji — editable for admin only */}
            {isAdmin ? (
              editingEmoji ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={emojiInput}
                    onChange={e => setEmojiInput(e.target.value)}
                    className="w-14 text-center text-2xl bg-[#F5F3EE] border border-[#DDD9D2] rounded-xl px-2 py-1 outline-none"
                    onKeyDown={e => { if (e.key === 'Enter') saveEmoji(); if (e.key === 'Escape') setEditingEmoji(false); }}
                  />
                  <button onClick={saveEmoji} className="px-2.5 py-1 bg-[#F5F3EE] border border-[#DDD9D2] rounded-xl text-sm text-[#6B6560]">✓</button>
                </div>
              ) : (
                <button
                  onClick={() => { setEmojiInput(a.emoji); setEditingEmoji(true); }}
                  className="text-4xl leading-none hover:scale-110 transition-transform"
                  title="Change emoji"
                >
                  {a.emoji}
                </button>
              )
            ) : (
              <span className="text-4xl leading-none">{a.emoji}</span>
            )}
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#A8A29E] hover:text-[#6B6560] hover:bg-[#F5F3EE] transition-colors">✕</button>
          </div>

          {/* Name — editable for admin only */}
          {isAdmin ? (
            editingName ? (
              <div className="flex gap-2 mb-2">
                <input
                  autoFocus
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="flex-1 bg-[#F5F3EE] border border-[#DDD9D2] rounded-xl px-3 py-1.5 text-lg font-body font-semibold text-[#1C1917] outline-none"
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                />
                <button onClick={saveName} className="px-2.5 py-1 bg-[#F5F3EE] border border-[#DDD9D2] rounded-xl text-sm text-[#6B6560]">✓</button>
              </div>
            ) : (
              <button onClick={() => { setNameInput(a.displayName); setEditingName(true); }} className="text-left mb-1">
                <p className="font-body font-semibold text-[#1C1917] text-xl leading-tight hover:text-[#6B6560] transition-colors">
                  {a.displayName}
                </p>
                <p className="text-[#A8A29E] text-sm font-body">{a.lastName}</p>
              </button>
            )
          ) : (
            <div className="text-left mb-1">
              <p className="font-body font-semibold text-[#1C1917] text-xl leading-tight">{a.displayName}</p>
              <p className="text-[#A8A29E] text-sm font-body">{a.lastName}</p>
            </div>
          )}

          <div className="mt-2">
            <TierBadge tier={a.currentTier} size="sm" showLabel />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Progress ring + stats */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
                <circle cx="48" cy="48" r={R} fill="none" stroke="#F0EDE8" strokeWidth="6" />
                <motion.circle
                  cx="48" cy="48" r={R}
                  fill="none"
                  stroke={RING_COLOR[a.currentTier] ?? '#B08C1E'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: C }}
                  animate={{ strokeDashoffset: C * (1 - pct) }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-[#1C1917] text-xl leading-none">{a.seasonPoints}</span>
                <span className="text-[9px] text-[#A8A29E] font-body mt-0.5">pts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1">
              {[
                { label: 'Today',     value: `+${a.dailyPoints}`, color: 'text-[#3B78B8]' },
                { label: 'POTD Wins', value: a.potdWins,          color: 'text-[#B08C1E]' },
                { label: 'Streak',    value: `${a.streak}🔥`,      color: 'text-orange-500' },
                { label: 'To next',   value: nextTier ? `${nextTier.threshold - a.seasonPoints}` : 'MAX', color: 'text-[#6B6560]' },
              ].map(s => (
                <div key={s.label} className="bg-[#F5F3EE] rounded-xl p-2 text-center border border-[#E8E4DF]">
                  <p className={`font-heading text-base leading-none ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-[#A8A29E] font-body mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Current reward */}
          {currentTierConfig && a.currentTier !== 'none' && (
            <div className="px-3 py-2.5 bg-[#F5F3EE] border border-[#E8E4DF] rounded-xl">
              <p className="text-[10px] text-[#A8A29E] font-body mb-1">Current reward</p>
              <p className="text-sm text-[#6B6560] font-body leading-snug">{currentTierConfig.reward}</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-[10px] text-[#A8A29E] font-body mb-1.5 uppercase tracking-wider">Notes</p>
            <textarea
              value={notesValue}
              onChange={isAdmin ? e => setNotesValue(e.target.value) : undefined}
              onBlur={isAdmin ? handleNotesBlur : undefined}
              readOnly={!isAdmin}
              placeholder={isAdmin ? 'e.g. strong loader, great spiel...' : '—'}
              rows={2}
              className={`w-full bg-[#F5F3EE] border border-[#DDD9D2] rounded-xl px-3 py-2 text-sm text-[#6B6560] font-body outline-none resize-none placeholder:text-[#C4BEB8] transition-colors ${isAdmin ? 'focus:border-[#B08C1E]/40' : 'cursor-default'}`}
            />
          </div>

          {/* Award history */}
          <div>
            <p className="text-[10px] text-[#A8A29E] font-body mb-2 uppercase tracking-wider">Recent Awards</p>
            {a.awardHistory.length === 0 ? (
              <p className="text-xs text-[#C4BEB8] font-body">No awards yet</p>
            ) : (
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {a.awardHistory.slice(0, 10).map(ev => {
                  const meta = ev.reasonTag !== 'custom' ? REASON_TAG_META[ev.reasonTag] : null;
                  return (
                    <div key={ev.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-[#F5F3EE] rounded-lg border border-[#E8E4DF]">
                      <span className="text-sm leading-none">{meta?.emoji ?? '✏️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#6B6560] font-body truncate">{ev.reason}</p>
                        {ev.note && <p className="text-[10px] text-[#A8A29E] font-body truncate">{ev.note}</p>}
                      </div>
                      <span className="text-sm font-heading text-[#B08C1E] flex-shrink-0">+{ev.points}</span>
                      <span className="text-[10px] text-[#C4BEB8] flex-shrink-0 font-body">{formatTimestamp(ev.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer — admin only */}
        {isAdmin && (
          <div className="px-5 py-4 border-t border-[#E8E4DF]">
            <button
              onClick={() => { onClose(); onAward(id); }}
              className="w-full py-3 bg-[#1C1917] text-white font-heading text-base rounded-xl hover:bg-[#2C2420] transition-colors active:scale-[0.98]"
            >
              + AWARD POINTS
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
