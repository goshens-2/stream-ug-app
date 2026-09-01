import { useParams, Link } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { WatermarkedVideo } from '../../components/WatermarkedVideo';
import { RatingStars } from '../../components/RatingStars';
import { AdBanner } from '../../components/AdBanner';
import { getAverageRating } from '../../utils/recommendations';
import './ContentDetailPage.css';

/** Watch page for a single piece of content: player, details, and rating. */
export function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const { contents, categories, contentTypes, ratings, ads, isSubscribed, currentUser, rateContent } =
    useAppState();

  const content = contents.find((c) => c.id === contentId);

  if (!content) {
    return (
      <div className="content-detail">
        <p>Content not found.</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === content.categoryId);
  const contentType = contentTypes.find((t) => t.id === content.contentTypeId);
  const myRating = ratings.find(
    (r) => r.contentId === content.id && r.userId === currentUser.id,
  )?.score ?? 0;
  const averageRating = getAverageRating(content.id, ratings);

  return (
    <div className="content-detail">
      <WatermarkedVideo
        src={isSubscribed ? content.videoUrl : content.trailerUrl}
        poster={content.posterUrl}
        watermark={content.watermark}
        controls
      />
      {!isSubscribed && (
        <p className="content-detail__hint">
          Playing trailer preview only. <Link to="/">Subscribe</Link> to watch the full video.
        </p>
      )}
      <h1>{content.title}</h1>
      <p className="content-detail__meta">
        {contentType?.name} &middot; {category?.name} &middot; {content.releaseYear} &middot;{' '}
        {content.durationMinutes}m
      </p>
      <p>{content.description}</p>

      <div className="content-detail__rating">
        <span>Your rating:</span>
        <RatingStars value={myRating} onRate={(score) => rateContent(content.id, score)} />
        {averageRating > 0 && (
          <span className="content-detail__average">Average: {averageRating.toFixed(1)} / 5</span>
        )}
      </div>

      {!isSubscribed && ads[0] && <AdBanner ad={ads[0]} />}
    </div>
  );
}
