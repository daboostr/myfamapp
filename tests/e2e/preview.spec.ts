/**
 * E2E test for image preview functionality
 * Validates clicking images opens preview with details
 */

import { test, expect } from '@playwright/test'

test.describe('Image Preview', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state with shared items
    await page.addInitScript(() => {
      localStorage.setItem('msal.account', JSON.stringify({
        account: { name: 'Test User', username: 'test@example.com' }
      }))

      ;(window as any).mockSharedItems = [
        {
          id: '1',
          name: 'vacation-photo.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'John Doe', identifier: 'john@example.com' },
          preview: { thumbnailUrl: 'https://example.com/thumb1.jpg' },
          dateShared: '2025-09-15T10:30:00Z'
        }
      ]
    })
  })

  test('should open preview dialog when image clicked', async ({ page }) => {
    await page.goto('/')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    const imageCard = gallery.getByRole('button').first() // Image as clickable
    
    await imageCard.click()
    
    // Preview dialog should open
    const dialog = page.getByRole('dialog', { name: /image preview/i })
    await expect(dialog).toBeVisible()
    
    // Should show image details
    await expect(dialog.getByText('vacation-photo.jpg')).toBeVisible()
    await expect(dialog.getByText('John Doe')).toBeVisible()
    await expect(dialog.getByText(/Sep.*15.*2025/)).toBeVisible() // Date formatted
  })

  test('should provide option to open in source application', async ({ page }) => {
    await page.goto('/')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await gallery.getByRole('button').first().click()
    
    const dialog = page.getByRole('dialog', { name: /image preview/i })
    const openExternalButton = dialog.getByRole('link', { name: /open.*source/i })
    
    await expect(openExternalButton).toBeVisible()
    await expect(openExternalButton).toHaveAttribute('target', '_blank')
    await expect(openExternalButton).toHaveAttribute('href', /.+/)
  })

  test('should close preview with Escape key', async ({ page }) => {
    await page.goto('/')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await gallery.getByRole('button').first().click()
    
    const dialog = page.getByRole('dialog', { name: /image preview/i })
    await expect(dialog).toBeVisible()
    
    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('should trap focus within dialog', async ({ page }) => {
    await page.goto('/')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await gallery.getByRole('button').first().click()
    
    const dialog = page.getByRole('dialog', { name: /image preview/i })
    
    // Focus should be trapped within dialog
    const closeButton = dialog.getByRole('button', { name: /close/i })
    const openExternalButton = dialog.getByRole('link', { name: /open.*source/i })
    
    // Tab through focusable elements
    await page.keyboard.press('Tab')
    await expect(openExternalButton).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(closeButton).toBeFocused()
    
    // Shift+Tab should go backwards
    await page.keyboard.press('Shift+Tab')
    await expect(openExternalButton).toBeFocused()
  })

  test('should handle missing thumbnail gracefully', async ({ page }) => {
    // Mock item with no thumbnail
    await page.addInitScript(() => {
      ;(window as any).mockSharedItems = [
        {
          id: '1',
          name: 'no-thumb.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'Jane Smith', identifier: 'jane@example.com' },
          preview: { thumbnailUrl: null },
          dateShared: '2025-09-16T14:20:00Z'
        }
      ]
    })

    await page.goto('/')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    
    // Should show placeholder for missing thumbnail
    const placeholder = gallery.getByText(/no preview available/i)
    await expect(placeholder).toBeVisible()
    
    // Should still be clickable
    await gallery.getByRole('button').first().click()
    
    const dialog = page.getByRole('dialog', { name: /image preview/i })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('no-thumb.jpg')).toBeVisible()
  })
})