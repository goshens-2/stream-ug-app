import type {
  Content,
  MovieRequest,
  Rating,
  SearchLogEntry,
  ViewHistoryEntry,
} from '../types';

export interface ContentCount {
  contentId: string;
  count: number;
}

/** Counts occurrences of `contentId` across a list, sorted descending. */
function countBy<T>(items: T[], getContentId: (item: T) => string | undefined): ContentCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const contentId = getContentId(item);
    if (!contentId) continue;
    counts.set(contentId, (counts.get(contentId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([contentId, count]) => ({ contentId, count }))
    .sort((a, b) => b.count - a.count);
}

/** Ranks content by number of ratings received (engagement), most-rated first. */
export function getMostRated(ratings: Rating[]): ContentCount[] {
  return countBy(ratings, (r) => r.contentId);
}

/** Ranks content by average rating score (quality), highest first. Requires at least `minRatings` ratings. */
export function getHighestRated(ratings: Rating[], minRatings = 1): { contentId: string; average: number; count: number }[] {
  const grouped = new Map<string, number[]>();
  for (const rating of ratings) {
    const scores = grouped.get(rating.contentId) ?? [];
    scores.push(rating.score);
    grouped.set(rating.contentId, scores);
  }
  return [...grouped.entries()]
    .filter(([, scores]) => scores.length >= minRatings)
    .map(([contentId, scores]) => ({
      contentId,
      average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      count: scores.length,
    }))
    .sort((a, b) => b.average - a.average);
}

/** Ranks content by number of distinct view-history entries (watched), most-watched first. */
export function getMostWatched(viewHistory: ViewHistoryEntry[]): ContentCount[] {
  return countBy(viewHistory, (v) => v.contentId);
}

/** Ranks content by how often it was matched by a user search, most-searched first. */
export function getMostSearched(searchLogs: SearchLogEntry[]): ContentCount[] {
  return countBy(searchLogs, (s) => s.matchedContentId);
}

export interface SearchTermCount {
  query: string;
  count: number;
}

/** Ranks raw search terms by frequency (case-insensitive), most-searched first. */
export function getTopSearchTerms(searchLogs: SearchLogEntry[]): SearchTermCount[] {
  const counts = new Map<string, number>();
  for (const log of searchLogs) {
    const key = log.query.trim().toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count);
}

export interface RequestTrend {
  title: string;
  count: number;
  latestStatus: MovieRequest['status'];
}

/** Groups movie requests by (case-insensitive) title to surface trending/duplicate requests. */
export function getTrendingRequests(requests: MovieRequest[]): RequestTrend[] {
  const grouped = new Map<string, MovieRequest[]>();
  for (const request of requests) {
    const key = request.title.trim().toLowerCase();
    const list = grouped.get(key) ?? [];
    list.push(request);
    grouped.set(key, list);
  }
  return [...grouped.entries()]
    .map(([, list]) => ({
      title: list[0].title,
      count: list.length,
      latestStatus: list[list.length - 1].status,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Resolves a `Content` title by id, falling back to the id itself if not found. */
export function resolveTitle(contentId: string, contents: Content[]): string {
  return contents.find((c) => c.id === contentId)?.title ?? contentId;
}

/** Builds a `contentId -> watch count` lookup from view history, one row per viewer. */
export function getWatchCounts(viewHistory: ViewHistoryEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of getMostWatched(viewHistory)) {
    counts.set(item.contentId, item.count);
  }
  return counts;
}

/** Formats a raw count compactly for display, e.g. `1234` -> `1.2K`, `2_500_000` -> `2.5M`. */
export function formatCompactCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(count % 1000 < 100 ? 0 : 1)}K`;
  return `${(count / 1_000_000).toFixed(count % 1_000_000 < 100_000 ? 0 : 1)}M`;
}
