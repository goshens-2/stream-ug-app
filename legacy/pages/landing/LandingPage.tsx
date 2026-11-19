import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import './LandingPage.css';

const featuredSlides = [
  {
    eyebrow: 'EXPLORE THE GENRES',
    title: 'Action & Adventure',
    description: 'Big moments, bold heroes and thrilling stories.',
  },
  {
    eyebrow: 'FIND YOUR NEXT STORY',
    title: 'Drama & Romance',
    description: 'Emotional stories and unforgettable connections.',
  },
  {
    eyebrow: 'GOOD TIMES START HERE',
    title: 'Comedy & Family',
    description: 'Feel-good entertainment for everyone.',
  },
  {
    eyebrow: 'YOUR NEXT FAVOURITE IS WAITING',
    title: 'Discover more on STREAM',
    description: 'Explore the collection and find something to watch.',
    isCta: true,
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAppState();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featuredSlides.length);
    }, 3500);

    return () => window.clearInterval(slideTimer);
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/browse" replace />;
  }

  const slide = featuredSlides[activeSlide];

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
        <h1>Movies, series &amp; more - on stream.</h1>

        <section
          className="landing-page__slideshow"
          aria-label="Featured streaming categories"
          aria-live="polite"
        >
          <div className="landing-page__slide" key={slide.title}>
            <span className="landing-page__slide-eyebrow">{slide.eyebrow}</span>
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
            {slide.isCta && (
              <Link to="/signup" className="landing-page__slide-link">
                Get started <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
          <div className="landing-page__slide-dots" aria-label="Choose a slide">
            {featuredSlides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={index === activeSlide ? 'is-active' : ''}
                aria-label={`Show slide ${index + 1}: ${item.title}`}
                aria-pressed={index === activeSlide}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </section>

        <div className="landing-page__actions">
          <Link to="/signup" className="landing-page__cta">
            Get Started
          </Link>
          <Link to="/login" className="landing-page__cta-secondary">
            Log In
          </Link>
        </div>
      </main>

      <footer className="landing-page__footer">
        <p>STREAM UG — Engineered by <span style={{ color: '#3b82f6', fontSize: '1.8em', fontWeight: 900, lineHeight: 1, verticalAlign: 'baseline' }}>V</span><span style={{ color: '#7dd3fc', fontWeight: 600 }}>ision</span>.</p><a href="https://visiongrow.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: '0.85em', display: 'inline-block', marginTop: '4px' }}>visiongrow.vercel.app</a>
      </footer>
    </div>
  );
}
