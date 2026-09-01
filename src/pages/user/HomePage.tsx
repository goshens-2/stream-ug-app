import { useMemo, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { CategoryRow } from '../../components/CategoryRow';
import { ContentCard } from '../../components/ContentCard';
import { TrailerMarquee } from '../../components/TrailerMarquee';
import { getRecommendationsForUser, getAverageRating } from '../../utils/recommendations';
import { getMostWatched } from '../../utils/analytics';
import type { Content } from '../../types';
import './HomePage.css';

type SortOption = 'trending' | 'newest' | 'top-rated' | 'title';

/** The main User Panel landing page: trailer marquee and category rows. */
export function HomePage() {
  const { contents, categories, ratings, viewHistory, currentUser } = useAppState();
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('trending');

  const recommendations = useMemo(
    () => (currentUser ? getRecommendationsForUser(currentUser.id, contents, ratings, 6) : []),
    [currentUser, contents, ratings],
  );

  const recommendedContent = recommendations
    .map((rec) => contents.find((c) => c.id === rec.contentId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const myViewHistory = useMemo(
    () =>
      viewHistory
        .filter((v) => v.userId === currentUser?.id)
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [viewHistory, currentUser],
  );

  const continueWatching = myViewHistory
    .filter((v) => v.durationSeconds > 0 && v.progressSeconds > 0 && v.progressSeconds < v.durationSeconds * 0.95)
    .map((v) => contents.find((c) => c.id === v.contentId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const recentlyViewed = myViewHistory
    .map((v) => contents.find((c) => c.id === v.contentId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, 8);

  const featuredAndTrending = useMemo(() => {
    const watchCounts = new Map(getMostWatched(viewHistory).map((c) => [c.contentId, c.count]));
    return contents
      .slice()
      .sort((a, b) => {
        const score = (id: string) => (watchCounts.get(id) ?? 0) * 2 + getAverageRating(id, ratings);
        return score(b.id) - score(a.id);
      })
      .slice(0, 8);
  }, [contents, viewHistory, ratings]);

  const recentlyAdded = useMemo(
    () =>
      contents
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [contents],
  );

  const popular = useMemo(() => {
    const watchCounts = new Map(getMostWatched(viewHistory).map((c) => [c.contentId, c.count]));
    return contents
      .slice()
      .sort((a, b) => (watchCounts.get(b.id) ?? 0) - (watchCounts.get(a.id) ?? 0))
      .slice(0, 8);
  }, [contents, viewHistory]);

  const watchCountMap = useMemo(
    () => new Map(getMostWatched(viewHistory).map((c) => [c.contentId, c.count])),
    [viewHistory],
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
      default: {
        const watchCounts = new Map(getMostWatched(viewHistory).map((c) => [c.contentId, c.count]));
        list.sort((a, b) => (watchCounts.get(b.id) ?? 0) - (watchCounts.get(a.id) ?? 0));
        break;
      }
    }
    return list;
  }, [contents, genreFilter, sortOption, ratings, viewHistory]);

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
          category={{ id: 'featured', name: 'Featured & Trending', slug: 'featured' }}
          contents={featuredAndTrending}
          exploreId="trending"
        />
      )}

      {continueWatching.length > 0 && (
        <CategoryRow
          category={{ id: 'continue-watching', name: 'Continue Watching', slug: 'continue-watching' }}
          contents={continueWatching}
          exploreId="continue-watching"
        />
      )}

      {recommendedContent.length > 0 && (
        <CategoryRow
          category={{ id: 'recommended', name: 'Recommended For You', slug: 'recommended' }}
          contents={recommendedContent}
          exploreId="recommended"
        />
      )}

      {recentlyViewed.length > 0 && (
        <CategoryRow
          category={{ id: 'recently-viewed', name: 'Recently Viewed', slug: 'recently-viewed' }}
          contents={recentlyViewed}
          exploreId="recently-viewed"
        />
      )}

      <CategoryRow
        category={{ id: 'recently-added', name: 'Recently Added', slug: 'recently-added' }}
        contents={recentlyAdded}
        exploreId="recently-added"
      />

      <CategoryRow
        category={{ id: 'popular', name: 'Popular', slug: 'popular' }}
        contents={popular}
        exploreId="popular"
      />

      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
          contents={contents.filter((c) => c.categoryId === category.id)}
          exploreId={category.id}
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
          </div>
        </div>
        <div className="home-page__browse-all-grid">
          {filteredAndSorted.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              averageRating={getAverageRating(content.id, ratings)}
              watchCount={watchCountMap.get(content.id) ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
