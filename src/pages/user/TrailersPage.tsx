import { useMemo, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { TrailerMarquee } from '../../components/TrailerMarquee';
import './TrailersPage.css';

/** Dedicated trailers page: search for and preview any movie/show trailer. */
export function TrailersPage() {
  const { contents, logSearch } = useAppState();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return contents;
    return contents.filter((c) => c.title.toLowerCase().includes(trimmed));
  }, [contents, query]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const match = contents.find((c) => c.title.toLowerCase().includes(trimmed.toLowerCase()));
    logSearch(trimmed, match?.id);
  };

  return (
    <div className="trailers-page">
      <h1>Trailers</h1>
      <p>Search for any movie or show to preview its trailer.</p>
      <form className="trailers-page__search" onSubmit={handleSearchSubmit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movie trailers…"
          aria-label="Search movie trailers"
        />
        <button type="submit">Search</button>
      </form>

      {filtered.length === 0 ? (
        <p className="trailers-page__empty">No trailers match your search.</p>
      ) : (
        <div className="trailers-page__grid">
          {filtered.map((content) => (
            <TrailerMarquee key={content.id} content={content} />
          ))}
        </div>
      )}
    </div>
  );
}
