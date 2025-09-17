/**
 * Home page - OneDrive Photo Gallery
 * Wires together authentication, data fetching, and UI components
 */

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Session, SharedImage } from '../src/models'
import { getCurrentSession, signIn, signOut, onAuthChange } from '../src/services/auth'
import { SelectionProvider, useSelection, useCurrentSelection, usePeople } from '../src/state/selection'
import { PeoplePanel } from '../src/components/PeoplePanel'
import { Gallery } from '../src/components/Gallery'
import { PreviewDialogLazy } from '../src/components/PreviewDialogLazy'
import { monitorPerformance } from '../src/utils/performance'
import { logAccessibilityResults } from '../src/tests/accessibility.test'

// Main app component (wrapped by providers)
function HomePageContent() {
  const [session, setSession] = useState<Session | null>(null)
  const [previewImage, setPreviewImage] = useState<SharedImage | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const { state, refreshData } = useSelection()
  const { people, selectedPerson, selectPerson } = usePeople()
  const { displayImages, isLoading, error } = useCurrentSelection()

  // Initialize authentication state
  useEffect(() => {
    const currentSession = getCurrentSession()
    setSession(currentSession)

    // Listen for auth changes
    const cleanup = onAuthChange((newSession) => {
      setSession(newSession)
      if (newSession.isAuthenticated) {
        // Refresh data when user signs in
        refreshData()
      }
    })

    return cleanup
  }, [refreshData])

  // Performance monitoring in development
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Monitor performance after component mounts
      const timer = setTimeout(() => {
        monitorPerformance()
        logAccessibilityResults()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleSignIn = async () => {
    try {
      const newSession = await signIn()
      setSession(newSession)
      if (newSession.isAuthenticated) {
        await refreshData()
      }
    } catch (error) {
      console.error('Sign-in failed:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setSession({
        isAuthenticated: false,
        account: null,
        accessToken: null,
        error: null
      })
    } catch (error) {
      console.error('Sign-out failed:', error)
    }
  }

  const handleImageClick = (image: SharedImage) => {
    setPreviewImage(image)
    setIsPreviewOpen(true)
  }

  const handlePreviewClose = () => {
    setIsPreviewOpen(false)
    setPreviewImage(null)
  }

  const handleRefresh = async () => {
    await refreshData()
  }

  // Show authentication prompt for unauthenticated users
  if (!session?.isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>OneDrive Photo Gallery</h1>
          <p>View photos that have been shared with you through OneDrive and SharePoint.</p>
          
          {session?.error && (
            <div role="alert" className="error-message" aria-live="assertive">
              <strong>Authentication Error:</strong> {session.error}
              <button 
                type="button" 
                className="retry-button"
                onClick={handleSignIn}
              >
                Retry Sign In
              </button>
            </div>
          )}
          
          <button 
            type="button"
            className="sign-in-button"
            onClick={handleSignIn}
          >
            <span>Sign in with Microsoft</span>
          </button>
          
          <p className="privacy-note">
            We'll only access photos that others have explicitly shared with you.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* App header */}
      <header className="app-header">
        <div className="header-content">
          <h1>OneDrive Photo Gallery</h1>
          <div className="header-actions">
            <span className="user-name">
              Welcome, {session.account?.name || 'User'}
            </span>
            <button 
              type="button"
              className="refresh-button"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Refresh photos"
            >
              🔄
            </button>
            <button 
              type="button"
              className="sign-out-button"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Error handling */}
      {error && (
        <div role="alert" className="app-error" aria-live="assertive">
          <strong>Error:</strong> {error}
          <button 
            type="button"
            className="retry-button"
            onClick={handleRefresh}
          >
            Refresh & Try Again
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="app-content">
        <PeoplePanel
          people={people}
          selectedPerson={selectedPerson}
          onSelectPerson={selectPerson}
          isLoading={isLoading}
          className="app-people-panel"
        />
        
        <Gallery
          images={displayImages}
          onImageClick={handleImageClick}
          isLoading={isLoading}
          className="app-gallery"
        />
      </div>

      {/* Preview dialog */}
      <PreviewDialogLazy
        image={previewImage}
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
      />
    </div>
  )
}

// Main exported component with providers
export default function HomePage() {
  return (
    <>
      <Head>
        <title>OneDrive Photo Gallery - View Shared Photos</title>
        <meta name="description" content="View and browse photos that have been shared with you through OneDrive and SharePoint. Access your shared photo collection in a beautiful, organized gallery." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://yourapp.com/" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="OneDrive Photo Gallery" />
        <meta property="og:description" content="View and browse photos shared with you through OneDrive and SharePoint" />
        <meta property="og:url" content="https://yourapp.com/" />
        <meta property="og:image" content="/social-preview.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="OneDrive Photo Gallery" />
        <meta name="twitter:description" content="View and browse photos shared with you through OneDrive and SharePoint" />
        <meta name="twitter:image" content="/social-preview.png" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <SelectionProvider>
        <HomePageContent />
      </SelectionProvider>
    </>
  )
}