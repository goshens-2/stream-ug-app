import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import './MovieRequestPage.css';

/** Lets users submit a request for content they'd like added, which admins can review. */
export function MovieRequestPage() {
  const { movieRequests, submitMovieRequest, currentUser } = useAppState();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const myRequests = movieRequests.filter((r) => r.requestedBy === currentUser?.id);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    submitMovieRequest(title.trim(), note.trim() || undefined);
    setTitle('');
    setNote('');
  };

  return (
    <div className="movie-request-page">
      <h1>Request a Movie</h1>
      <p>Can't find something? Let us know what you'd like to see on STREAM UG.</p>
      <form onSubmit={handleSubmit} className="movie-request-page__form">
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Movie or show title"
            required
          />
        </label>
        <label>
          Note (optional)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any details that will help us find it"
          />
        </label>
        <button type="submit">Submit Request</button>
      </form>

      {myRequests.length > 0 && (
        <div className="movie-request-page__history">
          <h2>Your Requests</h2>
          <ul>
            {myRequests.map((request) => (
              <li key={request.id}>
                {request.title} — <span className={`status status--${request.status}`}>{request.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
