import { Link } from 'react-router-dom';
import type { Category, Content } from '../types';
import { ContentCard } from './ContentCard';
import { getAverageRating } from '../utils/recommendations';
import { useAppState } from '../context/AppStateContext';
import './CategoryRow.css';

interface CategoryRowProps {
  category: Category | { id: string; name: string };
  contents: Content[];
  watchCounts?: Map<string, number>;
  /** Total number of titles in the full collection, if more than `contents` are shown here. */
  totalCount?: number;
}

/** Renders a horizontally-scrollable row of content for a single category, with an "Explore more" link. */
export function CategoryRow({ category, contents, watchCounts, totalCount }: CategoryRowProps) {
  const { ratings } = useAppState();

  if (contents.length === 0) return null;

  const hasMore = (totalCount ?? contents.length) > contents.length;

  return (
    <section className="category-row">
      <div className="category-row__header">
        <h2 className="category-row__title">{category.name}</h2>
        <Link to={`/browse/category/${category.id}`} className="category-row__explore-more">
          Explore more &rsaquo;
        </Link>
      </div>
      <div className="category-row__items">
        {contents.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            averageRating={getAverageRating(content.id, ratings)}
            watchCount={watchCounts?.get(content.id)}
          />
        ))}
        {hasMore && (
          <Link to={`/browse/category/${category.id}`} className="category-row__more-card">
            <span>Explore more</span>
            <span className="category-row__more-card-count">
              +{(totalCount ?? 0) - contents.length} more
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
