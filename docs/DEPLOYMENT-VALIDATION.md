# Production Deployment Validation Guide

## 🧪 Complete Testing & Validation Checklist

### 1. Pre-Deployment Validation

#### Build Verification
```bash
# Verify production build works
npm run build:static

# Check build output
ls -la out/
# Should contain: index.html, _next/, gallery.html, 404.html

# Verify environment variables in build
grep -r "NEXT_PUBLIC" out/_next/static/
# Should NOT contain actual secrets, only public variables
```

#### Security Scan
```bash
# Dependency vulnerability check
npm audit --production --audit-level high

# Check for exposed secrets
git secrets --scan
grep -r "sk-" src/ # Check for API keys
grep -r "password" src/ # Check for hardcoded passwords
```

### 2. Post-Deployment Testing

#### Authentication Flow Testing

```javascript
// Test script: scripts/test-auth-flow.js
const puppeteer = require('puppeteer');

async function testAuthenticationFlow() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing authentication flow...');
    
    // Navigate to app
    await page.goto(process.env.TEST_URL || 'https://yourdomain.com');
    
    // Check if login button exists
    await page.waitForSelector('[data-testid="login-button"]', { timeout: 5000 });
    console.log('✅ Login button found');
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Wait for Microsoft login page
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    if (page.url().includes('login.microsoftonline.com')) {
      console.log('✅ Redirected to Microsoft login');
    } else {
      throw new Error('❌ Not redirected to Microsoft login');
    }
    
    console.log('✅ Authentication flow test passed');
    
  } catch (error) {
    console.error('❌ Authentication flow test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { testAuthenticationFlow };
```

#### API Connectivity Testing

