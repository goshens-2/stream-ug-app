import type { SyntheticEvent } from 'react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { WatermarkedVideo } from '../../components/WatermarkedVideo';
import { RatingStars } from '../../components/RatingStars';
import { CategoryRow } from '../../components/CategoryRow';
import { formatCompactCount } from '../../utils/analytics';
import { buildWatchCountMap, getRecommendedContent } from '../../utils/collections';
import { getAverageRating } from '../../utils/recommendations';
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
  } = useAppState();
  const [showTrailer, setShowTrailer] = useState(false);

  const content = contents.find((item) => item.id === contentId);
  const watchCounts = useMemo(() => buildWatchCountMap(viewHistory), [viewHistory]);

  const relatedContent = useMemo(() => {
    if (!content) return [];
    return contents.filter((item) => item.categoryId === content.categoryId && item.id !== content.id);
  }, [contents, content]);

  const castRelatedContent = useMemo(() => {
    if (!content?.cast?.length) return [];
    return contents.filter(
      (item) =>
        item.id !== content.id &&
        item.categoryId !== content.categoryId &&
        item.cast?.some((person) => content.cast?.includes(person)),
    );
  }, [contents, content]);

  const recommendedContent = useMemo(() => {
    const recommendations = getRecommendedContent(contents, ratings, currentUser?.id, 12);
    return recommendations.filter((item) => item.id !== content?.id);
  }, [contents, ratings, currentUser, content]);

  if (!content) {
    return (
      <div className="content-detail">
        <p>Content not found.</p>
        <Link to="/browse">Back to browse</Link>
      </div>
    );
  }

  const category = categories.find((item) => item.id === content.categoryId);
  const contentType = contentTypes.find((item) => item.id === content.contentTypeId);
  const myRating =
    ratings.find((rating) => rating.contentId === content.id && rating.userId === currentUser?.id)?.score ?? 0;
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
                onClick={() => setShowTrailer((value) => !value)}
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
          {contentType?.name} &middot; {category?.name} &middot; {content.releaseYear} &middot; {content.durationMinutes}m
          {content.language && <> &middot; {content.language}</>}
          {content.ageRating && <> &middot; {content.ageRating}</>}
          {watchCount > 0 && <> &middot; 👁 {formatCompactCount(watchCount)} watched</>}
        </p>
        <p>{content.description}</p>
        {(content.director || content.cast?.length || content.genres?.length) && (
          <section className="content-detail__credits" aria-label="Cast and crew">
            {content.director && (
              <p>
                <strong>Director:</strong> {content.director}
              </p>
            )}
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
            {content.genres?.length ? (
              <p>
                <strong>Genres:</strong> {content.genres.join(', ')}
              </p>
            ) : null}
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

      {relatedContent.length > 0 && (
        <CategoryRow
          category={{ id: content.categoryId, name: `More ${category?.name ?? 'like this'}` }}
          contents={relatedContent}
          limit={12}
          totalCount={relatedContent.length}
          watchCounts={watchCounts}
        />
      )}

      {castRelatedContent.length > 0 && (
        <CategoryRow
          category={{ id: 'cast-related', name: `More with ${content.cast?.[0] ?? 'this cast'}` }}
          contents={castRelatedContent}
          limit={12}
          totalCount={castRelatedContent.length}
          showExploreMore={false}
          watchCounts={watchCounts}
        />
      )}

      {recommendedContent.length > 0 && (
        <CategoryRow
          category={{ id: 'recommended', name: 'Recommended For You' }}
          contents={recommendedContent}
          limit={12}
          totalCount={recommendedContent.length}
          watchCounts={watchCounts}
        />
      )}
    </div>
  );
}
