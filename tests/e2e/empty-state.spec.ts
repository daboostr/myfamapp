/**
 * E2E test for empty state when no shared images
 * Validates appropriate messaging and guidance
 */

import { test, expect } from '@playwright/test'

test.describe('Empty State', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state but no shared items
    await page.addInitScript(() => {
      localStorage.setItem('msal.account', JSON.stringify({
        account: { name: 'Test User', username: 'test@example.com' }
      }))

      // Empty shared items
      ;(window as any).mockSharedItems = []
    })
  })

  test('should show friendly empty state when no shared images', async ({ page }) => {
    await page.goto('/')
    
    // Should show empty state in gallery
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await expect(gallery.getByText(/no shared photos/i)).toBeVisible()
    
    // Should provide helpful guidance
    await expect(gallery.getByText(/ask someone to share/i)).toBeVisible()
    
    // People panel should also indicate empty state
    const peoplePanel = page.getByRole('complementary', { name: /people/i })
    await expect(peoplePanel.getByText(/no people/i)).toBeVisible()
  })

  test('should not show image grid when empty', async ({ page }) => {
    await page.goto('/')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    
    // Should not have any image elements
    const images = gallery.getByRole('img')
    await expect(images).toHaveCount(0)
    
    // Should not have image cards/buttons
    const imageButtons = gallery.getByRole('button')
    await expect(imageButtons).toHaveCount(0)
  })

  test('should maintain proper heading structure in empty state', async ({ page }) => {
    await page.goto('/')
    
    // Should still have proper heading hierarchy
    await expect(page.getByRole('heading', { name: /onedrive photo gallery/i, level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: /people/i, level: 2 })).toBeVisible()
    
    // Gallery heading should be present but visually hidden (for screen readers)
    const galleryHeading = page.getByRole('heading', { name: /photo gallery/i, level: 2 })
    await expect(galleryHeading).toBeInViewport() // Should exist
  })

  test('should be accessible with proper ARIA live region', async ({ page }) => {
    await page.goto('/')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    
    // Empty state message should be announced to screen readers
    const emptyMessage = gallery.getByText(/no shared photos/i)
    await expect(emptyMessage).toHaveAttribute('role', 'status')
  })

  test('should transition properly when items are loaded', async ({ page }) => {
    await page.goto('/')
    
    // Initially empty
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await expect(gallery.getByText(/no shared photos/i)).toBeVisible()
    
    // Simulate loading data (would happen via API call)
    await page.evaluate(() => {
      ;(window as any).mockSharedItems = [
        {
          id: '1',
          name: 'new-photo.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'Friend', identifier: 'friend@example.com' },
          preview: { thumbnailUrl: 'https://example.com/thumb.jpg' },
          dateShared: '2025-09-16T15:00:00Z'
        }
      ]
      
      // Trigger re-render (would be done by state management)
      window.dispatchEvent(new CustomEvent('dataLoaded'))
    })
    
    // Empty state should be gone, images should appear
    await expect(gallery.getByText(/no shared photos/i)).not.toBeVisible()
    await expect(gallery.getByRole('img')).toHaveCount(1)
    
    // People panel should update too
    const peoplePanel = page.getByRole('complementary', { name: /people/i })
    await expect(peoplePanel.getByText('Friend')).toBeVisible()
  })
})