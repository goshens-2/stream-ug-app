import { useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ContentCard } from '../../components/ContentCard';
import { buildWatchCountMap } from '../../utils/collections';
import { getAverageRating } from '../../utils/recommendations';
import './SearchPage.css';

/** Full-catalog search results page, reached from the Navbar search box. */
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const { contents, categories, ratings, viewHistory, logSearch } = useAppState();
  const lastLoggedQuery = useRef<string | null>(null);

  const watchCounts = useMemo(() => buildWatchCountMap(viewHistory), [viewHistory]);

  const results = useMemo(() => {
    if (!query) return [];
    const normalized = query.toLowerCase();
    return contents.filter((content) => {
      const category = categories.find((item) => item.id === content.categoryId);
      return (
        content.title.toLowerCase().includes(normalized) ||
        content.description.toLowerCase().includes(normalized) ||
        (category?.name.toLowerCase().includes(normalized) ?? false) ||
        content.director?.toLowerCase().includes(normalized) ||
        content.cast?.some((person) => person.toLowerCase().includes(normalized)) ||
        content.genres?.some((genre) => genre.toLowerCase().includes(normalized)) ||
        content.language?.toLowerCase().includes(normalized)
      );
    });
  }, [query, contents, categories]);

  useEffect(() => {
    if (!query || lastLoggedQuery.current === query) return;
    lastLoggedQuery.current = query;
    logSearch(query, results[0]?.id);
  }, [query, results, logSearch]);

  return (
    <div className="search-page">
      <h1>Search results{query ? ` for “${query}”` : ''}</h1>
      {query === '' ? (
        <p className="search-page__empty">Use the search bar above to find movies, shows, actors, directors, or genres.</p>
      ) : (
        <>
          <p className="search-page__count">
            {results.length} title{results.length === 1 ? '' : 's'} found
          </p>
          {results.length === 0 ? (
            <p className="search-page__empty">
              No titles matched your search. Try a different keyword, or <Link to="/browse/requests">request it</Link>.
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
        </>
      )}
    </div>
  );
}
