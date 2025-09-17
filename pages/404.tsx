/**
 * 404 Page - Custom Not Found page for static export
 * Required for Next.js static export compatibility
 */

import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found - OneDrive Photo Gallery</title>
        <meta name="description" content="The requested page could not be found." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon" aria-hidden="true">
            📸
          </div>
          
          <h1>Page Not Found</h1>
          
          <p>
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or the URL might be incorrect.
          </p>
          
          <div className="error-actions">
            <Link href="/" className="home-button">
              <span>Return to Gallery</span>
            </Link>
            
            <button 
              type="button"
              className="back-button"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
          
          <div className="error-help">
            <h2>What you can do:</h2>
            <ul>
              <li>Check the URL for any typos</li>
              <li>Return to the main gallery page</li>
              <li>Use your browser's back button</li>
              <li>Sign in to access your shared photos</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

// CSS-in-JS styles for 404 page
export const errorPageStyles = `
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.error-content {
  background: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  display: block;
  opacity: 0.7;
}

.error-content h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #323130;
}

.error-content p {
  margin: 0 0 2rem 0;
  color: #605e5c;
  line-height: 1.6;
  font-size: 1rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.home-button,
.back-button {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.home-button {
  background: #0078d4;
  color: white;
}

.home-button:hover {
  background: #106ebe;
  text-decoration: none;
}

.home-button:focus {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
}

.back-button {
  background: transparent;
  color: #323130;
  border: 1px solid #c7c7c7;
}

.back-button:hover {
  background: #f3f2f1;
  border-color: #a19f9d;
}

.back-button:focus {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
}

.error-help {
  text-align: left;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #0078d4;
}

.error-help h2 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #323130;
}

.error-help ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #605e5c;
}

.error-help li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

/* Responsive design */
@media (max-width: 768px) {
  .error-container {
    padding: 1rem;
  }
  
  .error-content {
    padding: 2rem 1.5rem;
  }
  
  .error-content h1 {
    font-size: 1.75rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .home-button,
  .back-button {
    width: 100%;
    max-width: 200px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .error-content {
    border: 2px solid;
  }
  
  .home-button:focus,
  .back-button:focus {
    outline: 3px solid;
  }
}

/* Dark mode (if supported) */
@media (prefers-color-scheme: dark) {
  .error-container {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
  
  .error-content {
    background: #1a202c;
    color: #e2e8f0;
  }
  
  .error-content h1 {
    color: #f7fafc;
  }
  
  .error-help {
    background: #2d3748;
    color: #e2e8f0;
  }
  
  .error-help h2 {
    color: #f7fafc;
  }
}
`