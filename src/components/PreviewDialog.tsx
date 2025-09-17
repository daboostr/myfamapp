/**
 * PreviewDialog component - modal for image preview with focus management
 * Implements ARIA dialog pattern and keyboard navigation
 */

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { SharedImage } from '../models'
import { ErrorBoundary } from './ErrorBoundary'

interface PreviewDialogProps {
  image: SharedImage | null
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function PreviewDialog({
  image,
  isOpen,
  onClose,
  className = ''
}: PreviewDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [imageError, setImageError] = useState<boolean>(false)

  // Store previous focus when dialog opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus the close button when dialog opens
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    } else {
      // Restore focus when dialog closes
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Focus trap within dialog
  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    if (!dialog) return

    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }, [onClose])

  const handleOpenExternal = useCallback(() => {
    if (image?.webUrl) {
      window.open(image.webUrl, '_blank', 'noopener,noreferrer')
    }
  }, [image])

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const handleImageRetry = useCallback(() => {
    setImageError(false)
  }, [])

  // Reset error state when image changes
  useEffect(() => {
    setImageError(false)
  }, [image?.id])

  if (!isOpen || !image) {
    return null
  }

  const formattedDate = formatDate(image.dateShared)
  const hasExternalUrl = !!image.webUrl

  return (
    <ErrorBoundary fallback={
      <div className="preview-error">
        <h3>Preview Error</h3>
        <p>There was a problem displaying this image preview.</p>
        <button onClick={onClose} type="button">Close</button>
      </div>
    }>
      <div 
        className={`preview-overlay ${className}`}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
      aria-describedby="preview-description"
    >
      <div 
        ref={dialogRef}
        className="preview-dialog"
        role="document"
      >
        {/* Dialog header */}
        <header className="preview-header">
          <h2 id="preview-title" className="preview-title">
            Image Preview
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close preview"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        {/* Image content */}
        <div className="preview-content">
          <div className="preview-image-container">
            {imageError ? (
              <div className="preview-error-state">
                <span className="error-icon" aria-hidden="true">⚠️</span>
                <span className="error-text">Failed to load image</span>
                <button
                  type="button"
                  className="retry-preview-button"
                  onClick={handleImageRetry}
                  aria-label="Retry loading image"
                >
                  Retry
                </button>
              </div>
            ) : image.preview.thumbnailUrl ? (
              <img
                src={image.preview.thumbnailUrl}
                alt={`${image.name} shared by ${image.sharedBy.displayName}`}
                className="preview-image"
                onError={handleImageError}
              />
            ) : (
              <div className="preview-placeholder">
                <span className="placeholder-icon" aria-hidden="true">🖼️</span>
                <span>Preview not available</span>
              </div>
            )}
          </div>

          <div className="preview-info" id="preview-description">
            <h3 className="image-name">{image.name}</h3>
            
            <dl className="image-details">
              <dt>Shared by:</dt>
              <dd>{image.sharedBy.displayName}</dd>
              
              <dt>Date shared:</dt>
              <dd>{formattedDate}</dd>
              
              <dt>File type:</dt>
              <dd>{image.mimeType}</dd>
            </dl>
          </div>
        </div>

        {/* Dialog footer */}
        <footer className="preview-footer">
          {hasExternalUrl && (
            <button
              type="button"
              className="open-external-button"
              onClick={handleOpenExternal}
            >
              <span>Open in source application</span>
              <span aria-hidden="true">↗</span>
            </button>
          )}
          
          <button
            type="button"
            className="close-footer-button"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
    </ErrorBoundary>
  )
}

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Unknown date'
  }
}

// CSS-in-JS styles
export const previewDialogStyles = `
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.preview-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  max-height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e1e1e1;
  background: #fafafa;
}

.preview-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #323130;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  color: #605e5c;
  transition: all 0.1s ease;
}

.close-button:hover {
  background: #e1e1e1;
  color: #323130;
}

.close-button:focus {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
}

.preview-content {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.preview-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  min-height: 300px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #605e5c;
  gap: 0.5rem;
}

.placeholder-icon {
  font-size: 3rem;
}

.preview-info {
  width: 280px;
  padding: 1.5rem;
  border-left: 1px solid #e1e1e1;
  background: white;
  overflow-y: auto;
}

.image-name {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #323130;
  word-break: break-word;
}

.image-details {
  margin: 0;
}

.image-details dt {
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.image-details dd {
  margin: 0 0 1rem 0;
  color: #605e5c;
  word-break: break-word;
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e1e1e1;
  background: #fafafa;
  gap: 1rem;
}

.open-external-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.1s ease;
}

.open-external-button:hover {
  background: #106ebe;
}

.open-external-button:focus {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
}

.close-footer-button {
  padding: 0.5rem 1rem;
  background: transparent;
  color: #323130;
  border: 1px solid #c7c7c7;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.1s ease;
}

.close-footer-button:hover {
  background: #f3f2f1;
  border-color: #a19f9d;
}

.close-footer-button:focus {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .preview-overlay {
    padding: 0.5rem;
  }
  
  .preview-dialog {
    max-height: 95vh;
  }
  
  .preview-content {
    flex-direction: column;
  }
  
  .preview-info {
    width: 100%;
    max-height: 200px;
  }
  
  .preview-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .open-external-button,
  .close-footer-button {
    width: 100%;
    justify-content: center;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .preview-dialog {
    border: 2px solid;
  }
  
  .close-button:focus,
  .open-external-button:focus,
  .close-footer-button:focus {
    outline: 3px solid;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .close-button,
  .open-external-button,
  .close-footer-button {
    transition: none;
  }
}
`