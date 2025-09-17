/**
 * Performance monitoring utilities
 * Tracks bundle size, load times, and Core Web Vitals
 */

export interface PerformanceMetrics {
  bundleSize: number
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
}

/**
 * Get current bundle size estimation
 * Based on main chunks loaded
 */
export function getBundleSize(): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(0)
      return
    }

    // Get all script tags
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    let loadedCount = 0

    if (scripts.length === 0) {
      resolve(0)
      return
    }

    scripts.forEach(async (script) => {
      try {
        const src = (script as HTMLScriptElement).src
        if (src.includes('_next/static') || src.includes('chunks')) {
          const response = await fetch(src, { method: 'HEAD' })
          const size = parseInt(response.headers.get('content-length') || '0', 10)
          totalSize += size
        }
      } catch (error) {
        console.warn('Could not fetch script size:', error)
      } finally {
        loadedCount++
        if (loadedCount === scripts.length) {
          resolve(totalSize)
        }
      }
    })
  })
}

/**
 * Monitor Core Web Vitals
 * Implements web-vitals library patterns
 */
export function getWebVitals(): Promise<Partial<PerformanceMetrics>> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.performance) {
      resolve({})
      return
    }

    const metrics: Partial<PerformanceMetrics> = {}

    // First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcpEntry) {
      metrics.firstContentfulPaint = fcpEntry.startTime
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          metrics.largestContentfulPaint = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let cls = 0
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              cls += entry.value
            }
          })
          metrics.cumulativeLayoutShift = cls
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            metrics.firstInputDelay = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Resolve after a short delay to collect metrics
        setTimeout(() => {
          resolve(metrics)
        }, 2000)
      } catch (error) {
        console.warn('Performance observer not supported:', error)
        resolve(metrics)
      }
    } else {
      resolve(metrics)
    }
  })
}

/**
 * Check if bundle size meets requirements
 * Target: <100KB for main bundle
 */
export function validateBundleSize(sizeBytes: number): {
  isValid: boolean
  sizeMB: number
  sizeKB: number
  message: string
} {
  const sizeKB = Math.round(sizeBytes / 1024)
  const sizeMB = Math.round(sizeBytes / (1024 * 1024) * 100) / 100
  const isValid = sizeKB < 100

  return {
    isValid,
    sizeMB,
    sizeKB,
    message: isValid 
      ? `✅ Bundle size ${sizeKB}KB is within 100KB limit`
      : `⚠️ Bundle size ${sizeKB}KB exceeds 100KB limit`
  }
}

/**
 * Performance monitoring component
 * Logs metrics to console in development
 */
export function monitorPerformance(): void {
  if (typeof window === 'undefined') return

  // Monitor bundle size
  getBundleSize().then(size => {
    const validation = validateBundleSize(size)
    console.group('📊 Bundle Size Analysis')
    console.log(validation.message)
    console.log(`Size: ${validation.sizeKB}KB (${validation.sizeMB}MB)`)
    console.groupEnd()
  })

  // Monitor Core Web Vitals
  getWebVitals().then(metrics => {
    console.group('🚀 Core Web Vitals')
    
    if (metrics.firstContentfulPaint) {
      console.log(`FCP: ${Math.round(metrics.firstContentfulPaint)}ms`)
    }
    
    if (metrics.largestContentfulPaint) {
      const lcp = Math.round(metrics.largestContentfulPaint)
      const lcpStatus = lcp < 2500 ? '✅' : lcp < 4000 ? '⚠️' : '❌'
      console.log(`LCP: ${lcp}ms ${lcpStatus}`)
    }
    
    if (metrics.cumulativeLayoutShift !== undefined) {
      const cls = Math.round(metrics.cumulativeLayoutShift * 1000) / 1000
      const clsStatus = cls < 0.1 ? '✅' : cls < 0.25 ? '⚠️' : '❌'
      console.log(`CLS: ${cls} ${clsStatus}`)
    }
    
    if (metrics.firstInputDelay) {
      const fid = Math.round(metrics.firstInputDelay)
      const fidStatus = fid < 100 ? '✅' : fid < 300 ? '⚠️' : '❌'
      console.log(`FID: ${fid}ms ${fidStatus}`)
    }
    
    console.groupEnd()
  })
}