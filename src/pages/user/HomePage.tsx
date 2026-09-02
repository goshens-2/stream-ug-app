import { useMemo, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { CategoryRow } from '../../components/CategoryRow';
import { ContentCard } from '../../components/ContentCard';
import { TrailerMarquee } from '../../components/TrailerMarquee';
import { getAverageRating } from '../../utils/recommendations';
<<<<<<< HEAD
import { getWatchCounts } from '../../utils/analytics';
import {
  getContinueWatching,
  getPopular,
  getRecentlyAdded,
  getRecentlyViewed,
  getRecommended,
  getTrending,
=======
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
>>>>>>> origin/copilot/goshens-2stream-ug-app
} from '../../utils/collections';
import type { Content } from '../../types';
import './HomePage.css';

type SortOption = 'trending' | 'newest' | 'top-rated' | 'title';

<<<<<<< HEAD
/** The main User Panel landing page: trailer marquee and horizontal movie rails. */
=======
/** Max number of titles shown per horizontal row before an "Explore more" card appears. */
const ROW_LIMIT = 12;

/** The main User Panel landing page: trailer marquee and category rows. */
>>>>>>> origin/copilot/goshens-2stream-ug-app
export function HomePage() {
  const { contents, categories, ratings, viewHistory, currentUser } = useAppState();
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [minimumRating, setMinimumRating] = useState('all');

<<<<<<< HEAD
  const watchCounts = useMemo(() => getWatchCounts(viewHistory), [viewHistory]);

  const trending = useMemo(
    () => getTrending(contents, ratings, viewHistory),
    [contents, ratings, viewHistory],
  );

  const popular = useMemo(() => getPopular(contents, viewHistory), [contents, viewHistory]);

  const recentlyAdded = useMemo(() => getRecentlyAdded(contents), [contents]);

  const recommendedContent = useMemo(
    () => getRecommended(currentUser?.id, contents, ratings),
    [currentUser, contents, ratings],
  );

  const continueWatching = useMemo(
    () => getContinueWatching(currentUser?.id, contents, viewHistory),
    [currentUser, contents, viewHistory],
  );

  const recentlyViewed = useMemo(
    () => getRecentlyViewed(currentUser?.id, contents, viewHistory),
    [currentUser, contents, viewHistory],
=======
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
>>>>>>> origin/copilot/goshens-2stream-ug-app
  );

  const filteredAndSorted = useMemo(() => {
    let list: Content[] = genreFilter === 'all' ? contents : contents.filter((c) => c.categoryId === genreFilter);
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
<<<<<<< HEAD
  }, [contents, genreFilter, languageFilter, yearFilter, minimumRating, sortOption, ratings, watchCounts]);

  const languages = useMemo(
    () => [...new Set(contents.map((content) => content.language).filter((language): language is string => Boolean(language)))].sort(),
    [contents],
  );
  const years = useMemo(() => [...new Set(contents.map((content) => content.releaseYear))].sort((a, b) => b - a), [contents]);
=======
  }, [contents, genreFilter, sortOption, ratings, watchCounts]);
>>>>>>> origin/copilot/goshens-2stream-ug-app

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

      {trending.length > 0 && (
        <CategoryRow
<<<<<<< HEAD
          category={{ id: 'trending', name: 'Trending Now', slug: 'trending' }}
          contents={trending}
          exploreMoreTo="/browse/explore/trending"
=======
          category={{ id: FEATURED_COLLECTION_ID, name: 'Featured & Trending' }}
          contents={featuredAndTrending.slice(0, ROW_LIMIT)}
          totalCount={featuredAndTrending.length}
>>>>>>> origin/copilot/goshens-2stream-ug-app
          watchCounts={watchCounts}
        />
      )}

      {continueWatching.length > 0 && (
        <CategoryRow
<<<<<<< HEAD
          category={{ id: 'continue-watching', name: 'Continue Watching', slug: 'continue-watching' }}
          contents={continueWatching}
          exploreMoreTo="/browse/explore/continue-watching"
          watchCounts={watchCounts}
        />
      )}

      {popular.length > 0 && (
        <CategoryRow
          category={{ id: 'popular', name: 'Popular on STREAM UG', slug: 'popular' }}
          contents={popular}
          exploreMoreTo="/browse/explore/popular"
=======
          category={{ id: CONTINUE_WATCHING_COLLECTION_ID, name: 'Continue Watching' }}
          contents={continueWatching.slice(0, ROW_LIMIT)}
          totalCount={continueWatching.length}
>>>>>>> origin/copilot/goshens-2stream-ug-app
          watchCounts={watchCounts}
        />
      )}

      {recommendedContent.length > 0 && (
        <CategoryRow
<<<<<<< HEAD
          category={{ id: 'recommended', name: 'Recommended For You', slug: 'recommended' }}
          contents={recommendedContent}
          exploreMoreTo="/browse/explore/recommended"
          watchCounts={watchCounts}
        />
      )}

      {recentlyAdded.length > 0 && (
        <CategoryRow
          category={{ id: 'recently-added', name: 'Recently Added', slug: 'recently-added' }}
          contents={recentlyAdded}
          exploreMoreTo="/browse/explore/recently-added"
=======
          category={{ id: RECOMMENDED_COLLECTION_ID, name: 'Recommended For You' }}
          contents={recommendedContent.slice(0, ROW_LIMIT)}
          totalCount={recommendedContent.length}
>>>>>>> origin/copilot/goshens-2stream-ug-app
          watchCounts={watchCounts}
        />
      )}

      {recentlyViewed.length > 0 && (
        <CategoryRow
<<<<<<< HEAD
          category={{ id: 'recently-viewed', name: 'Recently Viewed', slug: 'recently-viewed' }}
          contents={recentlyViewed}
          exploreMoreTo="/browse/explore/recently-viewed"
=======
          category={{ id: RECENTLY_VIEWED_COLLECTION_ID, name: 'Recently Viewed' }}
          contents={recentlyViewed.slice(0, ROW_LIMIT)}
          totalCount={recentlyViewed.length}
>>>>>>> origin/copilot/goshens-2stream-ug-app
          watchCounts={watchCounts}
        />
      )}

<<<<<<< HEAD
      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
          contents={contents.filter((c) => c.categoryId === category.id)}
          exploreMoreTo={`/browse/explore/${category.id}`}
          watchCounts={watchCounts}
        />
      ))}
=======
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
>>>>>>> origin/copilot/goshens-2stream-ug-app

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
            <label>
              Language
              <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                <option value="all">All languages</option>
                {languages.map((language) => <option key={language} value={language}>{language}</option>)}
              </select>
            </label>
            <label>
              Year
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="all">All years</option>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
            <label>
              User rating
              <select value={minimumRating} onChange={(e) => setMinimumRating(e.target.value)}>
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
