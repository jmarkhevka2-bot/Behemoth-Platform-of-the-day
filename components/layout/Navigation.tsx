'use client';

import { motion } from 'framer-motion';

export type ViewKey = 'leaderboard' | 'crew' | 'halloffame' | 'settings';

const TABS: Array<{ key: ViewKey; label: string; icon: string }> = [
  { key: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
  { key: 'crew',        label: 'Crew',         icon: '👥' },
  { key: 'halloffame',  label: 'Hall of Fame',  icon: '🏛️' },
  { key: 'settings',    label: 'Settings',      icon: '⚙️' },
];

interface Props {
  active: ViewKey;
  onChange: (key: ViewKey) => void;
  isAdmin: boolean;
}

export default function Navigation({ active, onChange, isAdmin }: Props) {
  const visibleTabs = isAdmin ? TABS : TABS.filter(t => t.key !== 'settings');
  return (
    <nav className="relative flex border-b border-[#DDD9D2] bg-white">
      {visibleTabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            relative flex-1 flex items-center justify-center gap-1.5
            py-2.5 px-2 text-xs font-body transition-colors select-none
            ${active === tab.key ? 'text-[#1C1917]' : 'text-[#A8A29E] hover:text-[#6B6560]'}
          `}
        >
          <span className="text-sm leading-none">{tab.icon}</span>
          <span>{tab.label}</span>

          {active === tab.key && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1C1917]"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}
