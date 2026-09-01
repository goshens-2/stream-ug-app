import { useEffect, useRef, useState } from 'react';
import type { Content } from '../types';
import { WatermarkedVideo } from './WatermarkedVideo';
import './TrailerMarquee.css';

interface TrailerMarqueeProps {
  content: Content;
  /** Non-subscribed users get trailers that auto-play on scroll into view. */
  autoPlayOnScroll: boolean;
}

/**
 * A trailer preview card. When `autoPlayOnScroll` is true (i.e. the viewer is
 * not subscribed), the trailer starts playing automatically once it scrolls
 * into the viewport, and pauses again once it scrolls out of view.
 */
export function TrailerMarquee({ content, autoPlayOnScroll }: TrailerMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!autoPlayOnScroll) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoPlayOnScroll]);

  const shouldAutoPlay = autoPlayOnScroll ? isInView : false;

  return (
    <div ref={containerRef} className="trailer-marquee">
      <WatermarkedVideo
        src={content.trailerUrl}
        poster={content.posterUrl}
        watermark={content.watermark}
        autoPlay={shouldAutoPlay}
        loop
        muted
      />
      <div className="trailer-marquee__title">{content.title}</div>
    </div>
  );
}
