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

export async function insertMovieRequest(request: MovieRequest): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('movie_requests').insert({
    id: request.id,
    title: request.title,
    note: request.note ?? null,
    requested_by: request.requestedBy,
    status: request.status,
  });
  if (error) throw error;
}

export async function updateMovieRequestStatus(
  id: string,
  status: MovieRequest['status'],
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('movie_requests').update({ status }).eq('id', id);
  if (error) throw error;
}
