import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { SyntheticEvent } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { WatermarkedVideo } from '../../components/WatermarkedVideo';
import { RatingStars } from '../../components/RatingStars';
import { CategoryRow } from '../../components/CategoryRow';
import { getAverageRating, getRecommendationsForUser } from '../../utils/recommendations';
import { getWatchCounts, formatCompactCount } from '../../utils/analytics';
import './ContentDetailPage.css';

/** Watch page for a single piece of content: player, details, rating, and related titles. */
export function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const {
    contents,
    categories,
    contentTypes,
    ratings,
    viewHistory,
    currentUser,
    rateContent,
    isFavorite,
    toggleFavorite,
    recordView,
  } =
    useAppState();
  const [showTrailer, setShowTrailer] = useState(false);

  const content = contents.find((c) => c.id === contentId);

  const watchCounts = useMemo(() => getWatchCounts(viewHistory), [viewHistory]);

  const relatedContent = useMemo(() => {
    if (!content) return [];
    return contents.filter((c) => c.categoryId === content.categoryId && c.id !== content.id);
  }, [content, contents]);

  const castRelatedContent = useMemo(() => {
    if (!content?.cast?.length) return [];
    return contents.filter((item) =>
      item.id !== content.id && item.cast?.some((person) => content.cast?.includes(person)),
    );
  }, [content, contents]);

  const recommendedElsewhere = useMemo(() => {
    if (!content || !currentUser) return [];
    return getRecommendationsForUser(currentUser.id, contents, ratings, 8)
      .map((rec) => contents.find((c) => c.id === rec.contentId))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .filter((c) => c.id !== content.id);
  }, [content, currentUser, contents, ratings]);

  if (!content) {
    return (
      <div className="content-detail">
        <p>Content not found.</p>
        <Link to="/browse">Back to browse</Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === content.categoryId);
  const contentType = contentTypes.find((t) => t.id === content.contentTypeId);
  const myRating = ratings.find(
    (r) => r.contentId === content.id && r.userId === currentUser?.id,
  )?.score ?? 0;
  const averageRating = getAverageRating(content.id, ratings);
  const favorited = isFavorite(content.id);
  const watchCount = watchCounts.get(content.id) ?? 0;

  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (!Number.isFinite(video.duration) || video.duration === 0) return;
    recordView(content.id, Math.floor(video.currentTime), Math.floor(video.duration));
  };

  return (
    <div className="content-detail">
      <div className="content-detail__player-column">
        {showTrailer ? (
          <WatermarkedVideo
            src={content.trailerUrl}
            poster={content.posterUrl}
            watermark={content.watermark}
            controls
            autoPlay
            muted={false}
          />
        ) : (
          <WatermarkedVideo
            src={content.videoUrl}
            embedUrl={content.embedUrl}
            poster={content.posterUrl}
            watermark={content.watermark}
            controls
            onTimeUpdate={handleTimeUpdate}
          />
        )}
        <div className="content-detail__heading">
          <h1>{content.title}</h1>
          <div className="content-detail__actions">
            {content.trailerUrl && (
              <button
                type="button"
                className="content-detail__trailer-toggle"
                onClick={() => setShowTrailer((v) => !v)}
              >
                {showTrailer ? '▶ Watch Full Movie' : '🎬 Watch Trailer'}
              </button>
            )}
            <button
              type="button"
              className="content-detail__favorite"
              onClick={() => toggleFavorite(content.id)}
            >
              {favorited ? '★ In Watchlist' : '☆ Add to Watchlist'}
            </button>
          </div>
        </div>
        <p className="content-detail__meta">
          {contentType?.name} &middot; {category?.name} &middot; {content.releaseYear} &middot;{' '}
          {content.durationMinutes}m
          {content.language && <> &middot; {content.language}</>}
          {content.ageRating && <> &middot; {content.ageRating}</>}
          {watchCount > 0 && (
            <> &middot; 👁 {formatCompactCount(watchCount)} watched</>
          )}
        </p>
        <p>{content.description}</p>
        {(content.director || content.cast?.length || content.genres?.length) && (
          <section className="content-detail__credits" aria-label="Cast and crew">
            {content.director && <p><strong>Director:</strong> {content.director}</p>}
            {content.cast?.length ? (
              <p>
                <strong>Cast:</strong>{' '}
                {content.cast.map((person, index) => (
                  <span key={person}>
                    {index > 0 && ', '}
                    <Link to={`/browse/search?q=${encodeURIComponent(person)}`}>{person}</Link>
                  </span>
                ))}
              </p>
            ) : null}
            {content.genres?.length ? <p><strong>Genres:</strong> {content.genres.join(', ')}</p> : null}
          </section>
        )}

        <div className="content-detail__rating">
          <span>Your rating:</span>
          <RatingStars value={myRating} onRate={(score) => rateContent(content.id, score)} />
          {averageRating > 0 && (
            <span className="content-detail__average">Average: {averageRating.toFixed(1)} / 5</span>
          )}
        </div>
      </div>

      {category && relatedContent.length > 0 && (
        <CategoryRow
          category={{ ...category, name: `More ${category.name}` }}
          contents={relatedContent}
          exploreMoreTo={`/browse/explore/${category.id}`}
          watchCounts={watchCounts}
        />
      )}

      {castRelatedContent.length > 0 && (
        <CategoryRow
          category={{ id: 'cast-related', name: `More with ${content.cast?.[0]}`, slug: 'cast-related' }}
          contents={castRelatedContent}
          watchCounts={watchCounts}
        />
      )}

      {recommendedElsewhere.length > 0 && (
        <CategoryRow
          category={{ id: 'recommended', name: 'Recommended For You', slug: 'recommended' }}
          contents={recommendedElsewhere}
          exploreMoreTo="/browse/explore/recommended"
          watchCounts={watchCounts}
        />
      )}
    </div>
  );
}
