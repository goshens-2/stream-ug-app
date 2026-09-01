import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ContentCard } from '../../components/ContentCard';
import { getAverageRating } from '../../utils/recommendations';
import { getMostWatched } from '../../utils/analytics';
import './SearchPage.css';

/** Global search results page, reached from the navbar search box. */
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { contents, categories, ratings, viewHistory, logSearch } = useAppState();
  const [genreFilter, setGenreFilter] = useState<string>('all');

  const watchCounts = useMemo(
    () => new Map(getMostWatched(viewHistory).map((c) => [c.contentId, c.count])),
    [viewHistory],
  );

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    let list = contents;
    if (trimmed) {
      list = list.filter(
        (c) => c.title.toLowerCase().includes(trimmed) || c.description.toLowerCase().includes(trimmed),
      );
    }
    if (genreFilter !== 'all') {
      list = list.filter((c) => c.categoryId === genreFilter);
    }
    return list;
  }, [contents, query, genreFilter]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    logSearch(trimmed, results[0]?.id);
    // Only log once per query, not on every filter change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-page__header">
        <h1>{query ? `Results for "${query}"` : 'Search'}</h1>
        <label className="search-page__filter">
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
      </div>
      {results.length === 0 ? (
        <p className="search-page__empty">
          No titles matched your search. <Link to="/browse/requests">Request it instead</Link>.
        </p>
      ) : (
        <div className="search-page__grid">
          {results.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              averageRating={getAverageRating(content.id, ratings)}
              watchCount={watchCounts.get(content.id) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
