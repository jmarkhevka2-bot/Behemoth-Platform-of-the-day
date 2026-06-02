import { supabase } from './supabase';
import type { AppState, Associate, AwardEvent, Tier } from './types';
import { DEFAULT_SETTINGS, DEFAULT_TIER_CONFIGS } from './constants';
import type { Action } from './context/AppContext';

// Stable UUID for the single season_settings row — matches the SQL seed script
const SETTINGS_ROW_ID = '00000000-0000-0000-0000-000000000001';

// ─── fetchStateFromSupabase ────────────────────────────────────────────────────

export async function fetchStateFromSupabase(): Promise<AppState | null> {
  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: dbAssociates, error: assocErr },
    { data: dbEvents,     error: evErr    },
    { data: settingsRows, error: settErr  },
    { data: potdRows,     error: potdErr  },
  ] = await Promise.all([
    supabase.from('associates').select('*'),
    supabase.from('award_events').select('*').order('awarded_at', { ascending: false }),
    supabase.from('season_settings').select('*').limit(1),
    supabase
      .from('potd_history')
      .select('*')
      .eq('shift_date', today)
      .order('crowned_at', { ascending: false })
      .limit(1),
  ]);

  if (assocErr) throw new Error(`associates: ${assocErr.message}`);
  if (evErr)    throw new Error(`award_events: ${evErr.message}`);
  if (settErr)  throw new Error(`season_settings: ${settErr.message}`);
  if (potdErr)  throw new Error(`potd_history: ${potdErr.message}`);

  // No associates seeded yet
  if (!dbAssociates || dbAssociates.length === 0) return null;

  // Group events by associate_id, keep first 50 (already sorted DESC so newest first)
  const eventsByAssociate: Record<string, AwardEvent[]> = {};
  for (const ev of dbEvents ?? []) {
    if (!eventsByAssociate[ev.associate_id]) eventsByAssociate[ev.associate_id] = [];
    if (eventsByAssociate[ev.associate_id].length < 50) {
      eventsByAssociate[ev.associate_id].push({
        id:          ev.id,
        associateId: ev.associate_id,
        reason:      ev.custom_note && ev.reason_tag === 'custom'
          ? ev.custom_note
          : (ev.reason_tag ?? 'custom'),
        reasonTag:   ev.reason_tag ?? 'custom',
        points:      ev.points_awarded,
        note:        ev.custom_note ?? undefined,
        timestamp:   ev.awarded_at,
        shiftId:     ev.shift_id ?? '',
      });
    }
  }

  const settingsRow = settingsRows?.[0];
  const pointValues = settingsRow?.point_values ?? DEFAULT_SETTINGS.pointValues;
  const tierConfigs = settingsRow?.tier_thresholds?.length
    ? settingsRow.tier_thresholds
    : DEFAULT_TIER_CONFIGS;

  const associates: Associate[] = dbAssociates.map(row => ({
    id:            row.id,
    lastName:      row.last_name  ?? '',
    firstName:     row.first_name ?? '',
    displayName:   row.first_name ?? '',
    emoji:         row.emoji      ?? '⭐',
    seasonPoints:  row.season_points  ?? 0,
    dailyPoints:   row.daily_points   ?? 0,
    potdWins:      row.potd_wins      ?? 0,
    streak:        row.streak         ?? 0,
    lastPointDate: row.last_awarded_date ?? null,
    currentTier:   (row.current_tier as Tier) ?? 'none',
    tiersUnlocked: (row.tiers_unlocked as Tier[]) ?? [],
    notes:         row.notes ?? '',
    awardHistory:  eventsByAssociate[row.id] ?? [],
  }));

  return {
    associates,
    shift: {
      id:             settingsRow?.shift_id       ?? '',
      active:         settingsRow?.shift_active   ?? false,
      startTime:      settingsRow?.shift_start_time ?? null,
      target:         settingsRow?.daily_target   ?? DEFAULT_SETTINGS.dispatchTarget,
      dailyChallenge: '',
      date:           settingsRow?.current_date   ?? '',
    },
    settings: {
      soundEnabled:   DEFAULT_SETTINGS.soundEnabled,
      darkMode:       DEFAULT_SETTINGS.darkMode,
      dispatchTarget: settingsRow?.daily_target   ?? DEFAULT_SETTINGS.dispatchTarget,
      pointValues,
      tiers: tierConfigs,
    },
    potdWinner:          potdRows?.[0]?.associate_id ?? null,
    pendingCelebration:  null,
    pendingPOTD:         false,
    lastEndShiftData:    null,
    lastAward:           null,
  };
}

