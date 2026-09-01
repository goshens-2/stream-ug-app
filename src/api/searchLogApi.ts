/**
 * Search-log data access, powering the "most searched movie" admin
 * analytic. Reads/writes Supabase when configured; otherwise falls back to
 * the in-memory mock data.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { searchLogs as mockSearchLogs } from '../data/mockData';
import type { SearchLogEntry } from '../types';
import { mapSearchLogRow, type SearchLogRow } from './mappers';

export async function fetchSearchLogs(): Promise<SearchLogEntry[]> {
  if (!isSupabaseConfigured) return mockSearchLogs;

  const { data, error } = await supabase
    .from('search_logs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as SearchLogRow[]).map(mapSearchLogRow);
}

export type NewSearchLog = Pick<SearchLogEntry, 'userId' | 'query' | 'matchedContentId'>;

export async function insertSearchLog(entry: NewSearchLog): Promise<SearchLogEntry> {
  if (!isSupabaseConfigured) {
    return { id: `search-${Date.now()}`, ...entry, createdAt: new Date().toISOString() };
  }

  const { data, error } = await supabase
    .from('search_logs')
    .insert({
      user_id: entry.userId ?? null,
      query: entry.query,
      matched_content_id: entry.matchedContentId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapSearchLogRow(data as SearchLogRow);
}
