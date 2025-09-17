/**
 * E2E test for people panel functionality
 * Validates people list and gallery interaction
 */

import { test, expect } from '@playwright/test'

test.describe('People Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state with shared items
    await page.addInitScript(() => {
      localStorage.setItem('msal.account', JSON.stringify({
        account: { name: 'Test User', username: 'test@example.com' }
      }))

      // Mock shared items data
      ;(window as any).mockSharedItems = [
        {
          id: '1',
          name: 'vacation1.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'John Doe', identifier: 'john@example.com' },
          preview: { thumbnailUrl: 'https://example.com/thumb1.jpg' },
          dateShared: '2025-09-15T10:00:00Z'
        },
        {
          id: '2', 
          name: 'vacation2.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'John Doe', identifier: 'john@example.com' },
          preview: { thumbnailUrl: 'https://example.com/thumb2.jpg' },
          dateShared: '2025-09-15T11:00:00Z'
        },
        {
          id: '3',
          name: 'family.png',
          mimeType: 'image/png', 
          sharedBy: { displayName: 'Jane Smith', identifier: 'jane@example.com' },
          preview: { thumbnailUrl: 'https://example.com/thumb3.jpg' },
          dateShared: '2025-09-16T09:00:00Z'
        }
      ]
    })
  })

  test('should list distinct people who shared items', async ({ page }) => {
    await page.goto('/')
    
    // Should see people panel
    const peoplePanel = page.getByRole('complementary', { name: /people/i })
    await expect(peoplePanel).toBeVisible()
    
    // Should list John Doe and Jane Smith
    await expect(peoplePanel.getByText('John Doe')).toBeVisible()
    await expect(peoplePanel.getByText('Jane Smith')).toBeVisible()
    
    // Should show image counts
    await expect(peoplePanel.getByText('2', { exact: true })).toBeVisible() // John's count
    await expect(peoplePanel.getByText('1', { exact: true })).toBeVisible() // Jane's count
  })

  test('should show gallery for selected person', async ({ page }) => {
    await page.goto('/')
    
    // John should be selected by default (first person)
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await expect(gallery).toBeVisible()
    
    // Should show John's 2 images
    const images = gallery.getByRole('img')
    await expect(images).toHaveCount(2)
    
    // Should show image names
    await expect(gallery.getByText('vacation1.jpg')).toBeVisible()
    await expect(gallery.getByText('vacation2.jpg')).toBeVisible()
  })

  test('should update gallery when different person selected', async ({ page }) => {
    await page.goto('/')
    
    const peoplePanel = page.getByRole('complementary', { name: /people/i })
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    
    // Initially shows John's images (2)
    await expect(gallery.getByRole('img')).toHaveCount(2)
    
    // Click Jane Smith
    await peoplePanel.getByText('Jane Smith').click()
    
    // Gallery should update to show Jane's images (1)
    await expect(gallery.getByRole('img')).toHaveCount(1)
    await expect(gallery.getByText('family.png')).toBeVisible()
    
    // Should not show John's images anymore
    await expect(gallery.getByText('vacation1.jpg')).not.toBeVisible()
  })

  test('should be accessible with proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    // People panel should have proper role and label
    const peoplePanel = page.getByRole('complementary', { name: /people/i })
    await expect(peoplePanel).toBeVisible()
    
    // Gallery should have proper role and label
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await expect(gallery).toBeVisible()
    
    // Images should have alt text
    const images = gallery.getByRole('img')
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i)
      await expect(img).toHaveAttribute('alt', /.+/)
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    const peoplePanel = page.getByRole('complementary', { name: /people/i })
    
    // Tab to people panel
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // Past sign out button
    
    // Should be able to arrow key between people
    await expect(peoplePanel.getByText('John Doe')).toBeFocused()
    
    await page.keyboard.press('ArrowDown')
    await expect(peoplePanel.getByText('Jane Smith')).toBeFocused()
    
    // Enter should select the person
    await page.keyboard.press('Enter')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await expect(gallery.getByText('family.png')).toBeVisible()
  })
})