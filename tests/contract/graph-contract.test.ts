/**
 * Contract test for external image item mapping
 * Based on contracts/graph-integration.md
 */

import { describe, it, expect } from '@jest/globals'
import { filterImagesByMime, mapToSharedImage } from '../../src/services/grouping'
import type { SharedImage } from '../../src/models'

describe('Graph Integration Contract', () => {
  describe('filterImagesByMime', () => {
    it('should include only items with image MIME types', () => {
      const items = [
        { id: '1', mimeType: 'image/jpeg', name: 'photo1.jpg' },
        { id: '2', mimeType: 'application/pdf', name: 'document.pdf' },
        { id: '3', mimeType: 'image/png', name: 'photo2.png' },
        { id: '4', mimeType: 'text/plain', name: 'notes.txt' },
        { id: '5', mimeType: 'image/webp', name: 'photo3.webp' }
      ]

      const result = filterImagesByMime(items)
      
      expect(result).toHaveLength(3)
      expect(result.map(item => item.id)).toEqual(['1', '3', '5'])
    })

    it('should return empty array when no image items', () => {
      const items = [
        { id: '1', mimeType: 'application/pdf', name: 'document.pdf' },
        { id: '2', mimeType: 'text/plain', name: 'notes.txt' }
      ]

      const result = filterImagesByMime(items)
      
      expect(result).toHaveLength(0)
    })
  })

  describe('mapToSharedImage', () => {
    it('should map external item to SharedImage with all required fields', () => {
      const externalItem = {
        id: 'item-123',
        name: 'vacation.jpg',
        mimeType: 'image/jpeg',
        sharedBy: {
          displayName: 'John Doe',
          identifier: 'john.doe@example.com'
        },
        preview: {
          thumbnailUrl: 'https://example.com/thumb.jpg'
        },
        dateShared: '2025-09-15T10:30:00Z'
      }

      const result: SharedImage = mapToSharedImage(externalItem)
      
      expect(result).toEqual({
        id: 'item-123',
        name: 'vacation.jpg',
        mimeType: 'image/jpeg',
        sharedBy: {
          displayName: 'John Doe',
          identifier: 'john.doe@example.com'
        },
        thumbnailUrl: 'https://example.com/thumb.jpg',
        dateShared: '2025-09-15T10:30:00Z'
      })
    })

    it('should handle missing thumbnail with null', () => {
      const externalItem = {
        id: 'item-456',
        name: 'photo.png',
        mimeType: 'image/png',
        sharedBy: {
          displayName: 'Jane Smith',
          identifier: 'jane.smith@example.com'
        },
        preview: {
          thumbnailUrl: null
        },
        dateShared: '2025-09-16T14:20:00Z'
      }

      const result: SharedImage = mapToSharedImage(externalItem)
      
      expect(result.thumbnailUrl).toBeNull()
      expect(result.id).toBe('item-456')
    })
  })
})