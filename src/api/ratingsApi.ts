/**
 * Rating data access. Reads/writes Supabase when configured; otherwise falls
 * back to the in-memory mock data.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { ratings as mockRatings } from '../data/mockData';
import type { Rating } from '../types';
import { mapRatingRow, type RatingRow } from './mappers';

export async function fetchRatings(): Promise<Rating[]> {
  if (!isSupabaseConfigured) return mockRatings;

  const { data, error } = await supabase.from('ratings').select('*');
  if (error) throw error;
  return (data as RatingRow[]).map(mapRatingRow);
}

export async function upsertRating(rating: Rating): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('ratings').upsert(
    {
      id: rating.id,
      content_id: rating.contentId,
      user_id: rating.userId,
      score: rating.score,
    },
    { onConflict: 'content_id,user_id' },
  );
  if (error) throw error;
}
