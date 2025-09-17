#!/usr/bin/env node

/**
 * Bundle size validation script
 * Validates that JavaScript bundle stays under 100KB limit
 * Part of CI/CD pipeline for performance monitoring
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BUNDLE_SIZE_LIMIT_KB = 100;
const BUNDLE_SIZE_LIMIT_BYTES = BUNDLE_SIZE_LIMIT_KB * 1024;
const OUT_DIR = path.join(process.cwd(), 'out');
const NEXT_DIR = path.join(process.cwd(), '.next');

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Get all JavaScript files from build output
 */
function getJavaScriptFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return files;
  }

  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        walkDir(itemPath);
      } else if (item.endsWith('.js') && !item.includes('.map')) {
        files.push({
          path: itemPath,
          relativePath: path.relative(process.cwd(), itemPath),
          size: getFileSize(itemPath)
        });
      }
    }
  }
  
  walkDir(dir);
  return files;
}

/**
 * Calculate bundle statistics
 */
function analyzeBundleSize() {
  console.log('🔍 Analyzing bundle size...\n');
  
  // Try to analyze built files from multiple locations
  const locations = [
    { name: 'Static Export', dir: OUT_DIR },
    { name: 'Next.js Build', dir: path.join(NEXT_DIR, 'static') }
  ];
  
  let totalSize = 0;
  let mainBundleSize = 0;
  let allFiles = [];
  let analysisSuccessful = false;
  
  for (const location of locations) {
    const files = getJavaScriptFiles(location.dir);
    
    if (files.length > 0) {
      console.log(`📂 Found ${files.length} JS files in ${location.name}:`);
      analysisSuccessful = true;
      
      files.forEach(file => {
        const sizeKB = Math.round(file.size / 1024 * 100) / 100;
        console.log(`  ${file.relativePath}: ${sizeKB} KB`);
        
        totalSize += file.size;
        
        // Identify main bundle (usually the largest or contains 'main')
        if (file.relativePath.includes('main') || 
            file.relativePath.includes('app') ||
            file.relativePath.includes('index')) {
          mainBundleSize += file.size;
        }
      });
      
      allFiles = allFiles.concat(files);
      console.log('');
    }
  }
  
  if (!analysisSuccessful) {
    console.error('❌ No JavaScript files found in build output');
    console.log('Make sure to run "npm run build" first');
    process.exit(1);
  }
  
  return {
    totalSize,
    mainBundleSize: mainBundleSize || totalSize, // Fallback to total if no main identified
    fileCount: allFiles.length,
    files: allFiles
  };
}

/**
 * Validate bundle size against limits
 */
function validateBundleSize(analysis) {
  const totalSizeKB = Math.round(analysis.totalSize / 1024 * 100) / 100;
  const mainSizeKB = Math.round(analysis.mainBundleSize / 1024 * 100) / 100;
  
  console.log('📊 Bundle Size Analysis:');
  console.log(`  Total JavaScript: ${totalSizeKB} KB (${analysis.fileCount} files)`);
  console.log(`  Main Bundle: ${mainSizeKB} KB`);
  console.log(`  Size Limit: ${BUNDLE_SIZE_LIMIT_KB} KB\n`);
  
  // Validate main bundle size
  const isMainBundleValid = analysis.mainBundleSize <= BUNDLE_SIZE_LIMIT_BYTES;
  const isTotalValid = analysis.totalSize <= BUNDLE_SIZE_LIMIT_BYTES * 2; // Allow 2x limit for total
  
  if (isMainBundleValid && isTotalValid) {
    console.log('✅ Bundle size validation passed!');
    console.log(`   Main bundle (${mainSizeKB} KB) is within ${BUNDLE_SIZE_LIMIT_KB} KB limit`);
    
    if (mainSizeKB > BUNDLE_SIZE_LIMIT_KB * 0.8) {
      console.log('⚠️  Warning: Bundle size is approaching the limit');
      console.log('   Consider code splitting or tree shaking optimizations');
    }
    
    return true;
  } else {
    console.log('❌ Bundle size validation failed!');
    
    if (!isMainBundleValid) {
      const excess = mainSizeKB - BUNDLE_SIZE_LIMIT_KB;
      console.log(`   Main bundle (${mainSizeKB} KB) exceeds limit by ${excess} KB`);
    }
    
    if (!isTotalValid) {
      const totalLimit = BUNDLE_SIZE_LIMIT_KB * 2;
      const excess = totalSizeKB - totalLimit;
      console.log(`   Total size (${totalSizeKB} KB) exceeds ${totalLimit} KB limit by ${excess} KB`);
    }
    
    console.log('\n💡 Suggestions to reduce bundle size:');
    console.log('   • Use dynamic imports for non-critical components');
    console.log('   • Enable tree shaking in webpack configuration');
    console.log('   • Analyze with "npm run bundle:analyze"');
    console.log('   • Remove unused dependencies');
    console.log('   • Use smaller alternative libraries');
    
    return false;
  }
}

/**
 * Generate bundle size report
 */
function generateReport(analysis) {
  const report = {
    timestamp: new Date().toISOString(),
    totalSizeKB: Math.round(analysis.totalSize / 1024 * 100) / 100,
    mainBundleSizeKB: Math.round(analysis.mainBundleSize / 1024 * 100) / 100,
    limitKB: BUNDLE_SIZE_LIMIT_KB,
    fileCount: analysis.fileCount,
    files: analysis.files.map(f => ({
      path: f.relativePath,
      sizeKB: Math.round(f.size / 1024 * 100) / 100
    })),
    isValid: analysis.mainBundleSize <= BUNDLE_SIZE_LIMIT_BYTES
  };
  
  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Write report
  const reportPath = path.join(reportsDir, 'bundle-size-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  return report;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Bundle Size Validation\n');
  
  try {
    const analysis = analyzeBundleSize();
    const isValid = validateBundleSize(analysis);
    const report = generateReport(analysis);
    
    // Exit with appropriate code
    process.exit(isValid ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundleSize,
  validateBundleSize,
  generateReport,
  BUNDLE_SIZE_LIMIT_KB
};