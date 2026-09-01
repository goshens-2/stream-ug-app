import type { Content, Rating, Recommendation } from '../types';

/**
 * Very small recommendation scaffold.
 *
 * This is intentionally simple: it favors content in categories the user has
 * rated highly before, and falls back to the highest-rated content overall
 * for users with no rating history. It is meant to be swapped out for a
 * proper collaborative-filtering or ML-based service later.
 */
export function getRecommendationsForUser(
  userId: string,
  allContent: Content[],
  allRatings: Rating[],
  limit = 5,
): Recommendation[] {
  const userRatings = allRatings.filter((r) => r.userId === userId);
  const ratedContentIds = new Set(userRatings.map((r) => r.contentId));

  const favoriteCategoryScores = new Map<string, number>();
  for (const rating of userRatings) {
    const content = allContent.find((c) => c.id === rating.contentId);
    if (!content) continue;
    const prev = favoriteCategoryScores.get(content.categoryId) ?? 0;
    favoriteCategoryScores.set(content.categoryId, prev + rating.score);
  }

  const candidates = allContent.filter((c) => !ratedContentIds.has(c.id));

  const scored = candidates.map((content) => {
    const categoryAffinity = favoriteCategoryScores.get(content.categoryId) ?? 0;
    const averageRating = getAverageRating(content.id, allRatings);
    const score = categoryAffinity * 2 + averageRating;
    const reason =
      categoryAffinity > 0
        ? `Because you enjoyed similar content`
        : `Popular on STREAM UG`;
    return { contentId: content.id, score, reason };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getAverageRating(contentId: string, allRatings: Rating[]): number {
  const relevant = allRatings.filter((r) => r.contentId === contentId);
  if (relevant.length === 0) return 0;
  const total = relevant.reduce((sum, r) => sum + r.score, 0);
  return total / relevant.length;
}
