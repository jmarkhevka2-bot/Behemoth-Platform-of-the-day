'use client';

interface Props {
  icon: string;
  title: string;
  color: string;
}

export default function SectionHeader({ icon, title, color }: Props) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <h2 className="font-heading text-xs tracking-widest" style={{ color }}>
        {title}
      </h2>
      <div className="flex-1 h-px" style={{ background: `${color}60` }} />
    </div>
  );
}
