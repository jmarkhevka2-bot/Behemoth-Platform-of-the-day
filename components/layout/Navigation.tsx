'use client';

import { motion } from 'framer-motion';

export type ViewKey = 'leaderboard' | 'crew' | 'halloffame' | 'settings' | 'info';

const TABS: Array<{ key: ViewKey; label: string; icon: string; adminOnly?: boolean }> = [
  { key: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
  { key: 'crew',        label: 'Crew',         icon: '👥' },
  { key: 'halloffame',  label: 'Hall of Fame',  icon: '🏛️' },
  { key: 'settings',    label: 'Settings',      icon: '⚙️', adminOnly: true },
  { key: 'info',        label: 'Info',          icon: 'ℹ️', adminOnly: true },
];

interface Props {
  active:   ViewKey;
  onChange: (key: ViewKey) => void;
  isAdmin:  boolean;
}

export default function Navigation({ active, onChange, isAdmin }: Props) {
  const visible = TABS.filter(t => !t.adminOnly || isAdmin);
  return (
    <nav className="relative flex border-b border-[var(--border)] bg-[var(--bg-card)]" role="tablist">
      {visible.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          role="tab"
          aria-selected={active === tab.key}
          aria-label={tab.label}
          className={`
            relative flex-1 flex items-center justify-center gap-1.5
            py-2.5 px-2 text-xs font-body transition-colors select-none
            ${active === tab.key ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}
          `}
        >
          <span className="text-sm leading-none">{tab.icon}</span>
          <span>{tab.label}</span>

          {active === tab.key && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--text-primary)]"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}
