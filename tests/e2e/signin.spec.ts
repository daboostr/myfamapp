/**
 * E2E test for sign-in flow
 * Validates user can sign in and return to signed-in state
 */

import { test, expect } from '@playwright/test'

test.describe('Sign-in Flow', () => {
  test('should display sign-in button when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Should see sign-in button
    const signInButton = page.getByRole('button', { name: /sign in/i })
    await expect(signInButton).toBeVisible()
    
    // Should see empty state message
    await expect(page.getByText(/sign in with your microsoft account/i)).toBeVisible()
  })

  test('should redirect to Microsoft auth when sign-in clicked', async ({ page }) => {
    await page.goto('/')
    
    // Mock the auth redirect since we can't actually auth in E2E
    await page.route('**/oauth2/**', async route => {
      await route.fulfill({
        status: 302,
        headers: { 'Location': '/?code=mock_auth_code' }
      })
    })
    
    const signInButton = page.getByRole('button', { name: /sign in/i })
    await signInButton.click()
    
    // Should attempt to navigate to auth (mocked above)
    // In real scenario, would redirect to Microsoft OAuth
    await expect(page).toHaveURL(/\/\?code=/)
  })

  test('should show signed-in state after successful auth', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      // Mock localStorage auth token
      localStorage.setItem('msal.account', JSON.stringify({
        account: { name: 'Test User', username: 'test@example.com' }
      }))
    })

    await page.goto('/')
    
    // Should see sign-out instead of sign-in
    const signOutButton = page.getByRole('button', { name: /sign out/i })
    await expect(signOutButton).toBeVisible()
    
    // Should not see the empty state message
    await expect(page.getByText(/sign in with your microsoft account/i)).not.toBeVisible()
  })

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/')
    
    // Tab to sign-in button
    await page.keyboard.press('Tab')
    const signInButton = page.getByRole('button', { name: /sign in/i })
    await expect(signInButton).toBeFocused()
    
    // Should have visible focus indicator
    await expect(signInButton).toHaveCSS('outline', /.*solid.*/)
  })
})