// ─── syncToSupabase ────────────────────────────────────────────────────────────

export async function syncToSupabase(
  state: AppState,
  syncedIds: { current: Set<string> }
): Promise<void> {
  // 1. Upsert all associates
  const assocRows = state.associates.map(a => ({
    id:                a.id,
    name:              `${a.lastName} ${a.firstName}`.trim(),
    first_name:        a.firstName,
    last_name:         a.lastName,
    emoji:             a.emoji,
    season_points:     a.seasonPoints,
    daily_points:      a.dailyPoints,
    potd_wins:         a.potdWins,
    current_tier:      a.currentTier,
    streak:            a.streak,
    last_awarded_date: a.lastPointDate ?? null,
    notes:             a.notes,
    tiers_unlocked:    a.tiersUnlocked,
  }));

  // 2. Upsert season_settings
  const settingsRow = {
    id:               SETTINGS_ROW_ID,
    daily_target:     state.settings.dispatchTarget,
    shift_active:     state.shift.active,
    shift_start_time: state.shift.startTime ?? null,
    shift_id:         state.shift.id,
    current_date:     state.shift.date,
    point_values:     state.settings.pointValues,
    tier_thresholds:  state.settings.tiers,
    potd_winner_id:   state.potdWinner ?? null,
  };

  // 3. Find new award events not yet synced
  const newEvents: object[] = [];
  for (const a of state.associates) {
    for (const ev of a.awardHistory) {
      if (!syncedIds.current.has(ev.id)) {
        newEvents.push({
          id:            ev.id,
          associate_id:  ev.associateId,
          points_awarded: ev.points,
          reason_tag:    ev.reasonTag,
          custom_note:   ev.note ?? null,
          awarded_at:    ev.timestamp,
          shift_id:      ev.shiftId,
        });
        syncedIds.current.add(ev.id);
      }
    }
  }

  // 4. Hall of fame entries
  const hofRows: object[] = [];
  for (const a of state.associates) {
    for (const tier of a.tiersUnlocked) {
      hofRows.push({
        associate_id: a.id,
        tier_reached: tier,
        reached_at:   new Date().toISOString(),
      });
    }
  }

  // Run core writes in parallel
  await Promise.all([
    supabase.from('associates').upsert(assocRows, { onConflict: 'id' }),
    supabase.from('season_settings').upsert(settingsRow, { onConflict: 'id' }),
  ]);

  // Insert new award events
  if (newEvents.length > 0) {
    await supabase.from('award_events').upsert(newEvents, { onConflict: 'id', ignoreDuplicates: true });
  }

  // Hall of fame entries
  if (hofRows.length > 0) {
    await supabase.from('hall_of_fame').upsert(hofRows, { onConflict: 'associate_id,tier_reached', ignoreDuplicates: true });
  }

  // POTD history
  if (state.potdWinner) {
    const winner = state.associates.find(a => a.id === state.potdWinner);
    if (winner) {
      await supabase.from('potd_history').upsert({
        associate_id:    state.potdWinner,
        shift_date:      state.shift.date || new Date().toISOString().slice(0, 10),
        points_that_day: winner.dailyPoints,
        crowned_at:      new Date().toISOString(),
      }, { onConflict: 'shift_date', ignoreDuplicates: true });
    }
  }
}

// ─── setupRealtimeSubscription ─────────────────────────────────────────────────

export function setupRealtimeSubscription(dispatch: (action: Action) => void): () => void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function triggerRefetch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const fresh = await fetchStateFromSupabase();
        if (fresh) dispatch({ type: 'IMPORT_STATE', state: fresh });
      } catch (e) {
        console.error('Realtime refetch failed:', e);
      }
    }, 800);
  }

  const channel = supabase
    .channel('db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'associates' },      triggerRefetch)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'season_settings' }, triggerRefetch)
    .subscribe();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    supabase.removeChannel(channel);
  };
}
