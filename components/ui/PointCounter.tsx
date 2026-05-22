'use client';

import { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

interface Props {
  value: number;
  className?: string;
}

export default function PointCounter({ value, className = '' }: Props) {
  const count = useMotionValue(value);
  const spring = useSpring(count, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, Math.round);

  useEffect(() => {
    count.set(value);
  }, [value, count]);

  return <motion.span className={className}>{display}</motion.span>;
}
