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

export type NewRating = Pick<Rating, 'contentId' | 'userId' | 'score'>;

/**
 * Upserts a rating for the (content, user) pair, letting the database
 * generate the `id`/`created_at` for new rows via the `ratings` table's
 * `unique (content_id, user_id)` constraint, and returns the resulting row.
 */
export async function upsertRating(rating: NewRating): Promise<Rating> {
  if (!isSupabaseConfigured) {
    return { id: `rating-${Date.now()}`, ...rating, createdAt: new Date().toISOString() };
  }

  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      {
        content_id: rating.contentId,
        user_id: rating.userId,
        score: rating.score,
      },
      { onConflict: 'content_id,user_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return mapRatingRow(data as RatingRow);
}
