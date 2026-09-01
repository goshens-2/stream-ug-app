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

export async function insertContentType(contentType: ContentType): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('content_types').insert({
    id: contentType.id,
    name: contentType.name,
    description: contentType.description ?? null,
  });
  if (error) throw error;
}
