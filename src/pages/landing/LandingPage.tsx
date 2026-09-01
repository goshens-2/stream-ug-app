import { Link, Navigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import './LandingPage.css';

/**
 * Public entry point for the STREAM UG web app. Introduces the site to
 * first-time visitors and links to the Login/Signup pages. Signed-in
 * visitors are redirected straight to the browse page.
 */
export function LandingPage() {
  const { isAuthenticated } = useAppState();

  if (isAuthenticated) {
    return <Navigate to="/browse" replace />;
  }

  return (
    <div className="landing-page">
      <header className="landing-page__nav">
        <span className="landing-page__brand">STREAM UG</span>
        <div className="landing-page__nav-links">
          <Link to="/login">Log In</Link>
          <Link to="/signup" className="landing-page__cta-small">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="landing-page__hero">
        <h1>Movies, series &amp; more — streamed on the web</h1>
        <p>
          STREAM UG is a browser-based streaming web app. Watch translated and
          non-translated movies, local music, cartoons, sports analysis, soaps,
          news, and much more — no download required, just open your browser.
        </p>
        <div className="landing-page__actions">
          <Link to="/signup" className="landing-page__cta">
            Get Started
          </Link>
          <Link to="/login" className="landing-page__cta-secondary">
            Log In
          </Link>
        </div>
        <p className="landing-page__hint">
          Already know someone with an account? You can log in with your own
          password, or with a shared password from a subscriber's family-share
          plan.
        </p>
      </main>

      <section className="landing-page__panels">
        <article className="landing-page__panel">
          <h2>User Panel</h2>
          <p>
            Browse content by category, watch trailers and full videos, rate
            what you watch, and get personalised recommendations — all from
            your web browser.
          </p>
        </article>
        <article className="landing-page__panel">
          <h2>Admin Panel</h2>
          <p>
            Upload and manage content, organise content types and categories,
            and review movie requests submitted by users, through a dedicated
            web dashboard.
          </p>
        </article>
      </section>

      <footer className="landing-page__footer">
        <p>STREAM UG — a web app for streaming, built with React &amp; TypeScript.</p>
      </footer>
    </div>
  );
}
