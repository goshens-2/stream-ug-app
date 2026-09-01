import type { Ad } from '../types';
import './AdBanner.css';

interface AdBannerProps {
  ad: Ad;
}

/** Placeholder ad slot shown to non-subscribed users. */
export function AdBanner({ ad }: AdBannerProps) {
  return (
    <a href={ad.targetUrl} className="ad-banner" aria-label={`Advertisement: ${ad.title}`}>
      <span className="ad-banner__badge">Ad</span>
      <img src={ad.imageUrl} alt="" className="ad-banner__image" />
      <span className="ad-banner__title">{ad.title}</span>
    </a>
  );
}
