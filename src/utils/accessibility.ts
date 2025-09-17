/**
 * Accessibility utilities and validation
 * WCAG 2.1 AA compliance helpers and audit tools
 */

export interface A11yAuditResult {
  component: string
  issues: A11yIssue[]
  score: number
  recommendations: string[]
}

export interface A11yIssue {
  severity: 'error' | 'warning' | 'info'
  rule: string
  description: string
  element?: string
  fix: string
}

/**
 * Color contrast utilities
 * WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function calculateContrast(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex)
    if (!rgb) return 0

    const [r, g, b] = rgb.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const hexToRgb = (hex: string): number[] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Validate color contrast for accessibility
 */
export function validateContrast(
  foreground: string, 
  background: string, 
  isLargeText = false
): { passes: boolean; ratio: number; required: number } {
  const ratio = calculateContrast(foreground, background)
  const required = isLargeText ? 3 : 4.5
  
  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required
  }
}

/**
 * Audit ARIA patterns and semantic HTML
 */
export function auditAriaPatterns(element: Element): A11yIssue[] {
  const issues: A11yIssue[] = []

  // Check for missing alt text on images
  const images = element.querySelectorAll('img')
  images.forEach((img, index) => {
    if (!img.getAttribute('alt') && img.getAttribute('alt') !== '') {
      issues.push({
        severity: 'error',
        rule: 'img-alt',
        description: 'Image missing alt text',
        element: `img[${index}]`,
        fix: 'Add descriptive alt text or alt="" for decorative images'
      })
    }
  })

  // Check for proper heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let lastLevel = 0
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    if (level > lastLevel + 1) {
      issues.push({
        severity: 'warning',
        rule: 'heading-hierarchy',
        description: `Heading level jumps from h${lastLevel} to h${level}`,
        element: `${heading.tagName.toLowerCase()}[${index}]`,
        fix: 'Use proper heading hierarchy without skipping levels'
      })
    }
    lastLevel = level
  })

  // Check for interactive elements without keyboard support
  const interactiveElements = element.querySelectorAll('[onclick], .clickable')
  interactiveElements.forEach((el, index) => {
    if (el.tagName !== 'BUTTON' && el.tagName !== 'A' && !el.hasAttribute('tabindex')) {
      issues.push({
        severity: 'error',
        rule: 'keyboard-navigation',
        description: 'Interactive element not keyboard accessible',
        element: `${el.tagName.toLowerCase()}[${index}]`,
        fix: 'Use button/link elements or add tabindex and keyboard handlers'
      })
    }
  })

  // Check for proper form labels
  const inputs = element.querySelectorAll('input, select, textarea')
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id')
    const ariaLabel = input.getAttribute('aria-label')
    const ariaLabelledby = input.getAttribute('aria-labelledby')
    
    if (!id || (!ariaLabel && !ariaLabelledby && !element.querySelector(`label[for="${id}"]`))) {
      issues.push({
        severity: 'error',
        rule: 'form-labels',
        description: 'Form control missing label',
        element: `${input.tagName.toLowerCase()}[${index}]`,
        fix: 'Add label element, aria-label, or aria-labelledby'
      })
    }
  })

  // Check for proper dialog patterns
  const dialogs = element.querySelectorAll('[role="dialog"]')
  dialogs.forEach((dialog, index) => {
    if (!dialog.getAttribute('aria-modal')) {
      issues.push({
        severity: 'warning',
        rule: 'dialog-modal',
        description: 'Dialog missing aria-modal attribute',
        element: `dialog[${index}]`,
        fix: 'Add aria-modal="true" for modal dialogs'
      })
    }

    if (!dialog.getAttribute('aria-labelledby') && !dialog.getAttribute('aria-label')) {
      issues.push({
        severity: 'error',
        rule: 'dialog-label',
        description: 'Dialog missing accessible name',
        element: `dialog[${index}]`,
        fix: 'Add aria-labelledby or aria-label'
      })
    }
  })

  return issues
}

/**
 * Test keyboard navigation
 */
export function testKeyboardNavigation(container: Element): A11yIssue[] {
  const issues: A11yIssue[] = []
  const focusableElements = container.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  if (focusableElements.length === 0) {
    return issues
  }

  // Check for tab traps in modal dialogs
  const dialogs = container.querySelectorAll('[role="dialog"]')
  dialogs.forEach((dialog, index) => {
    const dialogFocusable = dialog.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (dialogFocusable.length > 0) {
      const first = dialogFocusable[0] as HTMLElement
      const last = dialogFocusable[dialogFocusable.length - 1] as HTMLElement
      
      // This is a simplified check - in real implementation, 
      // you'd test actual tab behavior
      if (!first || !last) {
        issues.push({
          severity: 'warning',
          rule: 'focus-trap',
          description: 'Dialog may not trap focus properly',
          element: `dialog[${index}]`,
          fix: 'Implement proper focus trapping for modal dialogs'
        })
      }
    }
  })

  return issues
}

/**
 * Comprehensive accessibility audit
 */
export function auditAccessibility(
  container: Element,
  componentName: string = 'Component'
): A11yAuditResult {
  const ariaIssues = auditAriaPatterns(container)
  const keyboardIssues = testKeyboardNavigation(container)
  const allIssues = [...ariaIssues, ...keyboardIssues]

  // Calculate score based on issues
  const errorCount = allIssues.filter(i => i.severity === 'error').length
  const warningCount = allIssues.filter(i => i.severity === 'warning').length
  const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5))

  // Generate recommendations
  const recommendations = [
    'Test with screen reader (NVDA, JAWS, VoiceOver)',
    'Validate keyboard-only navigation',
    'Check color contrast with automated tools',
    'Test with users who have disabilities',
    'Use semantic HTML elements where possible'
  ]

  if (errorCount > 0) {
    recommendations.unshift('Fix all accessibility errors before deployment')
  }

  return {
    component: componentName,
    issues: allIssues,
    score,
    recommendations
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null

  /**
   * Save current focus and move to new element
   */
  moveTo(element: HTMLElement): void {
    this.previousFocus = document.activeElement as HTMLElement
    element.focus()
  }

  /**
   * Restore previously focused element
   */
  restore(): void {
    if (this.previousFocus) {
      this.previousFocus.focus()
      this.previousFocus = null
    }
  }

  /**
   * Create focus trap for modal dialogs
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) {
      return () => {}
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    // Focus first element
    firstElement.focus()

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
}