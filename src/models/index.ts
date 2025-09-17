/**
 * Data models for OneDrive photo sharing app
 * Based on data-model.md and contract test requirements
 */

/**
 * Represents a person who has shared images
 */
export interface Person {
  /** Unique identifier (email/UPN) */
  identifier: string
  /** Display name for UI */
  displayName: string
  /** Number of shared images from this person */
  imageCount: number
}

/**
 * Represents a shared image from OneDrive/SharePoint
 */
export interface SharedImage {
  /** Unique item ID from Graph API */
  id: string
  /** File name with extension */
  name: string
  /** MIME type (must be image/*) */
  mimeType: string
  /** Person who shared this image */
  sharedBy: {
    displayName: string
    identifier: string
  }
  /** Preview/thumbnail information */
  preview: {
    thumbnailUrl: string | null
  }
  /** When this item was shared (ISO 8601) */
  dateShared: string
  /** Direct URL to open in source application */
  webUrl?: string
}

/**
 * Grouping of images by the person who shared them
 */
export interface PeopleGrouping {
  /** The person who shared these images */
  person: Person
  /** Images shared by this person */
  images: SharedImage[]
}

/**
 * User session and authentication state
 */
export interface Session {
  /** Whether user is authenticated */
  isAuthenticated: boolean
  /** User account information (when authenticated) */
  account: {
    name: string
    username: string
  } | null
  /** Current authentication token (when authenticated) */
  accessToken: string | null
  /** Error state if authentication failed */
  error: string | null
}

/**
 * Gallery item for UI display
 * Optimized for rendering performance
 */
export interface GalleryItem {
  /** Original shared image */
  image: SharedImage
  /** Alt text for accessibility */
  altText: string
  /** Whether thumbnail is available */
  hasThumbnail: boolean
  /** Fallback placeholder when no thumbnail */
  placeholder: string
}

/**
 * Application state for selected person and filtered images
 */
export interface SelectionState {
  /** Currently selected person (null = all people) */
  selectedPerson: Person | null
  /** Images to display in gallery (filtered by selection) */
  displayImages: SharedImage[]
  /** All available people */
  availablePeople: Person[]
  /** Loading states */
  isLoading: boolean
  /** Error states */
  error: string | null
}

/**
 * Raw Graph API response types for mapping
 */
export interface GraphDriveItem {
  id: string
  name: string
  file?: {
    mimeType: string
  }
  sharedBy?: {
    user?: {
      displayName: string
      id: string
      email?: string
    }
  }
  shared?: {
    sharedDateTime: string
  }
  thumbnails?: Array<{
    small?: {
      url: string
    }
    medium?: {
      url: string
    }
    large?: {
      url: string
    }
  }>
  webUrl?: string
}

/**
 * Type guards for runtime validation
 */
export const isImageMimeType = (mimeType: string): boolean => {
  return mimeType.startsWith('image/')
}

export const hasValidSharer = (item: GraphDriveItem): boolean => {
  return !!(
    item.sharedBy?.user?.displayName &&
    (item.sharedBy.user.id || item.sharedBy.user.email)
  )
}

export const hasValidPreview = (item: GraphDriveItem): boolean => {
  return !!(
    item.thumbnails &&
    item.thumbnails.length > 0 &&
    item.thumbnails[0].medium?.url
  )
}