import { Link } from 'react-router-dom';
import type { Category, Content } from '../types';
import { ContentCard } from './ContentCard';
import { getAverageRating } from '../utils/recommendations';
import { useAppState } from '../context/AppStateContext';
import './CategoryRow.css';

interface CategoryRowProps {
  category: Category;
  contents: Content[];
  /** Path to a fuller listing for this rail/category; renders an "Explore more" link when set. */
  exploreMoreTo?: string;
  /** Cap how many posters are shown in the row itself (the full list is available via "Explore more"). */
  limit?: number;
  /** Optional `contentId -> watch count` lookup, shown as a badge on each poster. */
  watchCounts?: Map<string, number>;
}

/** Renders a horizontally-scrollable row of content for a single category. */
export function CategoryRow({ category, contents, exploreMoreTo, limit = 14, watchCounts }: CategoryRowProps) {
  const { ratings } = useAppState();

  if (contents.length === 0) return null;

  const visible = contents.slice(0, limit);

  return (
    <section className="category-row">
      <div className="category-row__header">
        <h2 className="category-row__title">{category.name}</h2>
        {exploreMoreTo && contents.length > 0 && (
          <Link to={exploreMoreTo} className="category-row__explore-more">
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
      </div>
    </section>
  );
}
