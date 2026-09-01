import { useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { CategoryRow } from '../../components/CategoryRow';
import { TrailerMarquee } from '../../components/TrailerMarquee';
import { getRecommendationsForUser } from '../../utils/recommendations';
import './HomePage.css';

/** The main User Panel landing page: trailer marquee and category rows. */
export function HomePage() {
  const { contents, categories, ratings, currentUser } = useAppState();

  const recommendations = useMemo(
    () => (currentUser ? getRecommendationsForUser(currentUser.id, contents, ratings, 6) : []),
    [currentUser, contents, ratings],
  );

  const recommendedContent = recommendations
    .map((rec) => contents.find((c) => c.id === rec.contentId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="home-page">
      <section className="home-page__marquee-section">
        <h2 className="category-row__title">Trailers Playing Now</h2>
        <div className="home-page__marquee-row">
          {contents.slice(0, 8).map((content) => (
            <TrailerMarquee key={content.id} content={content} />
          ))}
        </div>
      </section>

      {recommendedContent.length > 0 && (
        <CategoryRow
          category={{ id: 'recommended', name: 'Recommended For You', slug: 'recommended' }}
          contents={recommendedContent}
        />
      )}

      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
          contents={contents.filter((c) => c.categoryId === category.id)}
        />
      ))}
    </div>
  );
}
