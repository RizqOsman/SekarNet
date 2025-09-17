import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  placeholderSrc
}) => {
  // Determine if WebP is available
  const webpSrc = src.replace(/\.[^/.]+$/, ".webp");
  
  return (
    <picture className={className}>
      {/* WebP source */}
      <source
        srcSet={webpSrc}
        type="image/webp"
      />
      {/* Original image source */}
      <LazyLoadImage
        alt={alt}
        src={src}
        width={width}
        height={height}
        effect="blur"
        placeholderSrc={placeholderSrc}
        wrapperClassName={className}
      />
    </picture>
  );
};
