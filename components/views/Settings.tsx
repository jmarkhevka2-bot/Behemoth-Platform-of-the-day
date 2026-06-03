'use client';

import { useState, useRef } from 'react';
import { useAppState } from '@/lib/hooks/useAppState';
import { REASON_TAG_META, uuid } from '@/lib/constants';
import { exportToCSV, exportToJSON, importFromJSON } from '@/lib/utils/export';
import { getTodayET } from '@/lib/utils/shiftSchedule';
import type { ReasonTag } from '@/lib/types';

const SECTION      = 'bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 shadow-sm';
const SECTION_TITLE = 'font-heading text-xs tracking-widest text-[var(--text-muted)] mb-4';
const INPUT        = 'w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-body outline-none focus:border-[var(--accent-gold)]/50 placeholder:text-[var(--text-hint)] transition-colors';

export default function Settings() {
  const { state, dispatch } = useAppState();
  const { settings } = state;
  const [resetInput, setResetInput]       = useState('');
  const [importError, setImportError]     = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [newName, setNewName]             = useState('');
  const [newEmoji, setNewEmoji]           = useState('⭐');
  const fileRef = useRef<HTMLInputElement>(null);

  // Override state
  const today = getTodayET();
  const ov    = settings.shiftOverride?.date === today ? settings.shiftOverride : null;
  const [ovStart, setOvStart] = useState(ov ? `${String(ov.startHH).padStart(2,'0')}:${String(ov.startMM).padStart(2,'0')}` : '10:00');
  const [ovEnd,   setOvEnd  ] = useState(ov ? `${String(ov.endHH).padStart(2,'0')}:${String(ov.endMM).padStart(2,'0')}` : '22:00');

  function applyOverride() {
    const [sh, sm] = ovStart.split(':').map(Number);
    const [eh, em] = ovEnd.split(':').map(Number);
    if ([sh, sm, eh, em].some(isNaN)) return;
    dispatch({ type: 'SET_SHIFT_OVERRIDE', override: { date: today, startHH: sh, startMM: sm, endHH: eh, endMM: em } });
  }
  function clearOverride() {
    dispatch({ type: 'SET_SHIFT_OVERRIDE', override: null });
  }

  function handlePointValueChange(tag: ReasonTag, val: string) {
    const num = parseInt(val);
    if (isNaN(num) || num < 1) return;
    dispatch({ type: 'UPDATE_SETTINGS', settings: { pointValues: { ...settings.pointValues, [tag]: num } } });
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(''); setImportSuccess(false);
    importFromJSON(file, (s) => { dispatch({ type: 'IMPORT_STATE', state: s }); setImportSuccess(true); }, (msg) => setImportError(msg));
    e.target.value = '';
  }

  function handleAddAssociate() {
    const parts = newName.trim().split(' ');
    if (parts.length < 2) return;
    const firstName = parts[parts.length - 1];
    const lastName  = parts.slice(0, -1).join(' ');
    dispatch({ type: 'ADD_ASSOCIATE', associate: { id: uuid(), firstName, lastName, displayName: firstName, emoji: newEmoji, seasonPoints: 0, dailyPoints: 0, potdWins: 0, streak: 0, lastPointDate: null, currentTier: 'none', tiersUnlocked: [], notes: '', awardHistory: [], badges: [] } });
    setNewName('');
  }

  return (
    <div className="h-full overflow-y-auto px-3 py-4 space-y-4 max-w-2xl mx-auto">

      {/* Shift Schedule Override */}
      <section className={SECTION}>
        <h2 className={SECTION_TITLE}>⏰ SHIFT SCHEDULE OVERRIDE</h2>
        <p className="text-xs text-[var(--text-muted)] font-body mb-4">
          Default: 10:00 AM – 10:00 PM ET daily. Override applies to today ({today}) only.
        </p>
        {ov && (
          <div className="mb-3 px-3 py-2 bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 rounded-xl text-xs text-[var(--accent-gold)] font-body">
            ✓ Override active: {String(ov.startHH).padStart(2,'0')}:{String(ov.startMM).padStart(2,'0')} – {String(ov.endHH).padStart(2,'0')}:{String(ov.endMM).padStart(2,'0')}
          </div>
        )}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[10px] text-[var(--text-muted)] font-body block mb-1">Start time</label>
            <input type="time" value={ovStart} onChange={e => setOvStart(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-body outline-none focus:border-[var(--accent-gold)]/50" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-[var(--text-muted)] font-body block mb-1">End time</label>
            <input type="time" value={ovEnd} onChange={e => setOvEnd(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-body outline-none focus:border-[var(--accent-gold)]/50" />
          </div>
          <button onClick={applyOverride}
            className="px-4 py-2 bg-[#1C1917] hover:bg-[#2C2420] text-white text-xs font-heading rounded-xl transition-colors flex-shrink-0">
            Apply
          </button>
        </div>
        {ov && (
          <button onClick={clearOverride}
            className="mt-2 w-full py-2 border border-[var(--border)] text-[var(--text-secondary)] text-xs font-body rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
            Clear Override (restore 10 AM – 10 PM default)
          </button>
        )}
      </section>

      {/* App Settings */}
      <section className={SECTION}>
        <h2 className={SECTION_TITLE}>APP SETTINGS</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-body text-[var(--text-secondary)]">Sound Effects</span>
            <button onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { soundEnabled: !settings.soundEnabled } })}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${settings.soundEnabled ? 'bg-[#1C1917]' : 'bg-[var(--border)]'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.soundEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="text-xs font-body text-[var(--text-muted)] block mb-1.5">Dispatch Target Banner</label>
            <input type="text" value={settings.dispatchTarget}
              onChange={e => dispatch({ type: 'UPDATE_SETTINGS', settings: { dispatchTarget: e.target.value } })}
              className={INPUT} />
          </div>
        </div>
      </section>

      {/* Point Values */}
      <section className={SECTION}>
        <h2 className={SECTION_TITLE}>POINT VALUES</h2>
        <div className="space-y-1">
          {(Object.keys(REASON_TAG_META) as ReasonTag[]).map(tag => {
            const meta = REASON_TAG_META[tag];
            return (
              <div key={tag} className="flex items-center gap-3 py-1.5">
                <span className="text-base w-6 leading-none">{meta.emoji}</span>
                <span className="flex-1 text-sm font-body text-[var(--text-secondary)]">{meta.label}</span>
                <input type="number" min={1} max={20} value={settings.pointValues[tag] ?? 1}
                  onChange={e => handlePointValueChange(tag, e.target.value)}
                  className="w-16 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-2 py-1.5 text-sm text-[var(--accent-gold)] font-heading text-center outline-none focus:border-[var(--accent-gold)]/50" />
                <span className="text-xs text-[var(--text-muted)] font-body w-6">pts</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tier Thresholds */}
      <section className={SECTION}>
        <h2 className={SECTION_TITLE}>TIER THRESHOLDS</h2>
        <div className="space-y-1">
          {settings.tiers.map((tc, i) => (
            <div key={tc.tier} className="flex items-center gap-3 py-1.5">
              <span className="text-base leading-none">{tc.emoji}</span>
              <span className="flex-1 text-sm font-body text-[var(--text-secondary)]">{tc.label}</span>
              <input type="number" min={1} value={tc.threshold}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    const tiers = [...settings.tiers];
                    tiers[i] = { ...tc, threshold: val };
                    dispatch({ type: 'UPDATE_SETTINGS', settings: { tiers } });
                  }
                }}
                className="w-20 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-2 py-1.5 text-sm text-[var(--accent-gold)] font-heading text-center outline-none focus:border-[var(--accent-gold)]/50" />
              <span className="text-xs text-[var(--text-muted)] font-body w-6">pts</span>
            </div>
          ))}
        </div>
      </section>

      {/* Crew Management */}
      <section className={SECTION}>
        <h2 className={SECTION_TITLE}>CREW MANAGEMENT</h2>
        <p className="text-xs text-[var(--text-muted)] font-body mb-3">{state.associates.length} operators on roster</p>
        <div className="flex gap-2 mb-3">
          <input type="text" value={newEmoji} onChange={e => setNewEmoji(e.target.value)}
            className="w-12 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-2 py-2 text-center text-lg outline-none" placeholder="😊" />
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Last First (e.g. Smith John)" className={`flex-1 ${INPUT}`}
            onKeyDown={e => { if (e.key === 'Enter') handleAddAssociate(); }} />
          <button onClick={handleAddAssociate}
            className="px-3 py-2 bg-[#1C1917] hover:bg-[#2C2420] text-white text-sm font-heading rounded-xl transition-colors">Add</button>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {state.associates.map(a => (
            <div key={a.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
              <span className="text-base leading-none">{a.emoji}</span>
              <span className="flex-1 text-sm font-body text-[var(--text-secondary)]">{a.firstName} {a.lastName}</span>
              <span className="text-xs text-[var(--text-muted)] font-body">{a.seasonPoints}pts</span>
              <button onClick={() => dispatch({ type: 'REMOVE_ASSOCIATE', id: a.id })}
                className="text-[var(--text-hint)] hover:text-red-500 text-xs transition-colors w-5 h-5 flex items-center justify-center">✕</button>
            </div>
          ))}
        </div>
      </section>

      {/* Data */}
      <section className={SECTION}>
        <h2 className={SECTION_TITLE}>DATA</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => exportToCSV(state.associates)}
              className="py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-body rounded-xl transition-colors">Export CSV</button>
            <button onClick={() => exportToJSON(state)}
              className="py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-body rounded-xl transition-colors">Export JSON</button>
          </div>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button onClick={() => fileRef.current?.click()}
            className="w-full py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-body rounded-xl transition-colors">Import Backup JSON</button>
          {importError   && <p className="text-red-500 text-xs font-body">{importError}</p>}
          {importSuccess && <p className="text-green-600 text-xs font-body">✓ Backup restored</p>}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            <button onClick={() => dispatch({ type: 'RESET_DAILY' })}
              className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-body rounded-xl transition-colors">Reset Daily Points</button>
            <div className="space-y-1.5">
              <p className="text-[10px] text-[var(--text-muted)] font-body">Type &quot;NEW SEASON&quot; to confirm full reset:</p>
              <div className="flex gap-2">
                <input type="text" value={resetInput} onChange={e => setResetInput(e.target.value)}
                  placeholder="NEW SEASON" className={`flex-1 ${INPUT} border-red-200`} />
                <button onClick={() => { if (resetInput === 'NEW SEASON') { dispatch({ type: 'RESET_SEASON' }); setResetInput(''); } }}
                  disabled={resetInput !== 'NEW SEASON'}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-body rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed">Reset</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
