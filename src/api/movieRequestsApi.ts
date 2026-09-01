/**
 * Movie request data access. Reads/writes Supabase when configured;
 * otherwise falls back to the in-memory mock data.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { movieRequests as mockMovieRequests } from '../data/mockData';
import type { MovieRequest } from '../types';
import { mapMovieRequestRow, type MovieRequestRow } from './mappers';

export async function fetchMovieRequests(): Promise<MovieRequest[]> {
  if (!isSupabaseConfigured) return mockMovieRequests;

  const { data, error } = await supabase
    .from('movie_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as MovieRequestRow[]).map(mapMovieRequestRow);
}

export type NewMovieRequest = Pick<MovieRequest, 'title' | 'note' | 'requestedBy'>;

/**
 * Inserts a new movie request, letting the database generate its `id` and
 * `created_at`/`status` defaults, and returns the created row. In mock mode,
 * fabricates a local id/timestamp so the UI still has something to render.
 */
export async function insertMovieRequest(request: NewMovieRequest): Promise<MovieRequest> {
  if (!isSupabaseConfigured) {
    return {
      id: `request-${Date.now()}`,
      title: request.title,
      note: request.note,
      requestedBy: request.requestedBy,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from('movie_requests')
    .insert({
      title: request.title,
      note: request.note ?? null,
      requested_by: request.requestedBy,
    })
    .select()
    .single();
  if (error) throw error;
  return mapMovieRequestRow(data as MovieRequestRow);
}

export async function updateMovieRequestStatus(
  id: string,
  status: MovieRequest['status'],
  fulfilledContentId?: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('movie_requests')
    .update({ status, fulfilled_content_id: fulfilledContentId ?? null })
    .eq('id', id);
  if (error) throw error;
}
