/**
 * E2E test for preview command functionality
 * Validates that npm run preview serves the static build properly
 */

import { test, expect } from '@playwright/test'
import { spawn, ChildProcess } from 'child_process'
import { promisify } from 'util'

const sleep = promisify(setTimeout)

test.describe('Preview Command', () => {
  let previewProcess: ChildProcess

  test.afterEach(async () => {
    // Clean up any running preview process
    if (previewProcess && !previewProcess.killed) {
      previewProcess.kill()
    }
  })

  test('should serve static build when running npm run preview', async ({ page }) => {
    // Start the preview server
    previewProcess = spawn('npm', ['run', 'preview'], {
      cwd: process.cwd(),
      detached: false
    })

    // Wait for server to start
    await sleep(3000)

    // Navigate to the served page
    await page.goto('http://localhost:3000')
    
    // Verify the page loads correctly
    await expect(page).toHaveTitle(/OneDrive Photo Gallery/i)
    
    // Check that static assets are served
    const favicon = page.locator('link[rel="icon"]')
    await expect(favicon).toHaveAttribute('href', '/favicon.svg')
    
    // Verify main content structure is present
    const main = page.getByRole('main')
    await expect(main).toBeVisible()
  })

  test('should serve 404 page for unknown routes', async ({ page }) => {
    // Start the preview server  
    previewProcess = spawn('npm', ['run', 'preview'], {
      cwd: process.cwd(),
      detached: false
    })

    // Wait for server to start
    await sleep(3000)

    // Navigate to non-existent page
    const response = await page.goto('http://localhost:3000/non-existent-page')
    
    // Should serve 404 page
    expect(response?.status()).toBe(404)
    
    // Should show 404 content
    await expect(page.getByText(/404/)).toBeVisible()
  })
})