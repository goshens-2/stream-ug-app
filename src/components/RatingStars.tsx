import { useState } from 'react';
import './RatingStars.css';

interface RatingStarsProps {
  value: number;
  onRate?: (score: number) => void;
  readOnly?: boolean;
}

/** A 1-5 star rating widget used by users to rate content they've watched. */
export function RatingStars({ value, onRate, readOnly = false }: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="rating-stars" role="radiogroup" aria-label="Rate this content">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`rating-stars__star ${star <= display ? 'is-filled' : ''}`}
          disabled={readOnly}
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          onClick={() => !readOnly && onRate?.(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
