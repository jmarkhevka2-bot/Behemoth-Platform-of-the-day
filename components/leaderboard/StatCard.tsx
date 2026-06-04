'use client';

import { motion } from 'framer-motion';
import PointCounter from '@/components/ui/PointCounter';

interface Props {
  icon: string;
  label: string;
  value: number | string;
}

export default function StatCard({ icon, label, value }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center"
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
