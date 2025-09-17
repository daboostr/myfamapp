/**
 * Responsive image utilities - generate srcset and sizes for performance
 * Implements responsive image patterns for different screen densities
 */

export interface ImageSizes {
  small: string
  medium: string
  large: string
}

export interface ResponsiveImageProps {
  src: string
  alt: string
  sizes?: ImageSizes
  className?: string
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void
}

/**
 * Generate srcset string for responsive images
 * Uses Microsoft Graph thumbnails if available, falls back to original
 */
export function generateSrcSet(baseUrl: string, sizes?: ImageSizes): string {
  if (!sizes) {
    return baseUrl
  }

  const srcSet = []
  
  if (sizes.small) {
    srcSet.push(`${sizes.small} 300w`)
  }
  
  if (sizes.medium) {
    srcSet.push(`${sizes.medium} 600w`)
  }
  
  if (sizes.large) {
    srcSet.push(`${sizes.large} 1200w`)
  }
  
  // Add original as fallback
  srcSet.push(`${baseUrl} 1920w`)
  
  return srcSet.join(', ')
}

/**
 * Generate sizes attribute for responsive images
 * Optimizes for gallery grid layout
 */
export function generateSizes(): string {
  return [
    '(max-width: 480px) 100vw',
    '(max-width: 768px) 50vw',  
    '(max-width: 1024px) 33vw',
    '25vw'
  ].join(', ')
}

/**
 * Extract thumbnail sizes from Microsoft Graph image
 * Graph API provides different thumbnail sizes
 */
export function extractGraphThumbnails(graphImage: any): ImageSizes | undefined {
  if (!graphImage?.thumbnails?.length) {
    return undefined
  }

  const thumbnails = graphImage.thumbnails[0]
  
  return {
    small: thumbnails.small?.url || thumbnails.c64?.url,
    medium: thumbnails.medium?.url || thumbnails.c240?.url, 
    large: thumbnails.large?.url || thumbnails.c400?.url
  }
}

/**
 * ResponsiveImage component with lazy loading and srcset
 */
export function ResponsiveImage({
  src,
  alt,
  sizes,
  className = '',
  onError
}: ResponsiveImageProps) {
  const srcSet = generateSrcSet(src, sizes)
  const sizesAttr = generateSizes()

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizesAttr}
      alt={alt}
      className={className}
      onError={onError}
      loading="lazy"
      decoding="async"
    />
  )
}