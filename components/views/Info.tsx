'use client';

import { useState, useMemo } from 'react';
import { useAppState } from '@/lib/hooks/useAppState';
import { REASON_TAG_META } from '@/lib/constants';
import { BADGE_META } from '@/lib/utils/badges';
import type { BadgeKey } from '@/lib/types';

// ── Helper components ──────────────────────────────────────────────────────────

const BORDER_COLORS = [
  '#B08C1E', // gold
  '#3B78B8', // blue
  '#C9A840', // gold 2
  '#7C3AED', // purple
  '#C07A3A', // bronze
  '#8899AA', // silver
  '#B91C1C', // red
  '#059669', // green
  '#0369A1', // dark blue
  '#B08C1E', // gold again
  '#6D28D9', // violet
];

interface SectionProps {
  icon:    string;
  title:   string;
  color:   string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ icon, title, color, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] border-l-4 rounded-xl overflow-hidden shadow-sm"
      style={{ borderLeftColor: color }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left select-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl leading-none">{icon}</span>
          <span className="font-heading text-[var(--text-primary)] text-sm tracking-wide">{title}</span>
        </div>
        <span className={`text-[var(--text-hint)] text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-subtle)]">
          {children}
        </div>
      )}
    </div>
  );
}

function ComingSoon() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-heading bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20 ml-2">
      COMING SOON
    </span>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-[var(--border-subtle)] last:border-0">
      <span className="flex-1 text-xs font-body text-[var(--text-secondary)]">{label}</span>
      <span className={`text-xs font-body text-right max-w-[55%] ${muted ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{value}</span>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-body text-[var(--text-secondary)] leading-relaxed pl-3 border-l-2 border-[var(--border-subtle)]">{children}</p>;
}

// ── Main component ──────────────────────────────────────────────────────────────

export default function Info() {
  const { state } = useAppState();
  const { settings } = state;
  const [search, setSearch] = useState('');

  const badgeKeys = Object.keys(BADGE_META) as BadgeKey[];

  const sections = useMemo(() => [
    '🎯 Point System', '🏆 Reward Tiers', '👑 Platform of the Day',
    '⚔️ Daily Rivalry', '🏅 Secret Badges', '👑 Weekly Crown',
    '⏰ Shift Schedule', '⚡ Double Points', '📢 Hype Blast',
    '⚙️ Settings', '📱 Access Levels',
  ], []);

  const q = search.toLowerCase();
  const visibleSections = q
    ? sections.filter(s => s.toLowerCase().includes(q))
    : sections;
  const showSection = (name: string) => !q || visibleSections.some(s => s === name);

  return (
    <div className="h-full overflow-y-auto px-3 py-4 space-y-3 max-w-2xl mx-auto">

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search topics..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] font-body outline-none focus:border-[var(--accent-gold)]/50 placeholder:text-[var(--text-hint)] mb-1"
      />

      {/* ── 🎯 Point System ──────────────────────────────────── */}
      {showSection('🎯 Point System') && (
        <Section icon="🎯" title="Point System" color={BORDER_COLORS[0]} defaultOpen>
          <div className="pt-2 space-y-0.5">
            {Object.entries(REASON_TAG_META).map(([tag, meta]) => (
              <div key={tag} className="flex items-center gap-3 py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                <span className="text-lg leading-none w-6">{meta.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-body font-semibold text-[var(--text-primary)]">{meta.label}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-body">{meta.description}</p>
                </div>
                <span className="font-heading text-[var(--accent-gold)] text-sm">{settings.pointValues[tag as keyof typeof settings.pointValues] ?? '—'}pt</span>
              </div>
            ))}
          </div>
          <Bullet>Point values are editable in Settings → Point Values.</Bullet>
        </Section>
      )}

      {/* ── 🏆 Reward Tiers ──────────────────────────────────── */}
      {showSection('🏆 Reward Tiers') && (
        <Section icon="🏆" title="Reward Tiers" color={BORDER_COLORS[1]}>
          <div className="pt-2 space-y-2">
            {settings.tiers.map(tier => (
              <div key={tier.tier} className="flex items-start gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0">
                <span className="text-xl leading-none">{tier.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-body font-semibold text-[var(--text-primary)]">{tier.label}</p>
                    <span className="font-heading text-[var(--accent-gold)] text-xs">{tier.threshold}pts</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] font-body leading-relaxed">{tier.reward}</p>
                  {/* Mini progress bar */}
                  <div className="mt-1.5 h-1 bg-[var(--border-subtle)] rounded-full overflow-hidden w-full">
                    <div className={`h-full tier-${tier.tier} rounded-full`} style={{ width: `${Math.min(100, (tier.threshold / 500) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Bullet>Tiers and rewards can be edited in Settings → Tier Thresholds.</Bullet>
        </Section>
      )}

      {/* ── 👑 Platform of the Day ────────────────────────────── */}
      {showSection('👑 Platform of the Day') && (
        <Section icon="👑" title="Platform of the Day" color={BORDER_COLORS[2]}>
          <div className="pt-2 space-y-2">
            <Bullet><strong className="text-[var(--text-primary)]">Single Crown:</strong> Tap 👑 Crown POTD in the header during an active shift. Pick the winner from the crew list — they receive {settings.pointValues.potd ?? 5} pts and a ceremony animation.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">Multi-Award Mode (⚡):</strong> In the POTD ceremony, tap "⚡ Multi-Award" to select multiple associates. All selected receive {settings.pointValues.potd ?? 5} pts simultaneously. A combined celebration plays.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">After crowning:</strong> POTD win count increments, points are awarded, a full-screen ceremony plays, and badge checks run.</Bullet>
            <Bullet>If no POTD is crowned before 10:00 PM, the end-of-shift recap shows "No POTD crowned today".</Bullet>
          </div>
        </Section>
      )}

      {/* ── ⚔️ Daily Rivalry ─────────────────────────────────── */}
      {showSection('⚔️ Daily Rivalry') && (
        <Section icon="⚔️" title="Daily Rivalry" color={BORDER_COLORS[3]}>
          <div className="pt-2 space-y-2">
            <Bullet><strong className="text-[var(--text-primary)]">Auto-selection:</strong> At 10:00 AM, the system picks the two associates with the closest season points as today's rivals. Their names appear in the shift-start banner and the header.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">Head-to-head:</strong> During the shift, their emoji/names are shown in the header. Track their daily points in the Crew Grid or Leaderboard.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">End-of-shift bonus:</strong> +3 pts to the winner (higher daily points), or +2 pts each if tied. Awarded automatically at shift end.</Bullet>
            <Bullet>The same pair will not be matched more than once every 3 days. (Coming in a future update.)</Bullet>
          </div>
        </Section>
      )}

      {/* ── 🏅 Secret Badges ─────────────────────────────────── */}
      {showSection('🏅 Secret Badges') && (
        <Section icon="🏅" title="Secret Achievement Badges" color={BORDER_COLORS[4]}>
          <div className="pt-2 space-y-0.5">
            {badgeKeys.map(key => {
              const m = BADGE_META[key];
              return (
                <div key={key} className="flex items-center gap-3 py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                  <span className="text-lg leading-none w-6">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-body font-semibold text-[var(--text-primary)]">{m.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-body">{m.flavour}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Bullet>Badges are hidden from crew view until unlocked. Checks run automatically after every point award.</Bullet>
        </Section>
      )}

      {/* ── 👑 Weekly Crown ──────────────────────────────────── */}
      {showSection('👑 Weekly Crown') && (
        <Section icon="🏅" title={<>Weekly Crown <ComingSoon /></> as unknown as string} color={BORDER_COLORS[5]}>
          <div className="pt-2 space-y-2">
            <Bullet><strong className="text-[var(--text-primary)]">Calculation:</strong> The associate who earned the most season points during the current week (Mon–Sun) wins the weekly crown.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">Reset:</strong> Weekly points reset every Monday at midnight ET.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">Bonus:</strong> +5 season points awarded to the winner at the end of the week.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">Ties:</strong> Crown is shared between all tied associates; each receives the bonus.</Bullet>
            <p className="text-xs text-[var(--accent-gold)] font-body mt-2 px-3 py-2 bg-[var(--accent-gold)]/10 rounded-lg border border-[var(--accent-gold)]/20">This feature is planned for a future update.</p>
          </div>
        </Section>
      )}

      {/* ── ⏰ Shift Schedule ─────────────────────────────────── */}
      {showSection('⏰ Shift Schedule') && (
        <Section icon="⏰" title="Shift Schedule" color={BORDER_COLORS[6]} defaultOpen>
          <div className="pt-2 space-y-0.5">
            <Row label="Shift start"  value="10:00 AM ET (daily)" />
            <Row label="Shift end"    value="10:00 PM ET (daily)" />
            <Row label="Timezone"     value="America/Toronto (Eastern)" />
            <Row label="Override"     value={state.settings.shiftOverride ? `Today: ${state.settings.shiftOverride.startHH}:${String(state.settings.shiftOverride.startMM).padStart(2,'0')} – ${state.settings.shiftOverride.endHH}:${String(state.settings.shiftOverride.endMM).padStart(2,'0')}` : 'None active'} muted={!state.settings.shiftOverride} />
          </div>
          <div className="space-y-2 mt-1">
            <Bullet><strong className="text-[var(--text-primary)]">At shift start (10 AM):</strong> Daily points reset, rivals are calculated, the shift-start banner appears for 5 seconds.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">At shift end (10 PM):</strong> Rival bonus points are awarded, the end-of-shift cinematic triggers automatically.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">Override:</strong> Go to Settings → Shift Schedule Override to change today&apos;s hours (e.g., for holidays). Resets to default the next day.</Bullet>
            <Bullet>All award buttons are disabled outside shift hours. The Settings tab remains accessible at all times.</Bullet>
          </div>
        </Section>
      )}

      {/* ── ⚡ Double Points ──────────────────────────────────── */}
      {showSection('⚡ Double Points') && (
        <Section icon="⚡" title={<>Double Points Window <ComingSoon /></> as unknown as string} color={BORDER_COLORS[7]}>
          <div className="pt-2 space-y-2">
            <Bullet><strong className="text-[var(--text-primary)]">Activation:</strong> Admin activates from the header during an active shift. A 30-minute countdown becomes visible on all connected devices.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">Effect:</strong> All point awards are doubled for the duration of the window.</Bullet>
            <Bullet><strong className="text-[var(--text-primary)]">Use it for:</strong> Slow periods, final 30-minute push, or special recognition moments.</Bullet>
            <p className="text-xs text-[var(--accent-gold)] font-body mt-2 px-3 py-2 bg-[var(--accent-gold)]/10 rounded-lg border border-[var(--accent-gold)]/20">This feature is planned for a future update.</p>
          </div>
        </Section>
      )}

      {/* ── 📢 Hype Blast ────────────────────────────────────── */}
      {showSection('📢 Hype Blast') && (
        <Section icon="📢" title={<>Hype Blast <ComingSoon /></> as unknown as string} color={BORDER_COLORS[8]}>
          <div className="pt-2 space-y-2">
            <Bullet><strong className="text-[var(--text-primary)]">How it works:</strong> Admin types a message (up to 160 characters) and sends it. A full-screen overlay appears simultaneously on all connected devices.</Bullet>
            <Bullet>Useful for shift-wide announcements, motivation pushes, or recognising a great moment in real time.</Bullet>
            <Bullet>Appears on crew view devices at the same moment — no refresh required.</Bullet>
            <p className="text-xs text-[var(--accent-gold)] font-body mt-2 px-3 py-2 bg-[var(--accent-gold)]/10 rounded-lg border border-[var(--accent-gold)]/20">This feature is planned for a future update.</p>
          </div>
        </Section>
      )}

      {/* ── ⚙️ Settings Reference ────────────────────────────── */}
      {showSection('⚙️ Settings') && (
        <Section icon="⚙️" title="Settings Reference" color={BORDER_COLORS[9]}>
          <div className="pt-2 space-y-0.5">
            {[
              ['Sound Effects',        'Toggle award sounds on/off'],
              ['Dispatch Target',      'Text shown in the header centre area'],
              ['Shift Override',       'Custom start/end times for today only'],
              ['Point Values',         'Edit pts per reason tag (Fast Dispatch, Spiel Master, etc.)'],
              ['Tier Thresholds',      'Edit the pts required for Bronze → Legend'],
              ['Crew Management',      'Add or remove associates from the roster'],
              ['Export CSV',           'Download season data as a spreadsheet'],
              ['Export JSON',          'Full backup of all state (points, events, settings)'],
              ['Import JSON',          'Restore from a previous JSON backup'],
              ['Reset Daily Points',   'Clears all daily points — does NOT affect season points'],
              ['Full Season Reset',    'Wipes all points, events, and badges — type "NEW SEASON" to confirm'],
            ].map(([key, val]) => <Row key={key} label={key} value={val} muted />)}
          </div>
        </Section>
      )}

      {/* ── 📱 Access Levels ─────────────────────────────────── */}
      {showSection('📱 Access Levels') && (
        <Section icon="📱" title="Access Levels" color={BORDER_COLORS[10]}>
          <div className="pt-2 space-y-0.5">
            <Row label="Admin PIN"  value="Full access — all features and controls unlocked" />
            <Row label="Crew PIN"   value="Read-only — Leaderboard, Crew Grid, and Profiles visible; no award or edit controls" />
            <Row label="Change PINs" value="Update ADMIN_PIN and CREW_PIN in Vercel Environment Variables, then redeploy" />
          </div>
          <Bullet>PINs are verified server-side and are never exposed to the client. Rate-limited to 5 attempts before a 60-second lockout.</Bullet>
        </Section>
      )}

      {!q && (
        <p className="text-[10px] text-[var(--text-hint)] font-body text-center py-2">
          Tap any section to expand · Admin-only reference guide
        </p>
      )}
      {q && visibleSections.length === 0 && (
        <p className="text-sm text-[var(--text-muted)] font-body text-center py-8">No results for &quot;{search}&quot;</p>
      )}
    </div>
  );
}