```javascript
// Test script: scripts/test-api-connectivity.js
async function testAPIConnectivity() {
  console.log('🔍 Testing API connectivity...');
  
  const tests = [
    {
      name: 'Microsoft Graph API Health',
      url: 'https://graph.microsoft.com/v1.0/$metadata',
      expected: 200
    },
    {
      name: 'Azure AD Endpoint',
      url: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/.well-known/openid_configuration`,
      expected: 200
    }
  ];
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      if (response.status === test.expected) {
        console.log(`✅ ${test.name}: OK`);
      } else {
        console.log(`❌ ${test.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
}

module.exports = { testAPIConnectivity };
```

#### Performance Testing

```javascript
// Test script: scripts/test-performance.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runPerformanceTest(url) {
  console.log('🔍 Running performance tests...');
  
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };
  
  const runnerResult = await lighthouse(url, options);
  
  // Extract scores
  const scores = {
    performance: runnerResult.lhr.categories.performance.score * 100,
    accessibility: runnerResult.lhr.categories.accessibility.score * 100,
    bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
    seo: runnerResult.lhr.categories.seo.score * 100,
  };
  
  console.log('📊 Lighthouse Scores:');
  console.log(`Performance: ${scores.performance}`);
  console.log(`Accessibility: ${scores.accessibility}`);
  console.log(`Best Practices: ${scores.bestPractices}`);
  console.log(`SEO: ${scores.seo}`);
  
  // Validate against thresholds
  const thresholds = {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 90
  };
  
  let passed = true;
  for (const [metric, score] of Object.entries(scores)) {
    if (score < thresholds[metric]) {
      console.log(`❌ ${metric} score ${score} below threshold ${thresholds[metric]}`);
      passed = false;
    } else {
      console.log(`✅ ${metric} score ${score} meets threshold`);
    }
  }
  
  await chrome.kill();
  
  return { passed, scores };
}

module.exports = { runPerformanceTest };
```

### 3. Security Validation

#### HTTPS & Security Headers Test

```javascript
// Test script: scripts/test-security.js
async function testSecurityHeaders(url) {
  console.log('🔍 Testing security headers...');
  
  const response = await fetch(url);
  const headers = response.headers;
  
  const securityHeaders = {
    'strict-transport-security': 'HSTS header',
    'x-frame-options': 'Clickjacking protection',
    'x-content-type-options': 'MIME type sniffing protection',
    'content-security-policy': 'CSP header',
    'x-xss-protection': 'XSS protection'
  };
  
  let passed = true;
  
  for (const [header, description] of Object.entries(securityHeaders)) {
    if (headers.has(header)) {
      console.log(`✅ ${description}: ${headers.get(header)}`);
    } else {
      console.log(`❌ Missing ${description}`);
      passed = false;
    }
  }
  
  // Check HTTPS
  if (url.startsWith('https://')) {
    console.log('✅ HTTPS enabled');
  } else {
    console.log('❌ HTTPS not enabled');
    passed = false;
  }
  
  return passed;
}

module.exports = { testSecurityHeaders };
```

### 4. Accessibility Testing

```javascript
// Test script: scripts/test-accessibility.js
const axeCore = require('@axe-core/playwright');

async function testAccessibility(url) {
  console.log('🔍 Testing accessibility...');
  
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(url);
  
  // Inject axe-core
  await axeCore.injectIntoPage(page);
  
  // Run accessibility scan
  const results = await axeCore.getViolations(page);
  
  if (results.length === 0) {
    console.log('✅ No accessibility violations found');
  } else {
    console.log(`❌ Found ${results.length} accessibility violations:`);
    results.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
      console.log(`   Impact: ${violation.impact}`);
      console.log(`   Help: ${violation.helpUrl}`);
    });
  }
  
  await browser.close();
  
  return results.length === 0;
}

module.exports = { testAccessibility };
```

### 5. Functional Testing

#### Gallery Feature Testing

```javascript
// Test script: scripts/test-gallery.js
async function testGalleryFeatures(url) {
  console.log('🔍 Testing gallery features...');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(url);
  
  try {
    // Test lazy loading
    console.log('Testing lazy loading...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait for images to load
    await page.waitForTimeout(2000);
    
    const images = await page.$$('img[loading="lazy"]');
    console.log(`✅ Found ${images.length} lazy-loaded images`);
    
    // Test keyboard navigation
    console.log('Testing keyboard navigation...');
    await page.focus('[data-testid="gallery"]');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    console.log('✅ Keyboard navigation working');
    
    // Test image preview
    console.log('Testing image preview...');
    await page.click('[data-testid="gallery-item"]:first-child');
    await page.waitForSelector('[data-testid="preview-dialog"]');
    console.log('✅ Image preview opens');
    
    // Close preview
    await page.keyboard.press('Escape');
    await page.waitForSelector('[data-testid="preview-dialog"]', { hidden: true });
    console.log('✅ Image preview closes with Escape');
    
  } catch (error) {
    console.error('❌ Gallery test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { testGalleryFeatures };
```

### 6. Error Handling Testing

```javascript
// Test script: scripts/test-error-handling.js
async function testErrorHandling(url) {
  console.log('🔍 Testing error handling...');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Test network error handling
  await page.setOfflineMode(true);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  
  // Check if offline message appears
  const offlineMessage = await page.$('[data-testid="offline-message"]');
  if (offlineMessage) {
    console.log('✅ Offline error handling works');
  }
  
  // Test 404 page
  await page.setOfflineMode(false);
  await page.goto(`${url}/nonexistent-page`);
  
  const errorPage = await page.$('[data-testid="404-page"]');
  if (errorPage) {
    console.log('✅ 404 error page works');
  }
  
  await browser.close();
}

module.exports = { testErrorHandling };
```

### 7. Mobile Responsiveness Testing

```javascript
// Test script: scripts/test-mobile.js
async function testMobileResponsiveness(url) {
  console.log('🔍 Testing mobile responsiveness...');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const devices = [
    { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
    { name: 'iPad', viewport: { width: 768, height: 1024 } },
    { name: 'Galaxy S21', viewport: { width: 384, height: 854 } }
  ];
  
  for (const device of devices) {
    console.log(`Testing on ${device.name}...`);
    
    await page.setViewport(device.viewport);
    await page.goto(url);
    
    // Check if mobile navigation works
    const mobileMenu = await page.$('[data-testid="mobile-menu"]');
    if (mobileMenu) {
      console.log(`✅ ${device.name}: Mobile menu found`);
    }
    
    // Check if touch gestures work
    await page.touchscreen.tap(100, 100);
    console.log(`✅ ${device.name}: Touch interaction works`);
  }
  
  await browser.close();
}

module.exports = { testMobileResponsiveness };
```

## 📋 Master Validation Script

```javascript
// scripts/validate-deployment.js
const { testAuthenticationFlow } = require('./test-auth-flow');
const { testAPIConnectivity } = require('./test-api-connectivity');
const { runPerformanceTest } = require('./test-performance');
const { testSecurityHeaders } = require('./test-security');
const { testAccessibility } = require('./test-accessibility');
const { testGalleryFeatures } = require('./test-gallery');
const { testErrorHandling } = require('./test-error-handling');
const { testMobileResponsiveness } = require('./test-mobile');

async function validateDeployment() {
  const url = process.env.TEST_URL || 'https://yourdomain.com';
  console.log(`🚀 Starting deployment validation for: ${url}`);
  
  const results = {
    authFlow: false,
    apiConnectivity: false,
    performance: false,
    security: false,
    accessibility: false,
    gallery: false,
    errorHandling: false,
    mobile: false
  };
  
  try {
    // Run all tests
    results.authFlow = await testAuthenticationFlow();
    await testAPIConnectivity();
    results.apiConnectivity = true;
    
    const perfResult = await runPerformanceTest(url);
    results.performance = perfResult.passed;
    
    results.security = await testSecurityHeaders(url);
    results.accessibility = await testAccessibility(url);
    
    await testGalleryFeatures(url);
    results.gallery = true;
    
    await testErrorHandling(url);
    results.errorHandling = true;
    
    await testMobileResponsiveness(url);
    results.mobile = true;
    
  } catch (error) {
    console.error('❌ Deployment validation failed:', error.message);
  }
  
  // Summary
  console.log('\n📊 Validation Summary:');
  console.log('========================');
  
  let passed = 0;
  let total = 0;
  
  for (const [test, result] of Object.entries(results)) {
    total++;
    if (result) {
      passed++;
      console.log(`✅ ${test}: PASSED`);
    } else {
      console.log(`❌ ${test}: FAILED`);
    }
  }
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 Deployment validation SUCCESSFUL!');
    process.exit(0);
  } else {
    console.log('❌ Deployment validation FAILED!');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  validateDeployment();
}

module.exports = { validateDeployment };
```

## 🎯 Quick Validation Checklist

### ✅ Essential Checks (Manual)

1. **Basic Functionality**
   - [ ] App loads without errors
   - [ ] Login button works
   - [ ] Redirects to Microsoft login
   - [ ] Gallery page accessible

2. **Authentication**
   - [ ] Login flow completes
   - [ ] Token refresh works
   - [ ] Logout works
   - [ ] Unauthorized access blocked

3. **Core Features**
   - [ ] Photos load from OneDrive
   - [ ] Image preview works
   - [ ] Keyboard navigation works
   - [ ] Mobile responsive

4. **Performance**
   - [ ] Page loads under 3 seconds
   - [ ] Images lazy load
   - [ ] No console errors
   - [ ] Lighthouse score > 90

5. **Security**
   - [ ] HTTPS enabled
   - [ ] Security headers present
   - [ ] No secrets exposed in client
   - [ ] CSP policy active

### 🚀 Production Readiness

When all tests pass, your M365-style OneDrive photo sharing app is ready for production! 

```bash
# Final deployment command
npm run validate:all && npm run deploy:prepare
```

Your deployment validation is now complete! 🎉