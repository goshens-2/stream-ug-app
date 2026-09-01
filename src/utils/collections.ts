import type { Content, Rating, ViewHistoryEntry } from '../types';
import { getAverageRating, getRecommendationsForUser } from './recommendations';
import { getWatchCounts } from './analytics';

/** Keys identifying a curated "rail"/collection surfaced on the Home page, each with its own "Explore more" listing. */
export type CollectionKey =
  | 'trending'
  | 'popular'
  | 'recently-added'
  | 'recommended'
  | 'continue-watching'
  | 'recently-viewed';

export const COLLECTION_TITLES: Record<CollectionKey, string> = {
  trending: 'Trending Now',
  popular: 'Popular on STREAM UG',
  'recently-added': 'Recently Added',
  recommended: 'Recommended For You',
  'continue-watching': 'Continue Watching',
  'recently-viewed': 'Recently Viewed',
};

/** Ranks content by a blend of watch count and average rating, highest first. */
export function getTrending(contents: Content[], ratings: Rating[], viewHistory: ViewHistoryEntry[]): Content[] {
  const watchCounts = getWatchCounts(viewHistory);
  return contents
    .slice()
    .sort((a, b) => {
      const score = (id: string) => (watchCounts.get(id) ?? 0) * 2 + getAverageRating(id, ratings);
      return score(b.id) - score(a.id);
    });
}

/** Ranks content purely by how many people have watched it, most-watched first. */
export function getPopular(contents: Content[], viewHistory: ViewHistoryEntry[]): Content[] {
  const watchCounts = getWatchCounts(viewHistory);
  return contents
    .slice()
    .sort((a, b) => (watchCounts.get(b.id) ?? 0) - (watchCounts.get(a.id) ?? 0));
}

/** Orders content by upload/creation date, newest first. */
export function getRecentlyAdded(contents: Content[]): Content[] {
  return contents
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Content recommended for a specific user, ordered by recommendation score. */
export function getRecommended(userId: string | undefined, contents: Content[], ratings: Rating[]): Content[] {
  if (!userId) return [];
  return getRecommendationsForUser(userId, contents, ratings, contents.length)
    .map((rec) => contents.find((c) => c.id === rec.contentId))
    .filter((c): c is Content => Boolean(c));
}

/** A user's in-progress titles (not yet finished), most recently updated first. */
export function getContinueWatching(
  userId: string | undefined,
  contents: Content[],
  viewHistory: ViewHistoryEntry[],
): Content[] {
  if (!userId) return [];
  return viewHistory
    .filter((v) => v.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .filter((v) => v.durationSeconds > 0 && v.progressSeconds > 0 && v.progressSeconds < v.durationSeconds * 0.95)
    .map((v) => contents.find((c) => c.id === v.contentId))
    .filter((c): c is Content => Boolean(c));
}

/** Everything a user has viewed, most recently updated first (regardless of completion). */
export function getRecentlyViewed(
  userId: string | undefined,
  contents: Content[],
  viewHistory: ViewHistoryEntry[],
): Content[] {
  if (!userId) return [];
  return viewHistory
    .filter((v) => v.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((v) => contents.find((c) => c.id === v.contentId))
    .filter((c): c is Content => Boolean(c));
}
