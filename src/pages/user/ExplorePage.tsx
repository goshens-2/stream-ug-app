import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ContentCard } from '../../components/ContentCard';
import {
  buildWatchCountMap,
  COLLECTION_TITLES,
  getContinueWatching,
  getFeaturedAndTrending,
  getPopular,
  getRecentlyAdded,
  getRecentlyViewed,
  getRecommendedContent,
  type CollectionKey,
} from '../../utils/collections';
import { getAverageRating } from '../../utils/recommendations';
import './ExplorePage.css';

const COLLECTION_KEYS = new Set<string>(Object.keys(COLLECTION_TITLES));

/** Full listing page for a rail/category, reached via a row's "Explore more" link. */
export function ExplorePage() {
  const { key } = useParams<{ key: string }>();
  const { contents, categories, ratings, viewHistory, currentUser } = useAppState();

  const category = categories.find((item) => item.id === key);
  const isCollection = !!key && COLLECTION_KEYS.has(key);

  const list = useMemo(() => {
    if (!key) return [];
    if (isCollection) {
      switch (key as CollectionKey) {
        case 'trending':
        case 'featured':
          return getFeaturedAndTrending(contents, viewHistory, ratings);
        case 'popular':
          return getPopular(contents, viewHistory);
        case 'recently-added':
          return getRecentlyAdded(contents);
        case 'recommended':
          return getRecommendedContent(contents, ratings, currentUser?.id, contents.length);
        case 'continue-watching':
          return getContinueWatching(contents, viewHistory, currentUser?.id);
        case 'recently-viewed':
          return getRecentlyViewed(contents, viewHistory, currentUser?.id);
        default:
          return [];
      }
    }
    return contents.filter((content) => content.categoryId === key);
  }, [key, isCollection, contents, ratings, viewHistory, currentUser]);

  const watchCounts = useMemo(() => buildWatchCountMap(viewHistory), [viewHistory]);
  const title = isCollection ? COLLECTION_TITLES[key as CollectionKey] : category?.name ?? 'Explore';

  if (!isCollection && !category) {
    return (
      <div className="explore-page">
        <p>We couldn't find that collection.</p>
        <Link to="/browse">Back to browse</Link>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <div className="explore-page__header">
        <Link to="/browse" className="explore-page__back">
          &lsaquo; Back
        </Link>
        <h1>{title}</h1>
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
              watchCount={watchCounts.get(content.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
