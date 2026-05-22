import type { Associate, AppState } from '../types';

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(associates: Associate[]): void {
  const headers = [
    'First Name', 'Last Name', 'Season Points', 'Daily Points',
    'Tier', 'POTD Wins', 'Streak', 'Notes',
  ];
  const rows = associates.map(a => [
    a.firstName,
    a.lastName,
    a.seasonPoints,
    a.dailyPoints,
    a.currentTier,
    a.potdWins,
    a.streak,
    `"${a.notes.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const date = new Date().toISOString().slice(0, 10);
  downloadBlob(csv, `behemoth-potd-${date}.csv`, 'text/csv');
}

export function exportToJSON(state: AppState): void {
  const json = JSON.stringify(state, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  downloadBlob(json, `behemoth-potd-backup-${date}.json`, 'application/json');
}

export function importFromJSON(
  file: File,
  onSuccess: (state: AppState) => void,
  onError: (msg: string) => void,
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const raw = e.target?.result as string;
      const parsed = JSON.parse(raw) as AppState;
      if (!parsed.associates || !Array.isArray(parsed.associates)) {
        onError('Invalid backup file: missing associates array.');
        return;
      }
      onSuccess(parsed);
    } catch {
      onError('Failed to parse backup file. Make sure it\'s a valid JSON export.');
    }
  };
  reader.onerror = () => onError('Failed to read file.');
  reader.readAsText(file);
}
