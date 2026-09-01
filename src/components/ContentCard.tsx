import { Link } from 'react-router-dom';
import type { Content } from '../types';
import { formatCompactCount } from '../utils/analytics';
import './ContentCard.css';

interface ContentCardProps {
  content: Content;
  averageRating?: number;
  /** Number of people who have watched this title, shown as a "views" badge. */
  watchCount?: number;
}

export function ContentCard({ content, averageRating, watchCount }: ContentCardProps) {
  return (
    <Link to={`/browse/watch/${content.id}`} className="content-card">
      <div className="content-card__poster-wrap">
        <img src={content.posterUrl} alt={content.title} className="content-card__poster" />
        {typeof watchCount === 'number' && watchCount > 0 && (
          <span className="content-card__watch-count" title={`${watchCount} people watched this`}>
            👁 {formatCompactCount(watchCount)}
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
