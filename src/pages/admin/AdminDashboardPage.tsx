import { Link } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';

/** Admin dashboard with at-a-glance stats and a direct movie publishing action. */
export function AdminDashboardPage() {
  const { contents, categories, contentTypes, movieRequests } = useAppState();
  const pendingRequests = movieRequests.filter((r) => r.status === 'pending').length;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        <Link to="/admin/content/new">+ Post a Movie</Link>
      </p>
      <ul>
        <li>{contents.length} content items</li>
        <li>{categories.length} categories</li>
        <li>{contentTypes.length} content types</li>
        <li>
          {pendingRequests} pending movie {pendingRequests === 1 ? 'request' : 'requests'} —{' '}
          <Link to="/admin/requests">review</Link>
        </li>
        <li>
          <Link to="/admin/analytics">View engagement analytics</Link>
        </li>
      </ul>
    </div>
  );
}
