import { useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { CategoryRow } from '../../components/CategoryRow';
import { TrailerMarquee } from '../../components/TrailerMarquee';
import { AdBanner } from '../../components/AdBanner';
import { getRecommendationsForUser } from '../../utils/recommendations';
import './HomePage.css';

/** The main User Panel landing page: trailer marquee, ads, and category rows. */
export function HomePage() {
  const { contents, categories, ratings, ads, isSubscribed, currentUser } = useAppState();

  const recommendations = useMemo(
    () => getRecommendationsForUser(currentUser.id, contents, ratings, 6),
    [currentUser.id, contents, ratings],
  );

  const recommendedContent = recommendations
    .map((rec) => contents.find((c) => c.id === rec.contentId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="home-page">
      <section className="home-page__marquee-section">
        <h2 className="category-row__title">Trailers Playing Now</h2>
        {!isSubscribed && (
          <p className="home-page__hint">
            You're browsing as a guest — trailers auto-play as you scroll. Subscribe for full
            access.
          </p>
        )}
        <div className="home-page__marquee-row">
          {contents.slice(0, 8).map((content) => (
            <TrailerMarquee key={content.id} content={content} autoPlayOnScroll={!isSubscribed} />
          ))}
        </div>
      </section>

      {!isSubscribed && ads[0] && <AdBanner ad={ads[0]} />}

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

      {!isSubscribed && ads[1] && <AdBanner ad={ads[1]} />}
    </div>
  );
}
