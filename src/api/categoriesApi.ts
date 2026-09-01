/**
 * Category data access. Reads from Supabase when configured; otherwise falls
 * back to the in-memory mock data.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { categories as mockCategories } from '../data/mockData';
import type { Category } from '../types';
import { mapCategoryRow, type CategoryRow } from './mappers';

export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return mockCategories;

  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return (data as CategoryRow[]).map(mapCategoryRow);
}
