import { Link } from 'react-router-dom';
import type { Content } from '../types';
import './ContentCard.css';

interface ContentCardProps {
  content: Content;
  averageRating?: number;
  watchCount?: number;
}

/** Formats a raw watch count into a compact "12K" style string for display. */
function formatWatchCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${count}`;
}

export function ContentCard({ content, averageRating, watchCount }: ContentCardProps) {
  return (
    <Link to={`/browse/watch/${content.id}`} className="content-card">
      <div className="content-card__poster-wrap">
        <img src={content.posterUrl} alt={content.title} className="content-card__poster" />
        {typeof watchCount === 'number' && watchCount > 0 && (
          <span className="content-card__watch-count" title={`Watched by ${watchCount} people`}>
            👁 {formatWatchCount(watchCount)}
          </span>
        )}
      </div>
      <div className="content-card__body">
        <h3 className="content-card__title">{content.title}</h3>
        <p className="content-card__meta">
          {content.releaseYear} &middot; {content.durationMinutes}m
          {typeof averageRating === 'number' && averageRating > 0 && (
            <> &middot; ⭐ {averageRating.toFixed(1)}</>
          )}
        </p>
      </div>
    </Link>
  );
}
