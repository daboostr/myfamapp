/**
 * Data retrieval service for Microsoft Graph API
 * Fetches shared items from OneDrive/SharePoint
 */

import { GraphDriveItem } from '../models'
import { getToken, isTokenValid, refreshToken } from './auth'

// Graph API endpoints
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'
const SHARED_ITEMS_ENDPOINT = `${GRAPH_BASE}/me/drive/sharedWithMe`

/**
 * Fetch shared items from Microsoft Graph API
 * Handles authentication, token refresh, and retries
 */
export async function fetchSharedItems(): Promise<{
  items: GraphDriveItem[]
  error: string | null
}> {
  // Check if we have a valid token first
  if (!isTokenValid()) {
    return {
      items: [],
      error: 'Authentication required - please sign in'
    }
  }

  try {
    // Get authentication token
    let token = await getToken()
    if (!token) {
      return {
        items: [],
        error: 'Unable to get authentication token'
      }
    }

    // Check if we're in mock mode (no real API available)
    if (token === 'mock-access-token-12345') {
      return getMockSharedItems()
    }

    // Make Graph API request with retry logic
    let response = await makeGraphRequest(token)

    // If we get 401 (unauthorized), try to refresh the token once
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...')
      
      const newToken = await refreshToken()
      if (newToken) {
        token = newToken
        response = await makeGraphRequest(token)
      } else {
        return {
          items: [],
          error: 'Authentication expired - please sign in again'
        }
      }
    }

    if (!response.ok) {
      throw new Error(`Graph API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      items: data.value || [],
      error: null
    }

  } catch (error) {
    console.error('Failed to fetch shared items:', error)
    
    // Provide user-friendly error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        items: [],
        error: 'Network connection problem - please check your internet connection'
      }
    }
    
    return {
      items: [],
      error: error instanceof Error ? error.message : 'Failed to load shared items'
    }
  }
}

/**
 * Make Graph API request with proper headers
 */
async function makeGraphRequest(token: string): Promise<Response> {
  return fetch(`${SHARED_ITEMS_ENDPOINT}?$expand=thumbnails&$top=50`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ConsistencyLevel': 'eventual'
    },
    // Add timeout for better UX
    signal: AbortSignal.timeout(30000) // 30 second timeout
  })
}

/**
 * Get thumbnail URL for an item
 * Handles different thumbnail sizes and fallbacks
 */
export function getThumbnailUrl(item: GraphDriveItem, size: 'small' | 'medium' | 'large' = 'medium'): string | null {
  if (!item.thumbnails || item.thumbnails.length === 0) {
    return null
  }

  const thumbnail = item.thumbnails[0]
  
  // Try requested size first, then fallback to available sizes
  if (size === 'large' && thumbnail.large?.url) {
    return thumbnail.large.url
  }
  
  if (size === 'medium' && thumbnail.medium?.url) {
    return thumbnail.medium.url
  }
  
  if (size === 'small' && thumbnail.small?.url) {
    return thumbnail.small.url
  }
  
  // Fallback to any available size
  return thumbnail.large?.url || thumbnail.medium?.url || thumbnail.small?.url || null
}

/**
 * Mock data for development when Graph API is not available
 * Provides realistic test data matching our personas
 */
function getMockSharedItems(): Promise<{
  items: GraphDriveItem[]
  error: string | null
}> {
  const mockItems: GraphDriveItem[] = [
    {
      id: 'mock-item-1',
      name: 'family-vacation-beach.jpg',
      file: {
        mimeType: 'image/jpeg'
      },
      sharedBy: {
        user: {
          displayName: 'Alice Johnson',
          id: 'alice-id-123',
          email: 'alice.johnson@example.com'
        }
      },
      shared: {
        sharedDateTime: '2025-09-10T14:30:00Z'
      },
      thumbnails: [{
        medium: {
          url: 'https://picsum.photos/300/200?random=1'
        }
      }],
      webUrl: 'https://example-my.sharepoint.com/personal/alice/Documents/family-vacation-beach.jpg'
    },
    {
      id: 'mock-item-2',
      name: 'birthday-party-kids.jpg',
      file: {
        mimeType: 'image/jpeg'
      },
      sharedBy: {
        user: {
          displayName: 'Bob Smith',
          id: 'bob-id-456',
          email: 'bob.smith@example.com'
        }
      },
      shared: {
        sharedDateTime: '2025-09-12T16:45:00Z'
      },
      thumbnails: [{
        medium: {
          url: 'https://picsum.photos/300/200?random=2'
        }
      }],
      webUrl: 'https://example-my.sharepoint.com/personal/bob/Documents/birthday-party-kids.jpg'
    },
    {
      id: 'mock-item-3',
      name: 'hiking-trail-mountains.jpg',
      file: {
        mimeType: 'image/jpeg'
      },
      sharedBy: {
        user: {
          displayName: 'Alice Johnson',
          id: 'alice-id-123',
          email: 'alice.johnson@example.com'
        }
      },
      shared: {
        sharedDateTime: '2025-09-11T09:15:00Z'
      },
      thumbnails: [{
        medium: {
          url: 'https://picsum.photos/300/200?random=3'
        }
      }],
      webUrl: 'https://example-my.sharepoint.com/personal/alice/Documents/hiking-trail-mountains.jpg'
    },
    {
      id: 'mock-item-4',
      name: 'wedding-ceremony.jpg',
      file: {
        mimeType: 'image/jpeg'
      },
      sharedBy: {
        user: {
          displayName: 'Carol Williams',
          id: 'carol-id-789',
          email: 'carol.williams@example.com'
        }
      },
      shared: {
        sharedDateTime: '2025-09-08T18:20:00Z'
      },
      thumbnails: [{
        medium: {
          url: 'https://picsum.photos/300/200?random=4'
        }
      }],
      webUrl: 'https://example-my.sharepoint.com/personal/carol/Documents/wedding-ceremony.jpg'
    },
    {
      id: 'mock-item-5',
      name: 'office-team-lunch.jpg',
      file: {
        mimeType: 'image/jpeg'
      },
      sharedBy: {
        user: {
          displayName: 'Bob Smith',
          id: 'bob-id-456',
          email: 'bob.smith@example.com'
        }
      },
      shared: {
        sharedDateTime: '2025-09-14T12:30:00Z'
      },
      thumbnails: [{
        medium: {
          url: 'https://picsum.photos/300/200?random=5'
        }
      }],
      webUrl: 'https://example-my.sharepoint.com/personal/bob/Documents/office-team-lunch.jpg'
    },
    {
      id: 'mock-item-6',
      name: 'garden-flowers-spring.jpg',
      file: {
        mimeType: 'image/jpeg'
      },
      sharedBy: {
        user: {
          displayName: 'Alice Johnson',
          id: 'alice-id-123',
          email: 'alice.johnson@example.com'
        }
      },
      shared: {
        sharedDateTime: '2025-09-13T08:45:00Z'
      },
      // No thumbnail to test fallback behavior
      thumbnails: [],
      webUrl: 'https://example-my.sharepoint.com/personal/alice/Documents/garden-flowers-spring.jpg'
    }
  ]

  // Simulate async API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: mockItems,
        error: null
      })
    }, 500) // Realistic network delay
  })
}

/**
 * Refresh shared items cache
 * Forces a fresh fetch from the API
 */
export async function refreshSharedItems(): Promise<{
  items: GraphDriveItem[]
  error: string | null
}> {
  // Clear any cached data if we had caching
  return fetchSharedItems()
}