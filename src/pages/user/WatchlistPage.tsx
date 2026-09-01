import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ContentCard } from '../../components/ContentCard';
import { getAverageRating, getRecommendationsForUser } from '../../utils/recommendations';
import './WatchlistPage.css';

/**
 * "My Watchlist / My Requests" page: lets a user see the movies they've
 * requested, movies that were uploaded specifically to fulfill their
 * requests, movies suggested/recommended for them, and their favorites.
 */
export function WatchlistPage() {
  const { contents, movieRequests, ratings, favorites, currentUser } = useAppState();

  const myRequests = movieRequests.filter((r) => r.requestedBy === currentUser?.id);

  const uploadedForMe = myRequests
    .filter((r) => r.status === 'fulfilled' && r.fulfilledContentId)
    .map((r) => contents.find((c) => c.id === r.fulfilledContentId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const recommendations = useMemo(
    () => (currentUser ? getRecommendationsForUser(currentUser.id, contents, ratings, 8) : []),
    [currentUser, contents, ratings],
  );
  const recommendedContent = recommendations
    .map((rec) => contents.find((c) => c.id === rec.contentId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const myFavorites = favorites
    .filter((f) => f.userId === currentUser?.id)
    .map((f) => contents.find((c) => c.id === f.contentId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="watchlist-page">
      <h1>My Watchlist</h1>

      <section>
        <h2>Uploaded For You</h2>
        {uploadedForMe.length === 0 ? (
          <p className="watchlist-page__empty">
            Nothing yet — when a movie you requested is uploaded, it will show up here.
          </p>
        ) : (
          <div className="watchlist-page__items">
            {uploadedForMe.map((content) => (
              <ContentCard key={content.id} content={content} averageRating={getAverageRating(content.id, ratings)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Suggested For You</h2>
        {recommendedContent.length === 0 ? (
          <p className="watchlist-page__empty">Rate a few titles to get personalised suggestions.</p>
        ) : (
          <div className="watchlist-page__items">
            {recommendedContent.map((content) => (
              <ContentCard key={content.id} content={content} averageRating={getAverageRating(content.id, ratings)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>My Favorites</h2>
        {myFavorites.length === 0 ? (
          <p className="watchlist-page__empty">
            Tap "Add to Favorites" on any title's page to save it here.
          </p>
        ) : (
          <div className="watchlist-page__items">
            {myFavorites.map((content) => (
              <ContentCard key={content.id} content={content} averageRating={getAverageRating(content.id, ratings)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>My Requests</h2>
        {myRequests.length === 0 ? (
          <p className="watchlist-page__empty">
            You haven't requested anything yet. <Link to="/browse/requests">Request a movie</Link>.
          </p>
        ) : (
          <ul className="watchlist-page__requests">
            {myRequests.map((request) => (
              <li key={request.id}>
                <strong>{request.title}</strong> — <span className={`status status--${request.status}`}>{request.status}</span>
                {request.fulfilledContentId && (
                  <>
                    {' '}
                    <Link to={`/browse/watch/${request.fulfilledContentId}`}>Watch now</Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
