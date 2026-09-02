import { useMemo, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { CategoryRow } from '../../components/CategoryRow';
import { ContentCard } from '../../components/ContentCard';
import { TrailerMarquee } from '../../components/TrailerMarquee';
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
} from '../../utils/collections';
import { getAverageRating } from '../../utils/recommendations';
import './HomePage.css';

type SortOption = 'trending' | 'newest' | 'top-rated' | 'title';

const ROW_LIMIT = 12;

/** The main User Panel landing page: trailer marquee and category rows. */
export function HomePage() {
  const { contents, categories, ratings, viewHistory, currentUser } = useAppState();
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [minimumRating, setMinimumRating] = useState('all');

  const watchCounts = useMemo(() => buildWatchCountMap(viewHistory), [viewHistory]);

  const featuredAndTrending = useMemo(
    () => getFeaturedAndTrending(contents, viewHistory, ratings),
    [contents, viewHistory, ratings],
  );
  const popular = useMemo(() => getPopular(contents, viewHistory), [contents, viewHistory]);
  const recentlyAdded = useMemo(() => getRecentlyAdded(contents), [contents]);
  const recommendedContent = useMemo(
    () => getRecommendedContent(contents, ratings, currentUser?.id, contents.length),
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

  const filteredAndSorted = useMemo(() => {
    let list: Content[] = genreFilter === 'all' ? contents : contents.filter((content) => content.categoryId === genreFilter);
    if (languageFilter !== 'all') list = list.filter((content) => content.language === languageFilter);
    if (yearFilter !== 'all') list = list.filter((content) => content.releaseYear === Number(yearFilter));
    if (minimumRating !== 'all') {
      list = list.filter((content) => getAverageRating(content.id, ratings) >= Number(minimumRating));
    }
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
  }, [contents, genreFilter, languageFilter, yearFilter, minimumRating, sortOption, ratings, watchCounts]);

  const languages = useMemo(
    () => [...new Set(contents.map((content) => content.language).filter((language): language is string => Boolean(language)))].sort(),
    [contents],
  );
  const years = useMemo(
    () => [...new Set(contents.map((content) => content.releaseYear))].sort((a, b) => b - a),
    [contents],
  );

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
          contents={featuredAndTrending}
          limit={ROW_LIMIT}
          totalCount={featuredAndTrending.length}
          watchCounts={watchCounts}
        />
      )}

      {continueWatching.length > 0 && (
        <CategoryRow
          category={{ id: CONTINUE_WATCHING_COLLECTION_ID, name: 'Continue Watching' }}
          contents={continueWatching}
          limit={ROW_LIMIT}
          totalCount={continueWatching.length}
          watchCounts={watchCounts}
        />
      )}

      {popular.length > 0 && (
        <CategoryRow
          category={{ id: POPULAR_COLLECTION_ID, name: 'Popular on STREAM UG' }}
          contents={popular}
          limit={ROW_LIMIT}
          totalCount={popular.length}
          watchCounts={watchCounts}
        />
      )}

      {recommendedContent.length > 0 && (
        <CategoryRow
          category={{ id: RECOMMENDED_COLLECTION_ID, name: 'Recommended For You' }}
          contents={recommendedContent}
          limit={ROW_LIMIT}
          totalCount={recommendedContent.length}
          watchCounts={watchCounts}
        />
      )}

      {recentlyAdded.length > 0 && (
        <CategoryRow
          category={{ id: RECENTLY_ADDED_COLLECTION_ID, name: 'Recently Added' }}
          contents={recentlyAdded}
          limit={ROW_LIMIT}
          totalCount={recentlyAdded.length}
          watchCounts={watchCounts}
        />
      )}

      {recentlyViewed.length > 0 && (
        <CategoryRow
          category={{ id: RECENTLY_VIEWED_COLLECTION_ID, name: 'Recently Viewed' }}
          contents={recentlyViewed}
          limit={ROW_LIMIT}
          totalCount={recentlyViewed.length}
          watchCounts={watchCounts}
        />
      )}

      {categories.map((category) => {
        const categoryContent = contents.filter((content) => content.categoryId === category.id);
        return (
          <CategoryRow
            key={category.id}
            category={category}
            contents={categoryContent}
            limit={ROW_LIMIT}
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
              <select value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}>
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
              <select value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)}>
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="top-rated">Top Rated</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </label>
            <label>
              Language
              <select value={languageFilter} onChange={(event) => setLanguageFilter(event.target.value)}>
                <option value="all">All languages</option>
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Year
              <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
                <option value="all">All years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label>
              User rating
              <select value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)}>
                <option value="all">Any rating</option>
                <option value="4">4 stars and up</option>
                <option value="3">3 stars and up</option>
                <option value="2">2 stars and up</option>
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
