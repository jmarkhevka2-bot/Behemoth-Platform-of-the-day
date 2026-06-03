/** Eastern Time helpers for automatic 10AM–10PM shift schedule. */

export interface ShiftOverride {
  date:    string; // YYYY-MM-DD — only applies on this date
  startHH: number;
  startMM: number;
  endHH:   number;
  endMM:   number;
}

export function getEasternTime(): { hour: number; minute: number; dateStr: string } {
  const now   = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone:  'America/Toronto',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);

  const get  = (t: string) => parts.find(p => p.type === t)?.value ?? '0';
  const hour = parseInt(get('hour'));
  return {
    hour:    hour === 24 ? 0 : hour,
    minute:  parseInt(get('minute')),
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

export function getTodayET(): string {
  return getEasternTime().dateStr;
}

export function shouldShiftBeActive(override?: ShiftOverride | null): boolean {
  const { hour, minute, dateStr } = getEasternTime();
  const current = hour * 60 + minute;

  let start = 10 * 60; // 10:00 AM default
  let end   = 22 * 60; // 10:00 PM default

  if (override?.date === dateStr) {
    start = override.startHH * 60 + override.startMM;
    end   = override.endHH   * 60 + override.endMM;
  }

  return current >= start && current < end;
}

/** Returns a formatted string like "10:00 AM ET" for the next transition. */
export function formatNextTransition(isActive: boolean, override?: ShiftOverride | null): string {
  const { dateStr } = getEasternTime();
  let start = 10 * 60;
  let end   = 22 * 60;

  if (override?.date === dateStr) {
    start = override.startHH * 60 + override.startMM;
    end   = override.endHH   * 60 + override.endMM;
  }

  const targetMinutes = isActive ? end : start;
  const hh = Math.floor(targetMinutes / 60);
  const mm = targetMinutes % 60;
  const ampm  = hh >= 12 ? 'PM' : 'AM';
  const displayH = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${displayH}:${String(mm).padStart(2, '0')} ${ampm} ET`;
}
