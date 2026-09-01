/**
 * Content data access. Reads from Supabase when configured (see
 * `src/lib/supabaseClient.ts`); otherwise falls back to the in-memory mock
 * data so the app keeps working without a backend connection.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { contents as mockContents } from '../data/mockData';
import type { Content } from '../types';
import { mapContentRow, mapContentToRow, type ContentRow } from './mappers';

export async function fetchContents(): Promise<Content[]> {
  if (!isSupabaseConfigured) return mockContents;

  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ContentRow[]).map(mapContentRow);
}

export async function upsertContent(content: Content): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('content').upsert(mapContentToRow(content));
  if (error) throw error;
}
