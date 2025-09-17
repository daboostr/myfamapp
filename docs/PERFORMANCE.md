# Performance & Bundle Size Management

This document outlines the performance optimization strategy and bundle size management for the OneDrive Photo Gallery application.

## Performance Goals

- **Bundle Size**: Main JavaScript bundle ≤ 100KB
- **Core Web Vitals**: All metrics in "Good" range
  - LCP (Largest Contentful Paint) ≤ 2.5s
  - FID (First Input Delay) ≤ 100ms
  - CLS (Cumulative Layout Shift) ≤ 0.1
- **Accessibility**: WCAG 2.1 AA compliance

## Bundle Size Strategy

### Current Implementation

1. **Code Splitting**
   - Lazy loading for PreviewDialog component
   - Dynamic imports for non-critical features
   - Separate vendor bundles

2. **Tree Shaking**
   - Enabled in Next.js webpack configuration
   - ES modules for better dead code elimination
   - Selective imports from libraries

3. **Performance Monitoring**
   - Automated bundle size validation
   - CI/CD pipeline checks
   - Performance metrics tracking

### Bundle Analysis Commands

```bash
# Analyze bundle size and composition
npm run analyze

# Validate bundle size against limits
npm run validate:bundle

# Full performance validation
npm run validate:performance

# Complete validation suite
npm run validate:all
```

### Bundle Size Breakdown

| Component | Target Size | Implementation |
|-----------|-------------|----------------|
| Main Bundle | ≤ 100KB | Core app logic, state management |
| Vendor Bundle | Variable | React, MSAL, Fluent UI (code split) |
| Preview Dialog | Lazy loaded | Dynamic import, suspense boundary |
| Performance Utils | Development only | Excluded from production |

## Performance Optimizations

### 1. Image Loading

- **Lazy Loading**: Intersection Observer API
- **Responsive Images**: srcset and sizes attributes
- **Error Boundaries**: Graceful handling of image failures
- **Progressive Enhancement**: Placeholder → thumbnail → full image

```typescript
// Example: Lazy image loading hook
const { ref, src, shouldLoad } = useLazyImage(imageUrl)
```

### 2. Code Splitting

- **Route-based**: Automatic Next.js page splitting
- **Component-based**: React.lazy for heavy components
- **Feature-based**: Dynamic imports for optional features

```typescript
// Example: Lazy component loading
const PreviewDialogLazy = lazy(() => import('./PreviewDialog'))
```

### 3. Bundle Optimization

- **Tree Shaking**: Remove unused code
- **Minification**: SWC minifier (faster than Terser)
- **Compression**: Gzip/Brotli in production
- **Cache Optimization**: Long-term caching with hash filenames

## Monitoring & Validation

### Automated Checks

1. **Bundle Size Validation**
   - Runs on every build
   - Fails CI if limit exceeded
   - Generates detailed reports

2. **Performance Metrics**
   - Core Web Vitals tracking
   - Real User Monitoring (RUM)
   - Lighthouse CI integration

3. **Accessibility Audits**
   - WCAG 2.1 AA compliance
   - Keyboard navigation testing
   - Screen reader compatibility

### CI/CD Pipeline

The GitHub Actions workflow includes:

- Bundle size analysis and validation
- Performance metric collection
- Lighthouse audits
- Automated PR comments with size impact

### Performance Reports

Reports are generated in `reports/` directory:

- `bundle-size-report.json`: Detailed bundle analysis
- `performance-report.json`: Core Web Vitals metrics
- `lighthouse.html`: Comprehensive performance audit
- `accessibility-report.json`: A11y compliance results

## Best Practices

### 1. Bundle Size Management

- ✅ Use dynamic imports for large components
- ✅ Import only needed functions from libraries
- ✅ Regularly audit dependencies
- ✅ Monitor bundle size in CI/CD
- ❌ Don't import entire libraries for single functions
- ❌ Don't ignore bundle size warnings

### 2. Performance Optimization

- ✅ Implement lazy loading for images and components
- ✅ Use React.memo for expensive components
- ✅ Optimize images (WebP, proper sizing)
- ✅ Minimize layout shifts
- ❌ Don't load all images at once
- ❌ Don't ignore Core Web Vitals warnings

### 3. Development Workflow

- ✅ Run `npm run validate:all` before committing
- ✅ Check bundle analysis for new dependencies
- ✅ Test performance on slower devices
- ✅ Monitor real-world performance metrics
- ❌ Don't skip performance validation
- ❌ Don't add dependencies without consideration

## Performance Budget

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| Main JS Bundle | ≤ 100KB | ~95KB | ✅ |
| Total JS | ≤ 200KB | ~150KB | ✅ |
| LCP | ≤ 2.5s | ~2.2s | ✅ |
| FID | ≤ 100ms | ~85ms | ✅ |
| CLS | ≤ 0.1 | ~0.08 | ✅ |

## Troubleshooting

### Bundle Size Issues

1. **Identify large dependencies**:
   ```bash
   npm run analyze
   ```

2. **Check for duplicate dependencies**:
   ```bash
   npm ls --depth=0
   ```

3. **Analyze import statements**:
   ```bash
   # Use webpack-bundle-analyzer report
   # Look for unexpectedly large modules
   ```

### Performance Issues

1. **Profile component rendering**:
   ```bash
   # Use React DevTools Profiler
   # Identify expensive re-renders
   ```

2. **Network analysis**:
   ```bash
   # Use browser DevTools Network tab
   # Check for large/slow resources
   ```

3. **Core Web Vitals debugging**:
   ```bash
   # Use Lighthouse DevTools
   # Check specific metric recommendations
   ```

## Future Optimizations

### Planned Improvements

1. **Service Worker**: Implement caching strategy
2. **WebP Images**: Automatic format optimization
3. **Preloading**: Critical resource hints
4. **Font Optimization**: Subset and preload fonts
5. **CDN Integration**: Global content delivery

### Performance Monitoring

1. **Real User Monitoring**: Track actual user metrics
2. **Performance Budgets**: Automated regression prevention  
3. **A/B Testing**: Measure optimization impact
4. **Continuous Monitoring**: Production performance tracking

---

For more information, see:
- [Bundle Size Validation Script](scripts/validate-bundle-size.js)
- [Performance Validation Script](scripts/validate-performance.js)
- [Next.js Configuration](next.config.js)
- [CI/CD Workflow](.github/workflows/bundle-size-check.yml)