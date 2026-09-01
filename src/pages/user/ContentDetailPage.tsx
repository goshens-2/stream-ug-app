import { useParams, Link } from 'react-router-dom';
import type { SyntheticEvent } from 'react';
import { useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { WatermarkedVideo } from '../../components/WatermarkedVideo';
import { RatingStars } from '../../components/RatingStars';
import { CategoryRow } from '../../components/CategoryRow';
import { getAverageRating } from '../../utils/recommendations';
import { buildWatchCountMap, getRecommendedContent } from '../../utils/collections';
import './ContentDetailPage.css';

/** Watch page for a single piece of content: player, details, and rating. */
export function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const {
    contents,
    categories,
    contentTypes,
    ratings,
    currentUser,
    rateContent,
    isFavorite,
    toggleFavorite,
    recordView,
    viewHistory,
  } =
    useAppState();

  const content = contents.find((c) => c.id === contentId);

  const watchCounts = useMemo(() => buildWatchCountMap(viewHistory), [viewHistory]);

  const relatedContent = useMemo(() => {
    if (!content) return [];
    return contents.filter((c) => c.categoryId === content.categoryId && c.id !== content.id);
  }, [contents, content]);

  const recommendedContent = useMemo(() => {
    const recs = getRecommendedContent(contents, ratings, currentUser?.id, 12);
    return recs.filter((c) => c.id !== content?.id);
  }, [contents, ratings, currentUser, content]);

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
      <WatermarkedVideo
        src={content.videoUrl}
        poster={content.posterUrl}
        watermark={content.watermark}
        controls
        onTimeUpdate={handleTimeUpdate}
      />
      <div className="content-detail__heading">
        <h1>{content.title}</h1>
        <button
          type="button"
          className="content-detail__favorite"
          onClick={() => toggleFavorite(content.id)}
        >
          {favorited ? '★ In Watchlist' : '☆ Add to Watchlist'}
        </button>
      </div>
      <p className="content-detail__meta">
        {contentType?.name} &middot; {category?.name} &middot; {content.releaseYear} &middot;{' '}
        {content.durationMinutes}m
        {watchCount > 0 && (
          <> &middot; 👁 Watched by {watchCount} {watchCount === 1 ? 'person' : 'people'}</>
        )}
      </p>
      <p>{content.description}</p>

      <div className="content-detail__rating">
        <span>Your rating:</span>
        <RatingStars value={myRating} onRate={(score) => rateContent(content.id, score)} />
        {averageRating > 0 && (
          <span className="content-detail__average">Average: {averageRating.toFixed(1)} / 5</span>
        )}
      </div>

      {relatedContent.length > 0 && (
        <CategoryRow
          category={{ id: content.categoryId, name: `More ${category?.name ?? 'like this'}` }}
          contents={relatedContent.slice(0, 12)}
          totalCount={relatedContent.length}
          watchCounts={watchCounts}
        />
      )}

      {recommendedContent.length > 0 && (
        <CategoryRow
          category={{ id: 'recommended', name: 'Recommended For You' }}
          contents={recommendedContent.slice(0, 12)}
          totalCount={recommendedContent.length}
          watchCounts={watchCounts}
        />
      )}
    </div>
  );
}

