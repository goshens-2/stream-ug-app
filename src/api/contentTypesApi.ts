/**
 * Content type data access. Reads from Supabase when configured; otherwise
 * falls back to the in-memory mock data.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { contentTypes as mockContentTypes } from '../data/mockData';
import type { ContentType } from '../types';
import { mapContentTypeRow, type ContentTypeRow } from './mappers';

export async function fetchContentTypes(): Promise<ContentType[]> {
  if (!isSupabaseConfigured) return mockContentTypes;

  const { data, error } = await supabase.from('content_types').select('*').order('name');
  if (error) throw error;
  return (data as ContentTypeRow[]).map(mapContentTypeRow);
}

export async function insertContentType(contentType: Omit<ContentType, 'id'>): Promise<ContentType> {
  if (!isSupabaseConfigured) {
    // Mock fallback: fabricate a local id so the caller can still render it.
    return { id: `ct-${Date.now()}`, ...contentType };
  }

  const { data, error } = await supabase
    .from('content_types')
    .insert({ name: contentType.name, description: contentType.description ?? null })
    .select()
    .single();
  if (error) throw error;
  return mapContentTypeRow(data as ContentTypeRow);
}
