import { Link } from 'react-router-dom';
import type { Category, Content } from '../types';
import { ContentCard } from './ContentCard';
import { getAverageRating } from '../utils/recommendations';
import { useAppState } from '../context/AppStateContext';
import './CategoryRow.css';

interface CategoryRowProps {
  category: Category | { id: string; name: string };
  contents: Content[];
<<<<<<< HEAD
  /** Path to a fuller listing for this rail/category; renders an "Explore more" link when set. */
  exploreMoreTo?: string;
  /** Cap how many posters are shown in the row itself (the full list is available via "Explore more"). */
  limit?: number;
  /** Optional `contentId -> watch count` lookup, shown as a badge on each poster. */
  watchCounts?: Map<string, number>;
}

/** Renders a horizontally-scrollable row of content for a single category. */
export function CategoryRow({ category, contents, exploreMoreTo, limit = 14, watchCounts }: CategoryRowProps) {
=======
  watchCounts?: Map<string, number>;
  /** Total number of titles in the full collection, if more than `contents` are shown here. */
  totalCount?: number;
}

/** Renders a horizontally-scrollable row of content for a single category, with an "Explore more" link. */
export function CategoryRow({ category, contents, watchCounts, totalCount }: CategoryRowProps) {
>>>>>>> origin/copilot/goshens-2stream-ug-app
  const { ratings } = useAppState();

  if (contents.length === 0) return null;

<<<<<<< HEAD
  const visible = contents.slice(0, limit);
=======
  const hasMore = (totalCount ?? contents.length) > contents.length;
>>>>>>> origin/copilot/goshens-2stream-ug-app

  return (
    <section className="category-row">
      <div className="category-row__header">
        <h2 className="category-row__title">{category.name}</h2>
<<<<<<< HEAD
        {exploreMoreTo && contents.length > 0 && (
          <Link to={exploreMoreTo} className="category-row__explore-more">
            Explore more &rsaquo;
          </Link>
        )}
=======
        <Link to={`/browse/category/${category.id}`} className="category-row__explore-more">
          Explore more &rsaquo;
        </Link>
>>>>>>> origin/copilot/goshens-2stream-ug-app
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
