import { useAppState } from '../../context/AppStateContext';
import {
  getHighestRated,
  getMostRated,
  getMostSearched,
  getMostWatched,
  getTrendingRequests,
  resolveTitle,
} from '../../utils/analytics';
import './AdminAnalyticsPage.css';

/** Admin analytics: engagement insights derived from ratings, views, searches, and requests. */
export function AdminAnalyticsPage() {
  const { contents, ratings, viewHistory, searchLogs, movieRequests, favorites, users } = useAppState();

  const mostRated = getMostRated(ratings).slice(0, 5);
  const highestRated = getHighestRated(ratings).slice(0, 5);
  const mostWatched = getMostWatched(viewHistory).slice(0, 5);
  const mostSearched = getMostSearched(searchLogs).slice(0, 5);
  const trendingRequests = getTrendingRequests(movieRequests).slice(0, 5);

  const totalWatchMinutes = Math.round(
    viewHistory.reduce((sum, v) => sum + v.progressSeconds, 0) / 60,
  );
  const pendingRequests = movieRequests.filter((r) => r.status === 'pending').length;
  const mostFavorited = [...favorites.reduce((map, f) => {
    map.set(f.contentId, (map.get(f.contentId) ?? 0) + 1);
    return map;
  }, new Map<string, number>())]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="admin-analytics">
      <h1>Analytics</h1>

      <div className="admin-analytics__summary">
        <div className="admin-analytics__stat">
          <span className="admin-analytics__stat-value">{users.length}</span>
          <span className="admin-analytics__stat-label">Users</span>
        </div>
        <div className="admin-analytics__stat">
          <span className="admin-analytics__stat-value">{contents.length}</span>
          <span className="admin-analytics__stat-label">Titles</span>
        </div>
        <div className="admin-analytics__stat">
          <span className="admin-analytics__stat-value">{ratings.length}</span>
          <span className="admin-analytics__stat-label">Ratings Submitted</span>
        </div>
        <div className="admin-analytics__stat">
          <span className="admin-analytics__stat-value">{totalWatchMinutes}</span>
          <span className="admin-analytics__stat-label">Minutes Watched</span>
        </div>
        <div className="admin-analytics__stat">
          <span className="admin-analytics__stat-value">{pendingRequests}</span>
          <span className="admin-analytics__stat-label">Pending Requests</span>
        </div>
      </div>

      <section>
        <h2>Most Rated Movies</h2>
        {mostRated.length === 0 ? (
          <p>No ratings yet.</p>
        ) : (
          <ol>
            {mostRated.map((item) => (
              <li key={item.contentId}>
                {resolveTitle(item.contentId, contents)} — {item.count} rating{item.count === 1 ? '' : 's'}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2>Highest Rated Movies</h2>
        {highestRated.length === 0 ? (
          <p>No ratings yet.</p>
        ) : (
          <ol>
            {highestRated.map((item) => (
              <li key={item.contentId}>
                {resolveTitle(item.contentId, contents)} — {item.average.toFixed(1)} / 5 ({item.count} rating
                {item.count === 1 ? '' : 's'})
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2>Most Watched Movies</h2>
        {mostWatched.length === 0 ? (
          <p>No views recorded yet.</p>
        ) : (
          <ol>
            {mostWatched.map((item) => (
              <li key={item.contentId}>
                {resolveTitle(item.contentId, contents)} — {item.count} view{item.count === 1 ? '' : 's'}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2>Most Searched Movies</h2>
        {mostSearched.length === 0 ? (
          <p>No searches logged yet.</p>
        ) : (
          <ol>
            {mostSearched.map((item) => (
              <li key={item.contentId}>
                {resolveTitle(item.contentId, contents)} — {item.count} search{item.count === 1 ? '' : 'es'}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2>Trending Requests</h2>
        {trendingRequests.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          <ol>
            {trendingRequests.map((item) => (
              <li key={item.title}>
                {item.title} — requested {item.count} time{item.count === 1 ? '' : 's'} (
                <span className={`status status--${item.latestStatus}`}>{item.latestStatus}</span>)
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2>Most Favorited Movies</h2>
        {mostFavorited.length === 0 ? (
          <p>No favorites saved yet.</p>
        ) : (
          <ol>
            {mostFavorited.map(([contentId, count]) => (
              <li key={contentId}>
                {resolveTitle(contentId, contents)} — {count} favorite{count === 1 ? '' : 's'}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
