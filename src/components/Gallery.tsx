/**
 * Gallery component - responsive grid displaying shared images
 * Implements lazy loading and keyboard navigation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SharedImage, GalleryItem } from '../models'
import { toGalleryItem } from '../services/grouping'
import { ErrorBoundary, ImageErrorBoundary } from './ErrorBoundary'
import { useLazyImage } from '../hooks/useIntersectionObserver'

interface GalleryProps {
  images: SharedImage[]
  onImageClick: (image: SharedImage) => void
  isLoading?: boolean
  className?: string
}

export function Gallery({
  images,
  onImageClick,
  isLoading = false,
  className = ''
}: GalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const galleryRef = useRef<HTMLDivElement>(null)

  // Transform images to gallery items when images change
  useEffect(() => {
    const items = images.map(toGalleryItem)
    setGalleryItems(items)
    // Clear previous image errors when new images load
    setImageErrors(new Set())
  }, [images])

  const handleImageClick = useCallback((item: GalleryItem) => {
    onImageClick(item.image)
  }, [onImageClick])

  const handleImageKeyDown = useCallback((event: React.KeyboardEvent, item: GalleryItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onImageClick(item.image)
    }
  }, [onImageClick])

  // Grid keyboard navigation
  const handleGalleryKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (galleryItems.length === 0) return

    const { key } = event
    const currentIndex = focusedIndex
    let newIndex = currentIndex

    // Calculate grid dimensions for arrow navigation
    const gridElement = galleryRef.current
    if (!gridElement) return

    const firstChild = gridElement.children[0] as HTMLElement
    if (!firstChild) return

    const itemWidth = firstChild.offsetWidth
    const containerWidth = gridElement.offsetWidth
    const itemsPerRow = Math.floor(containerWidth / itemWidth) || 1

    switch (key) {
      case 'ArrowRight':
        event.preventDefault()
        newIndex = Math.min(currentIndex + 1, galleryItems.length - 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        newIndex = Math.max(currentIndex - 1, 0)
        break
      case 'ArrowDown':
        event.preventDefault()
        newIndex = Math.min(currentIndex + itemsPerRow, galleryItems.length - 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        newIndex = Math.max(currentIndex - itemsPerRow, 0)
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = galleryItems.length - 1
        break
      case 'Enter':
      case ' ':
        if (currentIndex >= 0 && currentIndex < galleryItems.length) {
          event.preventDefault()
          onImageClick(galleryItems[currentIndex].image)
        }
        break
      default:
        return
    }

    if (newIndex !== currentIndex) {
      setFocusedIndex(newIndex)
      
      // Focus the actual button element
      const buttons = gridElement.querySelectorAll('.image-button')
      const targetButton = buttons[newIndex] as HTMLElement
      if (targetButton) {
        targetButton.focus()
      }
    }
  }, [galleryItems, focusedIndex, onImageClick])

  const handleImageError = useCallback((imageId: string) => {
    setImageErrors(prev => new Set(prev).add(imageId))
  }, [])

  const handleImageRetry = useCallback((imageId: string) => {
    setImageErrors(prev => {
      const newSet = new Set(prev)
      newSet.delete(imageId)
      return newSet
    })
  }, [])

  if (isLoading) {
    return (
      <main 
        className={`gallery loading ${className}`}
        role="main"
        aria-label="Photo gallery"
      >
        <h2 className="visually-hidden">Photo Gallery</h2>
        <div role="status" aria-label="Loading photos">
          <div className="loading-spinner" aria-hidden="true"></div>
          <span className="loading-text">Loading photos...</span>
        </div>
      </main>
    )
  }

  if (galleryItems.length === 0) {
    return (
      <main 
        className={`gallery empty ${className}`}
        role="main"
        aria-label="Photo gallery"
      >
        <h2 className="visually-hidden">Photo Gallery</h2>
        <div role="status" className="empty-state">
          <div className="empty-icon" aria-hidden="true">📸</div>
          <h3>No shared photos to display</h3>
          <p>Ask someone to share their photos with you to get started.</p>
        </div>
      </main>
    )
  }

  return (
    <ErrorBoundary fallback={
      <div className="gallery-error">
        <h3>Gallery Error</h3>
        <p>There was a problem displaying the photo gallery.</p>
      </div>
    }>
      <main 
        className={`gallery ${className}`}
        role="main"
        aria-label="Photo gallery"
      >
        <h2 className="visually-hidden">Photo Gallery</h2>
        
        <div 
          ref={galleryRef}
          className="gallery-grid"
          role="grid"
          aria-label={`Gallery with ${galleryItems.length} ${galleryItems.length === 1 ? 'image' : 'images'}`}
          onKeyDown={handleGalleryKeyDown}
          tabIndex={-1}
        >
          {galleryItems.map((item, index) => (
            <ImageErrorBoundary key={item.image.id}>
              <ImageCard
                item={item}
                index={index}
                hasError={imageErrors.has(item.image.id)}
                onClick={handleImageClick}
                onKeyDown={handleImageKeyDown}
                onImageError={handleImageError}
                onRetry={handleImageRetry}
              />
            </ImageErrorBoundary>
          ))}
        </div>
      </main>
    </ErrorBoundary>
  )
}

// Individual image card component with error handling
interface ImageCardProps {
  item: GalleryItem
  index: number
  hasError: boolean
  onClick: (item: GalleryItem) => void
  onKeyDown: (event: React.KeyboardEvent, item: GalleryItem) => void
  onImageError: (imageId: string) => void
  onRetry: (imageId: string) => void
}

function ImageCard({ item, index, hasError, onClick, onKeyDown, onImageError, onRetry }: ImageCardProps) {
  const { image, altText, hasThumbnail, placeholder } = item
  
  // Lazy loading for thumbnail
  const { ref: lazyRef, src: lazySrc, shouldLoad } = useLazyImage(
    hasThumbnail ? image.preview.thumbnailUrl! : ''
  )
  
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    onImageError(image.id)
  }

  const handleRetry = () => {
    onRetry(image.id)
  }
  
  return (
    <div 
      ref={lazyRef as React.RefObject<HTMLDivElement>} 
      className={`image-card ${hasError ? 'has-error' : ''}`}
      role="gridcell"
    >
      <button
        type="button"
        className="image-button"
        onClick={() => onClick(item)}
        onKeyDown={(e) => onKeyDown(e, item)}
        aria-label={`Open ${image.name} shared by ${image.sharedBy.displayName} in preview dialog`}
        aria-describedby={`image-details-${image.id}`}
      >
        <div className="image-container">
          {hasError ? (
            <div className="image-error-state">
              <span className="error-icon" aria-hidden="true">⚠️</span>
              <span className="error-text">Failed to load image</span>
              <button
                type="button"
                className="retry-image-button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRetry()
                }}
                aria-label="Retry loading image"
              >
                Retry
              </button>
            </div>
          ) : hasThumbnail && shouldLoad ? (
            lazySrc ? (
              <img
                src={lazySrc}
                alt={altText}
                onError={handleImageError}
                className="thumbnail-image"
              />
            ) : (
              <div className="image-loading" aria-label="Loading image">
                <span className="loading-icon" aria-hidden="true">⏳</span>
                <span className="loading-text">Loading...</span>
              </div>
            )
          ) : hasThumbnail ? (
            <div className="image-pending" aria-label="Image pending">
              <span className="pending-icon" aria-hidden="true">⏳</span>
              <span className="pending-text">Loading...</span>
            </div>
          ) : (
            <div className="image-placeholder" aria-label={placeholder}>
              <span className="placeholder-icon" aria-hidden="true">🖼️</span>
              <span className="placeholder-text">{placeholder}</span>
            </div>
          )}
        </div>
        
        <div className="image-info" id={`image-details-${image.id}`}>
          <h3 className="image-name" title={image.name}>
            {image.name}
          </h3>
          <p className="image-meta">
            <span className="shared-by">by {image.sharedBy.displayName}</span>
            <span className="shared-date" aria-label={`Shared on ${formatDate(image.dateShared)}`}>
              {formatDate(image.dateShared)}
            </span>
          </p>
        </div>
      </button>
    </div>
  )
}

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Unknown date'
  }
}

// CSS-in-JS styles
export const galleryStyles = `
.gallery {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.gallery h2.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
}

.image-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.image-button {
  width: 100%;
  border: none;
  background: white;
  cursor: pointer;
  padding: 0;
  text-align: left;
  font-family: inherit;
}

.image-button:focus {
  outline: 3px solid #0078d4;
  outline-offset: 2px;
}

.image-container {
  aspect-ratio: 16 / 9;
  background: #f3f2f1;
  position: relative;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #605e5c;
  background: #faf9f8;
}

.placeholder-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.placeholder-text {
  font-size: 0.875rem;
  text-align: center;
}

.image-info {
  padding: 1rem;
}

.image-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #323130;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-meta {
  margin: 0;
  font-size: 0.875rem;
  color: #605e5c;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.shared-by {
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-date {
  font-size: 0.8125rem;
  opacity: 0.8;
  white-space: nowrap;
}

.loading-text {
  color: #605e5c;
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #323130;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  color: #605e5c;
  line-height: 1.5;
}

.image-error .thumbnail-image {
  display: none;
}

.image-error .image-container::after {
  content: "Image unavailable";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f2f1;
  color: #605e5c;
  font-size: 0.875rem;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .gallery {
    padding: 1rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
  
  .image-info {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .image-card {
    border: 1px solid;
  }
  
  .image-button:focus {
    outline: 4px solid;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .image-card {
    transition: none;
  }
  
  .image-card:hover {
    transform: none;
  }
}
`