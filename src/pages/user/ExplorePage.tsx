import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ContentCard } from '../../components/ContentCard';
import { getAverageRating, getRecommendationsForUser } from '../../utils/recommendations';
import { getMostWatched } from '../../utils/analytics';
import type { Content } from '../../types';
import './ExplorePage.css';

/** Ids for the virtual (non-category) rows that can be "explored" from the home page. */
const VIRTUAL_ROW_TITLES: Record<string, string> = {
  trending: 'Featured & Trending',
  popular: 'Popular',
  'recently-added': 'Recently Added',
  recommended: 'Recommended For You',
  'continue-watching': 'Continue Watching',
  'recently-viewed': 'Recently Viewed',
};

/**
 * Full listing page reached via a row's "Explore more" link. Supports both
 * real categories (by id) and the virtual home-page rows (trending, popular, etc).
 */
export function ExplorePage() {
  const { id } = useParams<{ id: string }>();
  const { contents, categories, ratings, viewHistory, currentUser } = useAppState();

  const category = categories.find((c) => c.id === id);

  const watchCounts = useMemo(
    () => new Map(getMostWatched(viewHistory).map((c) => [c.contentId, c.count])),
    [viewHistory],
  );

  const list: Content[] = useMemo(() => {
    if (category) {
      return contents.filter((c) => c.categoryId === category.id);
    }
    switch (id) {
      case 'trending':
        return contents
          .slice()
          .sort((a, b) => {
            const score = (cid: string) => (watchCounts.get(cid) ?? 0) * 2 + getAverageRating(cid, ratings);
            return score(b.id) - score(a.id);
          });
      case 'popular':
        return contents
          .slice()
          .sort((a, b) => (watchCounts.get(b.id) ?? 0) - (watchCounts.get(a.id) ?? 0));
      case 'recently-added':
        return contents
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'recommended': {
        const recs = currentUser ? getRecommendationsForUser(currentUser.id, contents, ratings, contents.length) : [];
        return recs
          .map((rec) => contents.find((c) => c.id === rec.contentId))
          .filter((c): c is Content => Boolean(c));
      }
      case 'continue-watching': {
        const mine = viewHistory
          .filter((v) => v.userId === currentUser?.id)
          .filter((v) => v.durationSeconds > 0 && v.progressSeconds > 0 && v.progressSeconds < v.durationSeconds * 0.95)
          .slice()
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return mine.map((v) => contents.find((c) => c.id === v.contentId)).filter((c): c is Content => Boolean(c));
      }
      case 'recently-viewed': {
        const mine = viewHistory
          .filter((v) => v.userId === currentUser?.id)
          .slice()
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return mine.map((v) => contents.find((c) => c.id === v.contentId)).filter((c): c is Content => Boolean(c));
      }
      default:
        return [];
    }
  }, [category, contents, id, ratings, watchCounts, currentUser, viewHistory]);

  const title = category?.name ?? (id ? VIRTUAL_ROW_TITLES[id] : undefined);

  if (!title) {
    return (
      <div className="explore-page">
        <p>We couldn't find that row.</p>
        <Link to="/browse">Back to browse</Link>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <div className="explore-page__header">
        <h1>{title}</h1>
        <Link to="/browse" className="explore-page__back">
          ← Back to browse
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="explore-page__empty">Nothing here yet.</p>
      ) : (
        <div className="explore-page__grid">
          {list.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              averageRating={getAverageRating(content.id, ratings)}
              watchCount={watchCounts.get(content.id) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
