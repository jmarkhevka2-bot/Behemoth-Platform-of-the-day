'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '@/lib/hooks/useAppState';
import AssociateCard from '@/components/ui/AssociateCard';

type SortKey = 'name' | 'season' | 'daily' | 'streak';

interface Props {
  onCardClick: (id: string) => void;
  onAwardClick: (id: string) => void;
  onBulkAward: (ids: string[]) => void;
  isAdmin: boolean;
}

export default function CrewGrid({ onCardClick, onAwardClick, onBulkAward, isAdmin }: Props) {
  const { state } = useAppState();
  const [search, setSearch]           = useState('');
  const [sort, setSort]               = useState<SortKey>('name');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = [...state.associates];
    if (q) list = list.filter(a => a.displayName.toLowerCase().includes(q) || a.lastName.toLowerCase().includes(q));
    switch (sort) {
      case 'name':   list.sort((a, b) => a.firstName.localeCompare(b.firstName)); break;
      case 'season': list.sort((a, b) => b.seasonPoints - a.seasonPoints); break;
      case 'daily':  list.sort((a, b) => b.dailyPoints - a.dailyPoints); break;
      case 'streak': list.sort((a, b) => b.streak - a.streak); break;
    }
    return list;
  }, [state.associates, search, sort]);

  const notYetToday = useMemo(() =>
    state.associates.filter(a => a.dailyPoints === 0).sort((a, b) => a.firstName.localeCompare(b.firstName)),
    [state.associates]
  );

  const SORT_OPTS: Array<{ key: SortKey; label: string }> = [
    { key: 'name',   label: 'Name' },
    { key: 'season', label: 'Season' },
    { key: 'daily',  label: 'Today' },
    { key: 'streak', label: 'Streak' },
  ];

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  function exitMultiSelect() { setMultiSelectMode(false); setSelectedIds(new Set()); }
  function handleSelectAll() {
    setSelectedIds(selectedIds.size === filtered.length ? new Set() : new Set(filtered.map(a => a.id)));
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search + sort bar */}
      <div className="flex-shrink-0 px-3 py-2 flex gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <input
          type="text"
          placeholder="🔍 Search crew..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]
            font-body outline-none focus:border-[var(--accent-gold)]/40 placeholder:text-[var(--text-hint)]"
        />
        <div className="flex gap-1">
          {SORT_OPTS.map(opt => (
            <button key={opt.key} onClick={() => setSort(opt.key)}
              className={`px-2 py-1.5 rounded-lg text-xs font-body transition-colors ${
                sort === opt.key
                  ? 'bg-[#1C1917] text-white border border-[#1C1917]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent'
              }`}>
              {opt.label}
            </button>
          ))}
          {isAdmin && state.shift.active && (
            <button
              onClick={() => { if (multiSelectMode) exitMultiSelect(); else setMultiSelectMode(true); }}
              className={`px-2 py-1.5 rounded-lg text-xs font-body transition-colors border ${
                multiSelectMode
                  ? 'bg-[#1C1917] text-white border-[#1C1917]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border-transparent hover:border-[var(--border)]'
              }`}
              title="Multi-select for bulk award"
            >
              ☑
            </button>
          )}
        </div>
      </div>

      {/* Multi-select action bar */}
      <AnimatePresence>
        {multiSelectMode && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex-shrink-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#1C1917] text-white text-xs font-body">
              <button onClick={handleSelectAll} className="underline text-white/70 hover:text-white transition-colors">
                {selectedIds.size === filtered.length ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-white/40">·</span>
              <span className="text-white/70">{selectedIds.size} selected</span>
              <div className="flex-1" />
              {selectedIds.size > 0 && (
                <button onClick={() => { onBulkAward(Array.from(selectedIds)); exitMultiSelect(); }}
                  className="px-3 py-1 bg-white text-[#1C1917] font-heading text-xs rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                  AWARD {selectedIds.size}
                </button>
              )}
              <button onClick={exitMultiSelect} className="text-white/50 hover:text-white transition-colors ml-1">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02, duration: 0.2 }}>
              <AssociateCard associate={a} onCardClick={onCardClick} onAwardClick={onAwardClick}
                multiSelectMode={multiSelectMode} isSelected={selectedIds.has(a.id)}
                onToggleSelect={handleToggleSelect} isAdmin={isAdmin} />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--text-hint)]">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-body text-sm">No crew members found</p>
          </div>
        )}

        {/* Not yet recognized today */}
        {!search && notYetToday.length > 0 && notYetToday.length < state.associates.length && (
          <details className="mt-5">
            <summary className="flex items-center gap-2 cursor-pointer select-none py-2 group">
              <span className="text-[10px] font-heading tracking-widest text-[var(--text-hint)] group-hover:text-[var(--text-muted)] transition-colors">
                NOT YET RECOGNIZED TODAY
              </span>
              <span className="flex items-center justify-center w-5 h-5 bg-orange-50 border border-orange-100 rounded-full text-[9px] text-orange-400 font-heading flex-shrink-0">
                {notYetToday.length}
              </span>
            </summary>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 opacity-60">
              {notYetToday.map(a => (
                <AssociateCard key={a.id} associate={a} onCardClick={onCardClick} onAwardClick={onAwardClick}
                  multiSelectMode={multiSelectMode} isSelected={selectedIds.has(a.id)}
                  onToggleSelect={handleToggleSelect} isAdmin={isAdmin} />
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
