import { Link } from 'react-router-dom';
import type { Category, Content } from '../types';
import { ContentCard } from './ContentCard';
import { getAverageRating } from '../utils/recommendations';
import { useAppState } from '../context/AppStateContext';
import './CategoryRow.css';

interface CategoryRowProps {
  category: Category | { id: string; name: string };
  contents: Content[];
  exploreMoreTo?: string;
  limit?: number;
  watchCounts?: Map<string, number>;
  totalCount?: number;
  showExploreMore?: boolean;
}

/** Renders a horizontally-scrollable row of content for a single category, with an "Explore more" link. */
export function CategoryRow({
  category,
  contents,
  exploreMoreTo,
  limit = contents.length,
  watchCounts,
  totalCount,
  showExploreMore = true,
}: CategoryRowProps) {
  const { ratings } = useAppState();

  if (contents.length === 0) return null;

  const visible = contents.slice(0, limit);
  const fullCount = totalCount ?? contents.length;
  const hasMore = fullCount > visible.length;
  const exploreHref = exploreMoreTo ?? `/browse/category/${category.id}`;

  return (
    <section className="category-row">
      <div className="category-row__header">
        <h2 className="category-row__title">{category.name}</h2>
        {showExploreMore && (
          <Link to={exploreHref} className="category-row__explore-more">
            Explore more &rsaquo;
          </Link>
        )}
      </div>
      <div className="category-row__items">
        {visible.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            averageRating={getAverageRating(content.id, ratings)}
            watchCount={watchCounts?.get(content.id)}
          />
        ))}
        {showExploreMore && hasMore && (
          <Link to={exploreHref} className="category-row__more-card">
            <span>Explore more</span>
            <span className="category-row__more-card-count">
              +{fullCount - visible.length} more
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
