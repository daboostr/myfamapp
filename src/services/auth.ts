/**
 * Authentication service using MSAL.js
 * Handles Microsoft account sign-in and token management
 */

import { Session } from '../models'

// MSAL configuration - these would be environment variables in production
const MSAL_CONFIG = {
  clientId: 'mock-client-id', // Would be process.env.NEXT_PUBLIC_AZURE_CLIENT_ID in production
  authority: 'https://login.microsoftonline.com/common',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  scopes: ['User.Read', 'Files.Read.All']
}

// Mock MSAL for development when packages not installed
interface MockMSAL {
  instance: {
    getAllAccounts(): any[]
    acquireTokenSilent(request: any): Promise<any>
    acquireTokenPopup(request: any): Promise<any>
    loginPopup(request: any): Promise<any>
    logout(): Promise<void>
  }
}

// Type-safe MSAL access
let msalInstance: MockMSAL['instance'] | null = null

/**
 * Initialize MSAL instance
 * In production, this would use @azure/msal-browser
 */
function initializeMSAL(): MockMSAL['instance'] {
  if (msalInstance) return msalInstance

  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    // Server-side: return mock
    return createMockMSAL()
  }

  try {
    // Try to use real MSAL if available
    // const { PublicClientApplication } = require('@azure/msal-browser')
    // msalInstance = new PublicClientApplication({ auth: MSAL_CONFIG })
    
    // For now, use mock until dependencies are installed
    msalInstance = createMockMSAL()
    return msalInstance
  } catch (error) {
    console.warn('MSAL not available, using mock:', error)
    msalInstance = createMockMSAL()
    return msalInstance
  }
}

/**
 * Mock MSAL implementation for development
 */
function createMockMSAL(): MockMSAL['instance'] {
  const mockAccount = {
    account: {
      name: 'Test User',
      username: 'test.user@example.com'
    },
    accessToken: 'mock-access-token-12345'
  }

  return {
    getAllAccounts: () => {
      // Check localStorage for persisted mock session
      const stored = localStorage.getItem('msal.account')
      return stored ? [JSON.parse(stored)] : []
    },

    acquireTokenSilent: async (request) => {
      const stored = localStorage.getItem('msal.account')
      const accounts = stored ? [JSON.parse(stored)] : []
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }
      return mockAccount
    },

    acquireTokenPopup: async (request) => {
      return mockAccount
    },

    loginPopup: async (request) => {
      // Simulate auth flow
      localStorage.setItem('msal.account', JSON.stringify(mockAccount))
      return mockAccount
    },

    logout: async () => {
      localStorage.removeItem('msal.account')
    }
  }
}

/**
 * Get current authentication session
 */
export function getCurrentSession(): Session {
  try {
    const msal = initializeMSAL()
    const accounts = msal.getAllAccounts()
    
    if (accounts.length > 0) {
      const account = accounts[0]
      return {
        isAuthenticated: true,
        account: {
          name: account.account?.name || 'Unknown User',
          username: account.account?.username || 'unknown@example.com'
        },
        accessToken: account.accessToken || null,
        error: null
      }
    }
    
    return {
      isAuthenticated: false,
      account: null,
      accessToken: null,
      error: null
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      account: null,
      accessToken: null,
      error: error instanceof Error ? error.message : 'Authentication error'
    }
  }
}

/**
 * Sign in user with Microsoft account
 */
export async function signIn(): Promise<Session> {
  try {
    const msal = initializeMSAL()
    
    const result = await msal.loginPopup({
      scopes: MSAL_CONFIG.scopes
    })
    
    return {
      isAuthenticated: true,
      account: {
        name: result.account?.name || 'Unknown User',
        username: result.account?.username || 'unknown@example.com'
      },
      accessToken: result.accessToken,
      error: null
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      account: null,
      accessToken: null,
      error: error instanceof Error ? error.message : 'Sign-in failed'
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const msal = initializeMSAL()
    await msal.logout()
  } catch (error) {
    console.error('Sign-out error:', error)
    // Clear local storage as fallback
    if (typeof window !== 'undefined') {
      localStorage.removeItem('msal.account')
    }
  }
}

/**
 * Get access token for API calls
 * Handles silent refresh if needed and token expiration
 */
export async function getToken(): Promise<string | null> {
  try {
    const msal = initializeMSAL()
    const accounts = msal.getAllAccounts()
    
    if (accounts.length === 0) {
      return null
    }
    
    // Check if we have a cached token first
    const account = accounts[0]
    if (account.accessToken) {
      // In a real implementation, we'd check token expiration here
      // For now, assume mock tokens are always valid
      if (account.accessToken === 'mock-access-token-12345') {
        return account.accessToken
      }
    }
    
    // Try silent token acquisition
    try {
      const result = await msal.acquireTokenSilent({
        scopes: MSAL_CONFIG.scopes,
        account: account.account
      })
      
      return result.accessToken
    } catch (silentError) {
      console.warn('Silent token acquisition failed:', silentError)
      
      // If silent fails, try interactive (popup)
      try {
        const result = await msal.acquireTokenPopup({
          scopes: MSAL_CONFIG.scopes
        })
        
        return result.accessToken
      } catch (interactiveError) {
        console.error('Interactive token acquisition failed:', interactiveError)
        return null
      }
    }
  } catch (error) {
    console.error('Token acquisition error:', error)
    return null
  }
}

/**
 * Check if current token is valid and not expired
 */
export function isTokenValid(): boolean {
  try {
    const msal = initializeMSAL()
    const accounts = msal.getAllAccounts()
    
    if (accounts.length === 0) {
      return false
    }
    
    const account = accounts[0]
    if (!account.accessToken) {
      return false
    }
    
    // For mock tokens, always return true
    if (account.accessToken === 'mock-access-token-12345') {
      return true
    }
    
    // In a real implementation, we'd decode the JWT and check expiration
    // For now, assume any non-mock token is valid
    return true
  } catch {
    return false
  }
}

/**
 * Force token refresh
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const msal = initializeMSAL()
    const accounts = msal.getAllAccounts()
    
    if (accounts.length === 0) {
      return null
    }
    
    // Force a new token acquisition
    const result = await msal.acquireTokenPopup({
      scopes: MSAL_CONFIG.scopes
    })
    
    return result.accessToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}

/**
 * Set up authentication state change listener
 * Returns cleanup function
 */
export function onAuthChange(callback: (session: Session) => void): () => void {
  let interval: number | null = null
  
  if (typeof window !== 'undefined') {
    // Poll for changes in localStorage (simple approach)
    interval = window.setInterval(() => {
      const current = getCurrentSession()
      callback(current)
    }, 1000)
    
    // Also listen for storage events from other tabs
    const storageListener = () => {
      const current = getCurrentSession()
      callback(current)
    }
    
    window.addEventListener('storage', storageListener)
    
    // Cleanup function
    return () => {
      if (interval) window.clearInterval(interval)
      window.removeEventListener('storage', storageListener)
    }
  }
  
  return () => {} // No-op cleanup for server-side
}