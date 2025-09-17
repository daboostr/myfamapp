/**
 * Data grouping and transformation utilities
 * Implements logic tested in grouping-contract.test.ts
 */

import {
  SharedImage,
  Person,
  PeopleGrouping,
  GalleryItem,
  GraphDriveItem,
  isImageMimeType,
  hasValidSharer,
  hasValidPreview
} from '../models'

/**
 * Filter items to only include valid images
 * Contract: Only includes items with image/* MIME type
 */
export function filterImagesByMime(items: GraphDriveItem[]): GraphDriveItem[] {
  return items.filter(item => 
    item.file?.mimeType && isImageMimeType(item.file.mimeType)
  )
}

/**
 * Transform Graph API item to SharedImage model
 * Contract: Handles missing thumbnails gracefully
 */
export function mapToSharedImage(item: GraphDriveItem): SharedImage | null {
  // Validate required fields
  if (!item.name || !item.file?.mimeType || !hasValidSharer(item)) {
    return null
  }

  const sharer = item.sharedBy!.user!
  const identifier = sharer.email || sharer.id
  
  return {
    id: item.id,
    name: item.name,
    mimeType: item.file.mimeType,
    sharedBy: {
      displayName: sharer.displayName,
      identifier
    },
    preview: {
      thumbnailUrl: hasValidPreview(item) 
        ? item.thumbnails![0].medium!.url 
        : null
    },
    dateShared: item.shared?.sharedDateTime || new Date().toISOString(),
    webUrl: item.webUrl
  }
}

/**
 * Group images by person who shared them
 * Contract: Stable grouping keys, disambiguates duplicate display names
 */
export function groupBySharer(images: SharedImage[]): PeopleGrouping[] {
  // Group by identifier (email/id) - stable key
  const groups = new Map<string, SharedImage[]>()
  
  for (const image of images) {
    const identifier = image.sharedBy.identifier
    if (!groups.has(identifier)) {
      groups.set(identifier, [])
    }
    groups.get(identifier)!.push(image)
  }
  
  // Convert to PeopleGrouping array
  const groupings: PeopleGrouping[] = []
  
  groups.forEach((groupImages, identifier) => {
    // Use first image's sharer info as representative
    const firstImage = groupImages[0]
    
    const person: Person = {
      identifier,
      displayName: firstImage.sharedBy.displayName,
      imageCount: groupImages.length
    }
    
    groupings.push({
      person,
      images: groupImages
    })
  })
  
  // Sort by display name for consistent ordering
  return groupings.sort((a, b) => 
    a.person.displayName.localeCompare(b.person.displayName)
  )
}

/**
 * Handle duplicate display names by showing identifier
 * Contract: Disambiguates when multiple people have same display name
 */
export function disambiguateDisplayNames(groupings: PeopleGrouping[]): PeopleGrouping[] {
  // Find duplicate display names
  const nameCount = new Map<string, number>()
  
  for (const group of groupings) {
    const name = group.person.displayName
    nameCount.set(name, (nameCount.get(name) || 0) + 1)
  }
  
  // Add identifier suffix for duplicates
  return groupings.map(group => {
    const { person } = group
    const isDuplicate = nameCount.get(person.displayName)! > 1
    
    if (isDuplicate) {
      return {
        ...group,
        person: {
          ...person,
          displayName: `${person.displayName} (${person.identifier})`
        }
      }
    }
    
    return group
  })
}

/**
 * Convert SharedImage to GalleryItem for UI display
 * Contract: Provides accessibility and fallback handling
 */
export function toGalleryItem(image: SharedImage): GalleryItem {
  const hasThumbnail = !!image.preview.thumbnailUrl
  
  return {
    image,
    altText: `${image.name} shared by ${image.sharedBy.displayName}`,
    hasThumbnail,
    placeholder: hasThumbnail ? '' : 'No preview available'
  }
}

/**
 * Full processing pipeline from Graph API to UI-ready data
 * Combines all transformation steps with error handling
 */
export function processGraphItems(rawItems: GraphDriveItem[]): {
  groupings: PeopleGrouping[]
  allPeople: Person[]
  totalImages: number
  errors: string[]
} {
  const errors: string[] = []
  
  try {
    // Filter to image files only
    const imageItems = filterImagesByMime(rawItems)
    
    // Transform to SharedImage models
    const sharedImages: SharedImage[] = []
    
    for (const item of imageItems) {
      const mapped = mapToSharedImage(item)
      if (mapped) {
        sharedImages.push(mapped)
      } else {
        errors.push(`Failed to process item: ${item.id}`)
      }
    }
    
    // Group by sharer
    const rawGroupings = groupBySharer(sharedImages)
    
    // Disambiguate duplicate names
    const groupings = disambiguateDisplayNames(rawGroupings)
    
    // Extract people list
    const allPeople = groupings.map(g => g.person)
    
    return {
      groupings,
      allPeople,
      totalImages: sharedImages.length,
      errors
    }
    
  } catch (error) {
    errors.push(`Processing failed: ${error}`)
    return {
      groupings: [],
      allPeople: [],
      totalImages: 0,
      errors
    }
  }
}