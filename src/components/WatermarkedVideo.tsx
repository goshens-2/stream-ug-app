import type { WatermarkSettings } from '../types';
import './WatermarkedVideo.css';

interface WatermarkedVideoProps {
  src: string;
  poster?: string;
  watermark: WatermarkSettings;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

/** A <video> element with an optional overlaid text watermark. */
export function WatermarkedVideo({
  src,
  poster,
  watermark,
  autoPlay = false,
  loop = false,
  muted = true,
  controls = false,
  className,
}: WatermarkedVideoProps) {
  return (
    <div className={`watermarked-video ${className ?? ''}`}>
      <video
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
      />
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
