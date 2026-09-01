/**
 * View-history data access, powering "Continue Watching" and "Recently
 * Viewed". Reads/writes Supabase when configured; otherwise falls back to
 * the in-memory mock data.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { viewHistory as mockViewHistory } from '../data/mockData';
import type { ViewHistoryEntry } from '../types';
import { mapViewHistoryRow, type ViewHistoryRow } from './mappers';

export async function fetchViewHistory(): Promise<ViewHistoryEntry[]> {
  if (!isSupabaseConfigured) return mockViewHistory;

  const { data, error } = await supabase
    .from('view_history')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as ViewHistoryRow[]).map(mapViewHistoryRow);
}

export type ViewProgress = Pick<
  ViewHistoryEntry,
  'userId' | 'contentId' | 'progressSeconds' | 'durationSeconds'
>;

/** Upserts the (user, content) view-progress row, keyed by the unique pair. */
export async function upsertViewHistory(entry: ViewProgress): Promise<ViewHistoryEntry> {
  if (!isSupabaseConfigured) {
    return { id: `view-${Date.now()}`, ...entry, updatedAt: new Date().toISOString() };
  }

  const { data, error } = await supabase
    .from('view_history')
    .upsert(
      {
        user_id: entry.userId,
        content_id: entry.contentId,
        progress_seconds: entry.progressSeconds,
        duration_seconds: entry.durationSeconds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,content_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return mapViewHistoryRow(data as ViewHistoryRow);
}
