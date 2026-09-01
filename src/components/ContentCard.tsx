import { Link } from 'react-router-dom';
import type { Content } from '../types';
import './ContentCard.css';

interface ContentCardProps {
  content: Content;
  averageRating?: number;
}

export function ContentCard({ content, averageRating }: ContentCardProps) {
  return (
    <Link to={`/browse/watch/${content.id}`} className="content-card">
      <img src={content.posterUrl} alt={content.title} className="content-card__poster" />
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
