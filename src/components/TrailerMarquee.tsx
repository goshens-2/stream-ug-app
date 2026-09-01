import { useEffect, useRef, useState } from 'react';
import type { Content } from '../types';
import { WatermarkedVideo } from './WatermarkedVideo';
import './TrailerMarquee.css';

interface TrailerMarqueeProps {
  content: Content;
}

/**
 * A trailer preview card. The trailer starts playing automatically once it
 * scrolls into the viewport, and pauses again once it scrolls out of view.
 */
export function TrailerMarquee({ content }: TrailerMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="trailer-marquee">
      <WatermarkedVideo
        src={content.trailerUrl}
        poster={content.posterUrl}
        watermark={content.watermark}
        autoPlay={isInView}
        loop
        muted
      />
      <div className="trailer-marquee__title">{content.title}</div>
    </div>
  );
}
