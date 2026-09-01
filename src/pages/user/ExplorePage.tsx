import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ContentCard } from '../../components/ContentCard';
import { getAverageRating } from '../../utils/recommendations';
import { getWatchCounts } from '../../utils/analytics';
import {
  COLLECTION_TITLES,
  getContinueWatching,
  getPopular,
  getRecentlyAdded,
  getRecentlyViewed,
  getRecommended,
  getTrending,
  type CollectionKey,
} from '../../utils/collections';
import './ExplorePage.css';

const COLLECTION_KEYS = new Set<string>(Object.keys(COLLECTION_TITLES));

/** Full listing page for a rail/category, reached via a row's "Explore more" link. */
export function ExplorePage() {
  const { key } = useParams<{ key: string }>();
  const { contents, categories, ratings, viewHistory, currentUser } = useAppState();

  const category = categories.find((c) => c.id === key);
  const isCollection = !!key && COLLECTION_KEYS.has(key);

  const list = useMemo(() => {
    if (!key) return [];
    if (isCollection) {
      switch (key as CollectionKey) {
        case 'trending':
          return getTrending(contents, ratings, viewHistory);
        case 'popular':
          return getPopular(contents, viewHistory);
        case 'recently-added':
          return getRecentlyAdded(contents);
        case 'recommended':
          return getRecommended(currentUser?.id, contents, ratings);
        case 'continue-watching':
          return getContinueWatching(currentUser?.id, contents, viewHistory);
        case 'recently-viewed':
          return getRecentlyViewed(currentUser?.id, contents, viewHistory);
        default:
          return [];
      }
    }
    return contents.filter((c) => c.categoryId === key);
  }, [key, isCollection, contents, ratings, viewHistory, currentUser]);

  const watchCounts = useMemo(() => getWatchCounts(viewHistory), [viewHistory]);

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
