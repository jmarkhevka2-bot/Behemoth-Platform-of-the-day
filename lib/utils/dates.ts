export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateKey(new Date());
}

export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === toDateKey(yesterday);
}

export function calculateNewStreak(
  currentStreak: number,
  lastPointDate: string | null,
): number {
  if (!lastPointDate) return 1;
  if (isToday(lastPointDate)) return currentStreak;
  if (isYesterday(lastPointDate)) return currentStreak + 1;
  return 1;
}

export function recalculateStreak(
  currentStreak: number,
  lastPointDate: string | null,
): number {
  if (!lastPointDate) return 0;
  if (isToday(lastPointDate) || isYesterday(lastPointDate)) return currentStreak;
  return 0;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
