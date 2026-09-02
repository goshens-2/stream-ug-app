import type { Category, Content, Rating, ViewHistoryEntry } from '../types';
import { getWatchCounts } from './analytics';
import { getAverageRating, getRecommendationsForUser } from './recommendations';

export const FEATURED_COLLECTION_ID = 'featured';
export const POPULAR_COLLECTION_ID = 'popular';
export const RECENTLY_ADDED_COLLECTION_ID = 'recently-added';
export const CONTINUE_WATCHING_COLLECTION_ID = 'continue-watching';
export const RECOMMENDED_COLLECTION_ID = 'recommended';
export const RECENTLY_VIEWED_COLLECTION_ID = 'recently-viewed';

/** A lightweight, human-facing description of a homepage row/collection. */
export interface Collection {
  id: string;
  name: string;
}

export const SYNTHETIC_COLLECTIONS: Record<string, Collection> = {
  [FEATURED_COLLECTION_ID]: { id: FEATURED_COLLECTION_ID, name: 'Featured & Trending' },
  [POPULAR_COLLECTION_ID]: { id: POPULAR_COLLECTION_ID, name: 'Popular on STREAM UG' },
  [RECENTLY_ADDED_COLLECTION_ID]: { id: RECENTLY_ADDED_COLLECTION_ID, name: 'Recently Added' },
  [CONTINUE_WATCHING_COLLECTION_ID]: { id: CONTINUE_WATCHING_COLLECTION_ID, name: 'Continue Watching' },
  [RECOMMENDED_COLLECTION_ID]: { id: RECOMMENDED_COLLECTION_ID, name: 'Recommended For You' },
  [RECENTLY_VIEWED_COLLECTION_ID]: { id: RECENTLY_VIEWED_COLLECTION_ID, name: 'Recently Viewed' },
};

/** Builds a `contentId -> watch count` lookup from view history, for display on cards. */
export function buildWatchCountMap(viewHistory: ViewHistoryEntry[]): Map<string, number> {
  return getWatchCounts(viewHistory);
}

/** Content ranked by a blend of watch count and average rating, highest first. */
export function getFeaturedAndTrending(
  contents: Content[],
  viewHistory: ViewHistoryEntry[],
  ratings: Rating[],
): Content[] {
  const watchCounts = buildWatchCountMap(viewHistory);
  return contents
    .slice()
    .sort((a, b) => {
      const score = (id: string) => (watchCounts.get(id) ?? 0) * 2 + getAverageRating(id, ratings);
      return score(b.id) - score(a.id);
    });
}

/** Ranks content purely by how many people have watched it, most-watched first. */
export function getPopular(contents: Content[], viewHistory: ViewHistoryEntry[]): Content[] {
  const watchCounts = buildWatchCountMap(viewHistory);
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

/** Recommended titles for a signed-in user, resolved to full `Content` records. */
export function getRecommendedContent(
  contents: Content[],
  ratings: Rating[],
  userId: string | undefined,
  limit = 12,
): Content[] {
  if (!userId) return [];
  return getRecommendationsForUser(userId, contents, ratings, limit)
    .map((rec) => contents.find((content) => content.id === rec.contentId))
    .filter((content): content is Content => Boolean(content));
}

/** Titles a signed-in user has started but not finished watching, most recent first. */
export function getContinueWatching(
  contents: Content[],
  viewHistory: ViewHistoryEntry[],
  userId: string | undefined,
): Content[] {
  if (!userId) return [];
  return viewHistory
    .filter((entry) => entry.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .filter(
      (entry) =>
        entry.durationSeconds > 0 &&
        entry.progressSeconds > 0 &&
        entry.progressSeconds < entry.durationSeconds * 0.95,
    )
    .map((entry) => contents.find((content) => content.id === entry.contentId))
    .filter((content): content is Content => Boolean(content));
}

/** Titles a signed-in user has viewed recently, most recent first. */
export function getRecentlyViewed(
  contents: Content[],
  viewHistory: ViewHistoryEntry[],
  userId: string | undefined,
): Content[] {
  if (!userId) return [];
  return viewHistory
    .filter((entry) => entry.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((entry) => contents.find((content) => content.id === entry.contentId))
    .filter((content): content is Content => Boolean(content));
}

/** Resolves a collection id (real category or synthetic collection) to a display name. */
export function resolveCollectionName(collectionId: string, categories: Category[]): string {
  return SYNTHETIC_COLLECTIONS[collectionId]?.name ?? categories.find((category) => category.id === collectionId)?.name ?? 'Titles';
}
