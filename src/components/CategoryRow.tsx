import { Link } from 'react-router-dom';
import type { Category, Content } from '../types';
import { ContentCard } from './ContentCard';
import { getAverageRating } from '../utils/recommendations';
import { getMostWatched } from '../utils/analytics';
import { useAppState } from '../context/AppStateContext';
import './CategoryRow.css';

interface CategoryRowProps {
  category: Category;
  contents: Content[];
  /** Route slug/id used to build the "Explore more" link, e.g. a category id or a virtual row like "trending". */
  exploreId?: string;
}

/** Renders a horizontally-scrollable row of content for a single category, with an "Explore more" link. */
export function CategoryRow({ category, contents, exploreId }: CategoryRowProps) {
  const { ratings, viewHistory } = useAppState();

  if (contents.length === 0) return null;

  const watchCounts = new Map(getMostWatched(viewHistory).map((c) => [c.contentId, c.count]));

  return (
    <section className="category-row">
      <div className="category-row__header">
        <h2 className="category-row__title">{category.name}</h2>
        {exploreId && (
          <Link className="category-row__explore" to={`/browse/explore/${exploreId}`}>
            Explore more →
          </Link>
        )}
      </div>
      <div className="category-row__items">
        {contents.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            averageRating={getAverageRating(content.id, ratings)}
            watchCount={watchCounts.get(content.id) ?? 0}
          />
        ))}
      </div>
    </section>
  );
}
