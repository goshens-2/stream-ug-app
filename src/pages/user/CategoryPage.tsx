import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ContentCard } from '../../components/ContentCard';
import type { Content } from '../../types';
import {
  buildWatchCountMap,
  CONTINUE_WATCHING_COLLECTION_ID,
  FEATURED_COLLECTION_ID,
  getContinueWatching,
  getFeaturedAndTrending,
  getPopular,
  getRecentlyAdded,
  getRecentlyViewed,
  getRecommendedContent,
  POPULAR_COLLECTION_ID,
  RECENTLY_ADDED_COLLECTION_ID,
  RECENTLY_VIEWED_COLLECTION_ID,
  RECOMMENDED_COLLECTION_ID,
  resolveCollectionName,
} from '../../utils/collections';
import { getAverageRating } from '../../utils/recommendations';
import './CategoryPage.css';

type SortOption = 'default' | 'newest' | 'top-rated' | 'title';

/** Full listing page for a single homepage row ("Explore more" destination). */
export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { contents, categories, ratings, viewHistory, currentUser } = useAppState();
  const [sortOption, setSortOption] = useState<SortOption>('default');

  const watchCounts = useMemo(() => buildWatchCountMap(viewHistory), [viewHistory]);

  const baseList: Content[] = useMemo(() => {
    switch (categoryId) {
      case FEATURED_COLLECTION_ID:
        return getFeaturedAndTrending(contents, viewHistory, ratings);
      case POPULAR_COLLECTION_ID:
        return getPopular(contents, viewHistory);
      case RECENTLY_ADDED_COLLECTION_ID:
        return getRecentlyAdded(contents);
      case CONTINUE_WATCHING_COLLECTION_ID:
        return getContinueWatching(contents, viewHistory, currentUser?.id);
      case RECOMMENDED_COLLECTION_ID:
        return getRecommendedContent(contents, ratings, currentUser?.id, contents.length);
      case RECENTLY_VIEWED_COLLECTION_ID:
        return getRecentlyViewed(contents, viewHistory, currentUser?.id);
      default:
        return contents.filter((content) => content.categoryId === categoryId);
    }
  }, [categoryId, contents, viewHistory, ratings, currentUser]);

  const sorted = useMemo(() => {
    const list = baseList.slice();
    switch (sortOption) {
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'top-rated':
        list.sort((a, b) => getAverageRating(b.id, ratings) - getAverageRating(a.id, ratings));
        break;
      case 'title':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    return list;
  }, [baseList, sortOption, ratings]);

  const name = resolveCollectionName(categoryId ?? '', categories);

  return (
    <div className="category-page">
      <div className="category-page__header">
        <div>
          <Link to="/browse" className="category-page__back">
            &lsaquo; Back to Browse
          </Link>
          <h1>{name}</h1>
          <p className="category-page__count">
            {sorted.length} title{sorted.length === 1 ? '' : 's'}
          </p>
        </div>
        <label className="category-page__sort">
          Sort by
          <select value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)}>
            <option value="default">Default</option>
            <option value="newest">Newest</option>
            <option value="top-rated">Top Rated</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </label>
      </div>

      {sorted.length === 0 ? (
        <p className="category-page__empty">Nothing here yet.</p>
      ) : (
        <div className="category-page__grid">
          {sorted.map((content) => (
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
