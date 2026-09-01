import { useParams, Link } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { WatermarkedVideo } from '../../components/WatermarkedVideo';
import { RatingStars } from '../../components/RatingStars';
import { getAverageRating } from '../../utils/recommendations';
import './ContentDetailPage.css';

/** Watch page for a single piece of content: player, details, and rating. */
export function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const { contents, categories, contentTypes, ratings, currentUser, rateContent } =
    useAppState();

  const content = contents.find((c) => c.id === contentId);

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

  return (
    <div className="content-detail">
      <WatermarkedVideo
        src={content.videoUrl}
        poster={content.posterUrl}
        watermark={content.watermark}
        controls
      />
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
    </div>
  );
}
