/**
 * E2E test for error handling
 * Validates error states and user feedback
 */

import { test, expect } from '@playwright/test'

test.describe('Error Handling', () => {
  test('should handle authentication failure gracefully', async ({ page }) => {
    // Mock auth failure
    await page.addInitScript(() => {
      ;(window as any).mockAuthError = 'Authentication failed'
    })

    await page.goto('/')
    
    // Should show error message
    const errorAlert = page.getByRole('alert')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toContainText(/authentication.*failed/i)
    
    // Should provide retry option
    const retryButton = page.getByRole('button', { name: /retry.*sign.*in/i })
    await expect(retryButton).toBeVisible()
  })

  test('should handle API failure when loading shared items', async ({ page }) => {
    // Mock authenticated state but API failure
    await page.addInitScript(() => {
      localStorage.setItem('msal.account', JSON.stringify({
        account: { name: 'Test User', username: 'test@example.com' }
      }))

      ;(window as any).mockApiError = 'Failed to load shared items'
    })

    await page.goto('/')
    
    // Should show error in gallery area
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await expect(gallery.getByText(/failed.*load/i)).toBeVisible()
    
    // Should provide refresh option
    const refreshButton = gallery.getByRole('button', { name: /refresh.*try.*again/i })
    await expect(refreshButton).toBeVisible()
  })

  test('should handle network connectivity issues', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('msal.account', JSON.stringify({
        account: { name: 'Test User', username: 'test@example.com' }
      }))
    })

    // Simulate network failure
    await page.route('**/me/drive/sharedWithMe', route => {
      route.abort('failed')
    })

    await page.goto('/')
    
    // Should show connectivity error
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await expect(gallery.getByText(/connection.*problem/i)).toBeVisible()
    
    // Error should be announced to screen readers
    const errorMessage = gallery.getByRole('status')
    await expect(errorMessage).toBeVisible()
  })

  test('should handle thumbnail loading failures', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('msal.account', JSON.stringify({
        account: { name: 'Test User', username: 'test@example.com' }
      }))

      ;(window as any).mockSharedItems = [
        {
          id: '1',
          name: 'broken-image.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'John Doe', identifier: 'john@example.com' },
          preview: { thumbnailUrl: 'https://invalid-url.com/broken.jpg' },
          dateShared: '2025-09-15T10:30:00Z'
        }
      ]
    })

    await page.goto('/')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    
    // Mock image load error
    await page.evaluate(() => {
      const img = document.querySelector('img')
      if (img) {
        img.dispatchEvent(new Event('error'))
      }
    })
    
    // Should show fallback placeholder
    await expect(gallery.getByText(/image.*unavailable/i)).toBeVisible()
    
    // Should still show file name and metadata
    await expect(gallery.getByText('broken-image.jpg')).toBeVisible()
    await expect(gallery.getByText('John Doe')).toBeVisible()
  })

  test('should handle permission denied errors', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('msal.account', JSON.stringify({
        account: { name: 'Test User', username: 'test@example.com' }
      }))

      ;(window as any).mockPermissionError = 'Insufficient permissions'
    })

    await page.goto('/')
    
    // Should show permission error
    const errorAlert = page.getByRole('alert')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toContainText(/permission/i)
    
    // Should suggest contacting admin or checking account
    await expect(errorAlert).toContainText(/contact.*administrator|check.*account/i)
  })

  test('should provide accessible error messages', async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as any).mockAuthError = 'Network timeout'
    })

    await page.goto('/')
    
    const errorAlert = page.getByRole('alert')
    
    // Error should be properly labeled
    await expect(errorAlert).toHaveAttribute('role', 'alert')
    
    // Should have appropriate ARIA live region
    await expect(errorAlert).toHaveAttribute('aria-live', 'assertive')
    
    // Should be keyboard accessible
    await page.keyboard.press('Tab')
    const retryButton = page.getByRole('button', { name: /retry/i })
    await expect(retryButton).toBeFocused()
  })

  test('should clear errors after successful retry', async ({ page }) => {
    // Start with error state
    await page.addInitScript(() => {
      ;(window as any).mockApiError = 'Temporary failure'
      ;(window as any).retryCount = 0
    })

    await page.goto('/')
    
    const gallery = page.getByRole('main').getByRole('region', { name: /gallery/i })
    await expect(gallery.getByText(/temporary.*failure/i)).toBeVisible()
    
    const refreshButton = gallery.getByRole('button', { name: /refresh/i })
    
    // Simulate successful retry
    await page.evaluate(() => {
      delete (window as any).mockApiError
      ;(window as any).mockSharedItems = [
        {
          id: '1',
          name: 'success.jpg',
          mimeType: 'image/jpeg',
          sharedBy: { displayName: 'Jane', identifier: 'jane@example.com' },
          preview: { thumbnailUrl: 'https://example.com/success.jpg' },
          dateShared: '2025-09-16T16:00:00Z'
        }
      ]
    })
    
    await refreshButton.click()
    
    // Error should be cleared
    await expect(gallery.getByText(/temporary.*failure/i)).not.toBeVisible()
    
    // Content should be shown
    await expect(gallery.getByText('success.jpg')).toBeVisible()
  })
})