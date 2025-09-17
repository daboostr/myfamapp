/**
 * useIntersectionObserver hook - lazy loading and viewport visibility
 * Implements intersection observer API for performance optimization
 */

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  triggerOnce?: boolean
}

interface UseIntersectionObserverResult {
  ref: React.RefObject<HTMLElement>
  isIntersecting: boolean
  hasIntersected: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '50px',
    triggerOnce = true
  } = options

  const ref = useRef<HTMLElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check if IntersectionObserver is available (browser support)
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: assume element is always visible
      setIsIntersecting(true)
      setHasIntersected(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting

        setIsIntersecting(isElementIntersecting)
        
        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true)
          
          // If triggerOnce is true, unobserve after first intersection
          if (triggerOnce) {
            observer.unobserve(element)
          }
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, root, rootMargin, triggerOnce, hasIntersected])

  return {
    ref,
    isIntersecting,
    hasIntersected
  }
}

// Hook for lazy loading images specifically
export function useLazyImage(src: string) {
  const { ref, hasIntersected } = useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '100px' // Start loading 100px before element enters viewport
  })

  return {
    ref,
    src: hasIntersected ? src : undefined,
    shouldLoad: hasIntersected
  }
}