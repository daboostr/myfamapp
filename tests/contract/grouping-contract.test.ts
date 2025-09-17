/**
 * Contract test for grouping function behavior
 * Based on contracts/graph-integration.md grouping expectations
 */

import { describe, it, expect } from '@jest/globals'
import { groupBySharer, disambiguateDisplayNames } from '../../src/services/grouping'
import type { SharedImage, PeopleGrouping } from '../../src/models'

describe('Grouping Contract', () => {
  describe('groupBySharer', () => {
    it('should group items by sharer identifier when available', () => {
      const images: SharedImage[] = [
        {
          id: '1',
          name: 'photo1.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'John Doe', identifier: 'john.doe@example.com' },
          thumbnailUrl: null,
          dateShared: '2025-09-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'photo2.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'John Doe', identifier: 'john.doe@example.com' },
          thumbnailUrl: null,
          dateShared: '2025-09-15T11:00:00Z'
        },
        {
          id: '3',
          name: 'photo3.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'Jane Smith', identifier: 'jane.smith@example.com' },
          thumbnailUrl: null,
          dateShared: '2025-09-15T12:00:00Z'
        }
      ]

      const result: PeopleGrouping[] = groupBySharer(images)
      
      expect(result).toHaveLength(2)
      
      const johnGroup = result.find(g => g.person.identifier === 'john.doe@example.com')
      expect(johnGroup).toBeDefined()
      expect(johnGroup!.images).toHaveLength(2)
      
      const janeGroup = result.find(g => g.person.identifier === 'jane.smith@example.com')
      expect(janeGroup).toBeDefined()
      expect(janeGroup!.images).toHaveLength(1)
    })

    it('should fall back to displayName when identifier not available', () => {
      const images: SharedImage[] = [
        {
          id: '1',
          name: 'photo1.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'Anonymous User', identifier: '' },
          thumbnailUrl: null,
          dateShared: '2025-09-15T10:00:00Z'
        }
      ]

      const result: PeopleGrouping[] = groupBySharer(images)
      
      expect(result).toHaveLength(1)
      expect(result[0].person.displayName).toBe('Anonymous User')
    })

    it('should produce stable grouping keys', () => {
      const images: SharedImage[] = [
        {
          id: '1',
          name: 'photo1.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'Test User', identifier: 'test@example.com' },
          thumbnailUrl: null,
          dateShared: '2025-09-15T10:00:00Z'
        }
      ]

      const result1 = groupBySharer(images)
      const result2 = groupBySharer(images)
      
      expect(result1[0].person.identifier).toBe(result2[0].person.identifier)
      expect(result1[0].person.displayName).toBe(result2[0].person.displayName)
    })
  })

  describe('disambiguateDisplayNames', () => {
    it('should add identifier info when display names collide', () => {
      const groupings: PeopleGrouping[] = [
        {
          person: { displayName: 'John Smith', identifier: 'john.smith@company.com' },
          images: []
        },
        {
          person: { displayName: 'John Smith', identifier: 'john.smith@personal.com' },
          images: []
        },
        {
          person: { displayName: 'Jane Doe', identifier: 'jane.doe@example.com' },
          images: []
        }
      ]

      const result = disambiguateDisplayNames(groupings)
      
      const johnGroups = result.filter(g => g.person.displayName.includes('John Smith'))
      expect(johnGroups).toHaveLength(2)
      expect(johnGroups[0].person.displayName).toContain('@')
      expect(johnGroups[1].person.displayName).toContain('@')
      
      const janeGroup = result.find(g => g.person.displayName === 'Jane Doe')
      expect(janeGroup).toBeDefined()
      expect(janeGroup!.person.displayName).toBe('Jane Doe') // No disambiguation needed
    })
  })
})