import { Link } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import './AdminDashboardPage.css';

/** Admin landing page with publishing actions and catalogue overview. */
export function AdminDashboardPage() {
  const { contents, categories, contentTypes, movieRequests } = useAppState();
  const pendingRequests = movieRequests.filter((r) => r.status === 'pending').length;

  const stats = [
    { label: 'Published titles', value: contents.length, note: 'In your catalogue', icon: '▣' },
    { label: 'Categories', value: categories.length, note: 'Browse collections', icon: '◈' },
    { label: 'Content types', value: contentTypes.length, note: 'Formats available', icon: '▤' },
    { label: 'Pending requests', value: pendingRequests, note: 'Waiting for review', icon: '✉' },
  ];

  return (
    <div className="admin-dashboard">
      <section className="admin-welcome">
        <div>
          <span className="admin-kicker">ADMIN OVERVIEW</span>
          <h1>Good to have you back.</h1>
          <p>Manage your STREAM UG library, publish new titles and keep your catalogue up to date.</p>
        </div>
        <Link className="admin-primary-action" to="/admin/content/new"><span>＋</span> Post a Movie</Link>
      </section>

      <section className="admin-stats" aria-label="Catalogue statistics">
        {stats.map((stat) => (
          <article className="admin-stat-card" key={stat.label}>
            <div className="admin-stat-card__top"><span>{stat.label}</span><i>{stat.icon}</i></div>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
          </article>
        ))}
      </section>

      <section className="admin-section-heading">
        <div><span className="admin-kicker">QUICK ACTIONS</span><h2>Manage your platform</h2></div>
      </section>
      <section className="admin-actions-grid">
        <Link to="/admin/content/new" className="admin-action-card admin-action-card--featured">
          <span className="admin-action-card__icon">＋</span>
          <strong>Post a new movie</strong>
          <small>Add a title, poster, trailer and full movie link to STREAM UG.</small>
          <b>Start publishing <span>→</span></b>
        </Link>
        <Link to="/admin/content" className="admin-action-card">
          <span className="admin-action-card__icon">▣</span>
          <strong>Manage movie library</strong>
          <small>Review, edit and organise existing titles.</small>
          <b>Open library <span>→</span></b>
        </Link>
        <Link to="/admin/requests" className="admin-action-card">
          <span className="admin-action-card__icon">✉</span>
          <strong>Movie requests</strong>
          <small>Review suggestions submitted by viewers.</small>
          <b>Review requests <span>→</span></b>
        </Link>
        <Link to="/admin/analytics" className="admin-action-card">
          <span className="admin-action-card__icon">▥</span>
          <strong>View analytics</strong>
          <small>See engagement and platform activity.</small>
          <b>View insights <span>→</span></b>
        </Link>
      </section>
      <section className="admin-empty-state">
        <div><span className="admin-kicker">YOUR CATALOGUE</span><h2>{contents.length === 0 ? 'Your movie library is ready for its first title' : 'Your catalogue is growing'}</h2>
        <p>{contents.length === 0 ? 'Start by publishing your first movie. Once added, your titles will be available in the library manager.' : 'Open the movie library to manage your published titles.'}</p></div>
        <Link to={contents.length === 0 ? '/admin/content/new' : '/admin/content'}>{contents.length === 0 ? 'Publish first movie' : 'Manage titles'} <span>→</span></Link>
      </section>
    </div>
  );
}
