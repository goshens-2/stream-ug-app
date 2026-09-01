import type { Category, Content } from '../types';
import { ContentCard } from './ContentCard';
import { getAverageRating } from '../utils/recommendations';
import { useAppState } from '../context/AppStateContext';
import './CategoryRow.css';

interface CategoryRowProps {
  category: Category;
  contents: Content[];
}

/** Renders a horizontally-scrollable row of content for a single category. */
export function CategoryRow({ category, contents }: CategoryRowProps) {
  const { ratings } = useAppState();

  if (contents.length === 0) return null;

  return (
    <section className="category-row">
      <h2 className="category-row__title">{category.name}</h2>
      <div className="category-row__items">
        {contents.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            averageRating={getAverageRating(content.id, ratings)}
          />
        ))}
      </div>
    </section>
  );
}
