/**
 * Error Boundary component for catching React errors
 * Provides graceful error handling and user feedback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon" aria-hidden="true">⚠️</div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
            
            <div className="error-actions">
              <button 
                type="button" 
                className="retry-button"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              
              <button 
                type="button" 
                className="refresh-button"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundary for image loading
interface ImageErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ImageErrorBoundary({ children, fallback }: ImageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={fallback || (
        <div className="image-error-fallback">
          <span className="error-icon">🖼️</span>
          <span>Image unavailable</span>
        </div>
      )}
      onError={(error) => {
        console.warn('Image component error:', error.message)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// CSS-in-JS styles for error boundaries
export const errorBoundaryStyles = `
.error-boundary {
  padding: 2rem;
  text-align: center;
  background: #fef7f7;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin: 1rem;
}

.error-content {
  max-width: 500px;
  margin: 0 auto;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.error-boundary h2 {
  margin: 0 0 1rem 0;
  color: #dc2626;
  font-size: 1.5rem;
}

.error-boundary p {
  margin: 0 0 1.5rem 0;
  color: #374151;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button,
.refresh-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button {
  background: #dc2626;
  color: white;
}

.retry-button:hover {
  background: #b91c1c;
}

.refresh-button {
  background: #6b7280;
  color: white;
}

.refresh-button:hover {
  background: #4b5563;
}

.error-details {
  margin-top: 1.5rem;
  text-align: left;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 1rem;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-stack {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #374151;
  white-space: pre-wrap;
  overflow-x: auto;
  margin: 0;
}

.image-error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  color: #6b7280;
  min-height: 120px;
}

.image-error-fallback .error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .error-boundary {
    padding: 1.5rem 1rem;
    margin: 0.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .retry-button,
  .refresh-button {
    width: 100%;
    max-width: 200px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .error-boundary {
    border: 2px solid;
  }
  
  .retry-button:focus,
  .refresh-button:focus {
    outline: 3px solid;
  }
}
`