import { useMemo, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { CategoryRow } from '../../components/CategoryRow';
import { ContentCard } from '../../components/ContentCard';
import { TrailerMarquee } from '../../components/TrailerMarquee';
import { getAverageRating } from '../../utils/recommendations';
import {
  buildWatchCountMap,
  getContinueWatching,
  getFeaturedAndTrending,
  getRecentlyViewed,
  getRecommendedContent,
  CONTINUE_WATCHING_COLLECTION_ID,
  FEATURED_COLLECTION_ID,
  RECENTLY_VIEWED_COLLECTION_ID,
  RECOMMENDED_COLLECTION_ID,
} from '../../utils/collections';
import type { Content } from '../../types';
import './HomePage.css';

type SortOption = 'trending' | 'newest' | 'top-rated' | 'title';

/** Max number of titles shown per horizontal row before an "Explore more" card appears. */
const ROW_LIMIT = 12;

/** The main User Panel landing page: trailer marquee and category rows. */
export function HomePage() {
  const { contents, categories, ratings, viewHistory, currentUser } = useAppState();
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('trending');

  const watchCounts = useMemo(() => buildWatchCountMap(viewHistory), [viewHistory]);

  const recommendedContent = useMemo(
    () => getRecommendedContent(contents, ratings, currentUser?.id, ROW_LIMIT),
    [contents, ratings, currentUser],
  );

  const continueWatching = useMemo(
    () => getContinueWatching(contents, viewHistory, currentUser?.id),
    [contents, viewHistory, currentUser],
  );

  const recentlyViewed = useMemo(
    () => getRecentlyViewed(contents, viewHistory, currentUser?.id),
    [contents, viewHistory, currentUser],
  );

  const featuredAndTrending = useMemo(
    () => getFeaturedAndTrending(contents, viewHistory, ratings),
    [contents, viewHistory, ratings],
  );

  const filteredAndSorted = useMemo(() => {
    let list: Content[] = genreFilter === 'all' ? contents : contents.filter((c) => c.categoryId === genreFilter);
    list = list.slice();
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
      case 'trending':
      default:
        list.sort((a, b) => (watchCounts.get(b.id) ?? 0) - (watchCounts.get(a.id) ?? 0));
        break;
    }
    return list;
  }, [contents, genreFilter, sortOption, ratings, watchCounts]);

  return (
    <div className="home-page">
      <section className="home-page__marquee-section">
        <h2 className="category-row__title">Trailers Playing Now</h2>
        <div className="home-page__marquee-row">
          {contents.slice(0, 8).map((content) => (
            <TrailerMarquee key={content.id} content={content} />
          ))}
        </div>
      </section>

      {featuredAndTrending.length > 0 && (
        <CategoryRow
          category={{ id: FEATURED_COLLECTION_ID, name: 'Featured & Trending' }}
          contents={featuredAndTrending.slice(0, ROW_LIMIT)}
          totalCount={featuredAndTrending.length}
          watchCounts={watchCounts}
        />
      )}

      {continueWatching.length > 0 && (
        <CategoryRow
          category={{ id: CONTINUE_WATCHING_COLLECTION_ID, name: 'Continue Watching' }}
          contents={continueWatching.slice(0, ROW_LIMIT)}
          totalCount={continueWatching.length}
          watchCounts={watchCounts}
        />
      )}

      {recommendedContent.length > 0 && (
        <CategoryRow
          category={{ id: RECOMMENDED_COLLECTION_ID, name: 'Recommended For You' }}
          contents={recommendedContent.slice(0, ROW_LIMIT)}
          totalCount={recommendedContent.length}
          watchCounts={watchCounts}
        />
      )}

      {recentlyViewed.length > 0 && (
        <CategoryRow
          category={{ id: RECENTLY_VIEWED_COLLECTION_ID, name: 'Recently Viewed' }}
          contents={recentlyViewed.slice(0, ROW_LIMIT)}
          totalCount={recentlyViewed.length}
          watchCounts={watchCounts}
        />
      )}

      {categories.map((category) => {
        const categoryContent = contents.filter((c) => c.categoryId === category.id);
        return (
          <CategoryRow
            key={category.id}
            category={category}
            contents={categoryContent.slice(0, ROW_LIMIT)}
            totalCount={categoryContent.length}
            watchCounts={watchCounts}
          />
        );
      })}

      <section className="home-page__browse-all">
        <div className="home-page__browse-all-header">
          <h2 className="category-row__title">Browse All Titles</h2>
          <div className="home-page__controls">
            <label>
              Genre
              <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                <option value="all">All Genres</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sort by
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)}>
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="top-rated">Top Rated</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </label>
          </div>
        </div>
        <div className="home-page__browse-all-grid">
          {filteredAndSorted.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              averageRating={getAverageRating(content.id, ratings)}
              watchCount={watchCounts.get(content.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
