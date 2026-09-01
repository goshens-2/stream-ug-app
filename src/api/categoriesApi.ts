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

/**
 * Inserts a new category, letting the database generate its `id` (see
 * `supabase/schema.sql`), and returns the created row mapped back to the
 * app's `Category` shape. In mock mode, fabricates a local id so the caller
 * can still render it.
 */
export async function insertCategory(category: Omit<Category, 'id'>): Promise<Category> {
  if (!isSupabaseConfigured) {
    return { id: `cat-${Date.now()}`, ...category };
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapCategoryRow(data as CategoryRow);
}
