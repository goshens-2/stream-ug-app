/**
 * Favorites/watchlist data access. Reads/writes Supabase when configured;
 * otherwise falls back to the in-memory mock data.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { favorites as mockFavorites } from '../data/mockData';
import type { Favorite } from '../types';
import { mapFavoriteRow, type FavoriteRow } from './mappers';

export async function fetchFavorites(): Promise<Favorite[]> {
  if (!isSupabaseConfigured) return mockFavorites;

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as FavoriteRow[]).map(mapFavoriteRow);
}

export async function addFavorite(userId: string, contentId: string): Promise<Favorite> {
  if (!isSupabaseConfigured) {
    return { id: `fav-${Date.now()}`, userId, contentId, createdAt: new Date().toISOString() };
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, content_id: contentId })
    .select()
    .single();
  if (error) throw error;
  return mapFavoriteRow(data as FavoriteRow);
}

export async function removeFavorite(userId: string, contentId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('content_id', contentId);
  if (error) throw error;
}
