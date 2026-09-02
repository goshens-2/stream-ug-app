import type { SyntheticEvent } from 'react';
import type { WatermarkSettings } from '../types';
import './WatermarkedVideo.css';

interface WatermarkedVideoProps {
  src: string;
  embedUrl?: string;
  poster?: string;
  watermark: WatermarkSettings;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  onTimeUpdate?: (event: SyntheticEvent<HTMLVideoElement>) => void;
}

/** A <video> element with an optional overlaid text watermark. */
export function WatermarkedVideo({
  src,
  embedUrl,
  poster,
  watermark,
  autoPlay = false,
  loop = false,
  muted = true,
  controls = false,
  className,
  onTimeUpdate,
}: WatermarkedVideoProps) {
  const isApprovedEmbed = (() => {
    if (!embedUrl) return false;
    try {
      const { hostname, protocol } = new URL(embedUrl);
      return protocol === 'https:' && (
        hostname === 'www.youtube.com' ||
        hostname === 'youtube.com' ||
        hostname === 'player.vimeo.com'
      );
    } catch {
      return false;
    }
  })();

  return (
    <div className={`watermarked-video ${className ?? ''}`}>
      {isApprovedEmbed ? (
        <iframe
          src={embedUrl}
          title="Embedded video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : src ? (
        <video
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          playsInline
          onTimeUpdate={onTimeUpdate}
        />
      ) : (
        <p className="watermarked-video__unavailable">Playback is not available for this title yet.</p>
      )}
      {watermark.enabled && (
        <span
          className={`watermarked-video__mark watermarked-video__mark--${watermark.position}`}
          style={{ opacity: watermark.opacity }}
        >
          {watermark.text}
        </span>
      )}
    </div>
  );
}
