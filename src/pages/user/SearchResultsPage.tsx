import { useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ContentCard } from '../../components/ContentCard';
import { getAverageRating } from '../../utils/recommendations';
import { getWatchCounts } from '../../utils/analytics';
import './SearchResultsPage.css';

/** Full-catalog search results page, reached from the Navbar search box. */
export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const { contents, ratings, viewHistory, categories, logSearch } = useAppState();

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return contents.filter((c) => {
      const category = categories.find((cat) => cat.id === c.categoryId);
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        category?.name.toLowerCase().includes(q)
      );
    });
  }, [query, contents, categories]);

  const watchCounts = useMemo(() => getWatchCounts(viewHistory), [viewHistory]);

  const lastLoggedQuery = useRef<string | null>(null);
  useEffect(() => {
    if (!query || lastLoggedQuery.current === query) return;
    lastLoggedQuery.current = query;
    logSearch(query, results[0]?.id);
  }, [query, results, logSearch]);

  return (
    <div className="search-results-page">
      <h1>Search results for &ldquo;{query}&rdquo;</h1>
      {query === '' ? (
        <p className="search-results-page__empty">
          Use the search bar above to find movies, shows, or genres.
        </p>
      ) : results.length === 0 ? (
        <p className="search-results-page__empty">
          No matches. <Link to="/browse/requests">Request this title</Link> instead?
        </p>
      ) : (
        <div className="search-results-page__grid">
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
