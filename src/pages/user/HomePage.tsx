import { useMemo, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { CategoryRow } from '../../components/CategoryRow';
import { ContentCard } from '../../components/ContentCard';
import { TrailerMarquee } from '../../components/TrailerMarquee';
import { getAverageRating } from '../../utils/recommendations';
import { getWatchCounts } from '../../utils/analytics';
import {
  getContinueWatching,
  getPopular,
  getRecentlyAdded,
  getRecentlyViewed,
  getRecommended,
  getTrending,
} from '../../utils/collections';
import type { Content } from '../../types';
import './HomePage.css';

type SortOption = 'trending' | 'newest' | 'top-rated' | 'title';

/** The main User Panel landing page: trailer marquee and horizontal movie rails. */
export function HomePage() {
  const { contents, categories, ratings, viewHistory, currentUser } = useAppState();
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [minimumRating, setMinimumRating] = useState('all');

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
  }, [contents, genreFilter, languageFilter, yearFilter, minimumRating, sortOption, ratings, watchCounts]);

  const languages = useMemo(
    () => [...new Set(contents.map((content) => content.language).filter((language): language is string => Boolean(language)))].sort(),
    [contents],
  );
  const years = useMemo(() => [...new Set(contents.map((content) => content.releaseYear))].sort((a, b) => b - a), [contents]);

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
          category={{ id: 'trending', name: 'Trending Now', slug: 'trending' }}
          contents={trending}
          exploreMoreTo="/browse/explore/trending"
          watchCounts={watchCounts}
        />
      )}

      {continueWatching.length > 0 && (
        <CategoryRow
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
          watchCounts={watchCounts}
        />
      )}

      {recommendedContent.length > 0 && (
        <CategoryRow
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
          watchCounts={watchCounts}
        />
      )}

      {recentlyViewed.length > 0 && (
        <CategoryRow
          category={{ id: 'recently-viewed', name: 'Recently Viewed', slug: 'recently-viewed' }}
          contents={recentlyViewed}
          exploreMoreTo="/browse/explore/recently-viewed"
          watchCounts={watchCounts}
        />
      )}

      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
          contents={contents.filter((c) => c.categoryId === category.id)}
          exploreMoreTo={`/browse/explore/${category.id}`}
          watchCounts={watchCounts}
        />
      ))}

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
