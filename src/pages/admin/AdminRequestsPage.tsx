import { useAppState } from '../../context/AppStateContext';
import type { MovieRequest } from '../../types';

const statuses: MovieRequest['status'][] = ['pending', 'approved', 'rejected', 'fulfilled'];

/** Admin view of movie requests submitted by users, with status management. */
export function AdminRequestsPage() {
  const { movieRequests, updateMovieRequestStatus } = useAppState();

  return (
    <div>
      <h1>Movie Requests</h1>
      {movieRequests.length === 0 && <p>No requests yet.</p>}
      <ul>
        {movieRequests.map((request) => (
          <li key={request.id}>
            <strong>{request.title}</strong>
            {request.note ? ` — ${request.note}` : ''} (requested by {request.requestedBy})
            <div>
              <label>
                Status:{' '}
                <select
                  value={request.status}
                  onChange={(e) =>
                    updateMovieRequestStatus(request.id, e.target.value as MovieRequest['status'])
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
