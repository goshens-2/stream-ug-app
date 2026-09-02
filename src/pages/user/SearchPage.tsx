import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ContentCard } from '../../components/ContentCard';
import { getAverageRating } from '../../utils/recommendations';
import { buildWatchCountMap } from '../../utils/collections';
import './SearchPage.css';

/** Full-catalog search results page, reached from the Navbar search box. */
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const { contents, categories, ratings, viewHistory, logSearch } = useAppState();

  const watchCounts = useMemo(() => buildWatchCountMap(viewHistory), [viewHistory]);

  const results = useMemo(() => {
    if (!query) return [];
    const normalized = query.toLowerCase();
    return contents.filter((content) => {
      const category = categories.find((c) => c.id === content.categoryId);
      return (
        content.title.toLowerCase().includes(normalized) ||
        content.description.toLowerCase().includes(normalized) ||
        (category?.name.toLowerCase().includes(normalized) ?? false)
      );
    });
  }, [query, contents, categories]);

  useEffect(() => {
    if (!query) return;
    logSearch(query, results[0]?.id);
    // Only log once per query change, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="search-page">
      <h1>Search results for &ldquo;{query}&rdquo;</h1>
      <p className="search-page__count">
        {results.length} title{results.length === 1 ? '' : 's'} found
      </p>
      {results.length === 0 ? (
        <p className="search-page__empty">
          No titles matched your search. Try a different keyword, or{' '}
          <Link to="/browse/requests">request it</Link>.
        </p>
      ) : (
        <div className="search-page__grid">
          {results.map((content) => (
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
