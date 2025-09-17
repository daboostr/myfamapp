/**
 * Lazy-loaded PreviewDialog component
 * Implements dynamic import for code splitting and performance
 */

import React, { lazy, Suspense } from 'react'
import { SharedImage } from '../models'

// Lazy load the PreviewDialog component
const LazyPreviewDialog = lazy(() => 
  import('./PreviewDialog').then(module => ({
    default: module.PreviewDialog
  }))
)

interface LazyPreviewDialogProps {
  image: SharedImage | null
  isOpen: boolean
  onClose: () => void
  className?: string
}

/**
 * PreviewDialog with lazy loading and suspense boundary
 * Only loads the component when first needed
 */
export function PreviewDialogLazy({
  image,
  isOpen,
  onClose,
  className = ''
}: LazyPreviewDialogProps) {
  // Don't render anything if dialog is not open
  if (!isOpen) {
    return null
  }

  return (
    <Suspense fallback={
      <div className="preview-loading" role="dialog" aria-modal="true">
        <div className="preview-loading-content">
          <div className="loading-spinner" aria-hidden="true"></div>
          <span className="loading-text">Loading preview...</span>
        </div>
      </div>
    }>
      <LazyPreviewDialog
        image={image}
        isOpen={isOpen}
        onClose={onClose}
        className={className}
      />
    </Suspense>
  )
}