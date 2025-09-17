#!/usr/bin/env node

/**
 * Production deployment preparation script
 * Validates environment, builds optimized static export, and prepares for deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  requiredEnvVars: [
    'NEXT_PUBLIC_AZURE_CLIENT_ID',
    'NEXT_PUBLIC_AZURE_TENANT_ID', 
    'NEXT_PUBLIC_AZURE_REDIRECT_URI'
  ],
  outputDir: 'out',
  deploymentDir: 'deployment',
  reportsDir: 'reports'
};

/**
 * Check if required environment variables are set
 */
function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');
  
  const missing = [];
  
  for (const envVar of CONFIG.requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(envVar => console.error(`   ${envVar}`));
    console.error('\nPlease set these variables in .env.production or your deployment environment.');
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  
  // Log configuration (without sensitive values)
  console.log('\n📋 Deployment Configuration:');
  console.log(`   App Name: ${process.env.NEXT_PUBLIC_APP_NAME || 'OneDrive Photo Gallery'}`);
  console.log(`   Version: ${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`);
  console.log(`   Environment: ${process.env.NEXT_PUBLIC_DEPLOY_ENV || 'production'}`);
  console.log(`   Client ID: ${process.env.NEXT_PUBLIC_AZURE_CLIENT_ID?.substring(0, 8)}...`);
  
  return true;
}

/**
 * Run security checks
 */
function runSecurityChecks() {
  console.log('\n🔒 Running security checks...\n');
  
  const checks = [];
  
  // Check for hardcoded secrets
  try {
    const result = execSync('grep -r "secret\\|password\\|key" src/ --exclude-dir=node_modules', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.trim()) {
      checks.push('⚠️  Potential hardcoded secrets found - review manually');
    }
  } catch (error) {
    // No secrets found (grep returns non-zero when no matches)
    checks.push('✅ No obvious hardcoded secrets detected');
  }
  
  // Check environment file security
  if (fs.existsSync('.env.local')) {
    checks.push('⚠️  .env.local exists - ensure it\'s not committed to version control');
  }
  
  if (fs.existsSync('.env.production') && process.env.NODE_ENV !== 'production') {
    checks.push('⚠️  .env.production exists in non-production environment');
  }
  
  // Check for Node.js security
  try {
    execSync('npm audit --audit-level moderate', { stdio: 'pipe' });
    checks.push('✅ No security vulnerabilities found in dependencies');
  } catch (error) {
    checks.push('❌ Security vulnerabilities found - run "npm audit fix"');
  }
  
  checks.forEach(check => console.log(`   ${check}`));
  
  const hasErrors = checks.some(check => check.includes('❌'));
  return !hasErrors;
}

/**
 * Build optimized production version
 */
function buildProduction() {
  console.log('\n🏗️  Building optimized production version...\n');
  
  try {
    // Clean previous build
    if (fs.existsSync(CONFIG.outputDir)) {
      fs.rmSync(CONFIG.outputDir, { recursive: true });
      console.log('   Cleaned previous build');
    }
    
    // Set production environment
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_BUILD_TIME = new Date().toISOString();
    
    // Run build with optimizations
    console.log('   Running Next.js build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('   Running static export...');
    execSync('npm run export', { stdio: 'inherit' });
    
    console.log('✅ Production build completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

/**
 * Validate build output
 */
function validateBuildOutput() {
  console.log('\n🧪 Validating build output...\n');
  
  const checks = [];
  
  // Check if output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    checks.push('❌ Output directory not found');
    return false;
  }
  
  // Check for required files
  const requiredFiles = [
    'index.html',
    '_next/static'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(CONFIG.outputDir, file);
    if (fs.existsSync(filePath)) {
      checks.push(`✅ Found ${file}`);
    } else {
      checks.push(`❌ Missing ${file}`);
    }
  }
  
  // Check bundle size
  try {
    execSync('npm run validate:bundle', { stdio: 'pipe' });
    checks.push('✅ Bundle size within limits');
  } catch (error) {
    checks.push('❌ Bundle size validation failed');
  }
  
  // Check for accessibility
  try {
    const indexPath = path.join(CONFIG.outputDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    if (content.includes('alt=') && content.includes('aria-')) {
      checks.push('✅ Accessibility attributes present');
    } else {
      checks.push('⚠️  Limited accessibility attributes found');
    }
  } catch (error) {
    checks.push('⚠️  Could not validate accessibility');
  }
  
  checks.forEach(check => console.log(`   ${check}`));
  
  const hasErrors = checks.some(check => check.includes('❌'));
  return !hasErrors;
}

/**
 * Prepare deployment package
 */
function prepareDeployment() {
  console.log('\n📦 Preparing deployment package...\n');
  
  try {
    // Create deployment directory
    if (fs.existsSync(CONFIG.deploymentDir)) {
      fs.rmSync(CONFIG.deploymentDir, { recursive: true });
    }
    fs.mkdirSync(CONFIG.deploymentDir, { recursive: true });
    
    // Copy static files
    console.log('   Copying static files...');
    execSync(`cp -r ${CONFIG.outputDir}/* ${CONFIG.deploymentDir}/`);
    
    // Add deployment metadata
    const metadata = {
      buildTime: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NEXT_PUBLIC_DEPLOY_ENV || 'production',
      nodeVersion: process.version,
      commitSha: process.env.GITHUB_SHA || 'unknown'
    };
    
    fs.writeFileSync(
      path.join(CONFIG.deploymentDir, 'deployment.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    // Copy reports if they exist
    if (fs.existsSync(CONFIG.reportsDir)) {
      fs.mkdirSync(path.join(CONFIG.deploymentDir, 'reports'), { recursive: true });
      execSync(`cp -r ${CONFIG.reportsDir}/* ${CONFIG.deploymentDir}/reports/`);
      console.log('   Copied performance reports');
    }
    
    // Create deployment README
    const readmeContent = `# Deployment Package

This package contains the production build of OneDrive Photo Gallery.

## Build Information
- **Version**: ${metadata.version}
- **Build Time**: ${metadata.buildTime}
- **Environment**: ${metadata.environment}
- **Node Version**: ${metadata.nodeVersion}
- **Commit SHA**: ${metadata.commitSha}

## Deployment Instructions

1. Upload contents to your web server
2. Configure environment variables
3. Set up HTTPS and security headers
4. Test authentication flow
5. Monitor performance metrics

## Files
- \`index.html\` - Main application entry point
- \`_next/\` - Next.js static assets
- \`reports/\` - Performance and bundle reports
- \`deployment.json\` - Build metadata

## Security Notes
- Ensure HTTPS is enabled
- Configure CSP headers
- Set up proper CORS policies
- Monitor for security updates
`;
    
    fs.writeFileSync(
      path.join(CONFIG.deploymentDir, 'README.md'),
      readmeContent
    );
    
    console.log('✅ Deployment package prepared successfully');
    console.log(`   Package location: ${CONFIG.deploymentDir}/`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Deployment preparation failed:', error.message);
    return false;
  }
}

/**
 * Generate deployment checklist
 */
function generateDeploymentChecklist() {
  console.log('\n📋 Deployment Checklist:\n');
  
  const checklist = [
    '🔧 Configure web server (Apache/Nginx/IIS)',
    '🔒 Enable HTTPS with valid SSL certificate',
    '🛡️  Set up security headers (CSP, HSTS, etc.)',
    '🎯 Configure Azure AD application registration',
    '📊 Set up monitoring and logging',
    '🔍 Test authentication flow end-to-end',
    '📱 Verify mobile responsiveness',
    '♿ Test accessibility with screen readers',
    '⚡ Validate Core Web Vitals in production',
    '🚨 Set up error monitoring and alerting',
    '📈 Configure analytics (if enabled)',
    '🔄 Plan rollback strategy',
    '📝 Update documentation with production URLs',
    '👥 Train support team on new features'
  ];
  
  checklist.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item}`);
  });
  
  console.log('\n📧 Post-deployment verification:');
  console.log('   • Test user sign-in flow');
  console.log('   • Verify photo gallery loading');
  console.log('   • Check performance metrics');
  console.log('   • Validate security headers');
  console.log('   • Monitor error rates');
}

/**
 * Main deployment preparation function
 */
function main() {
  console.log('🚀 OneDrive Photo Gallery - Production Deployment Preparation\n');
  
  let success = true;
  
  // Step 1: Validate environment
  if (!validateEnvironment()) {
    success = false;
  }
  
  // Step 2: Security checks
  if (success && !runSecurityChecks()) {
    console.log('⚠️  Security issues found - review before deployment');
  }
  
  // Step 3: Build production version
  if (success && !buildProduction()) {
    success = false;
  }
  
  // Step 4: Validate build output
  if (success && !validateBuildOutput()) {
    success = false;
  }
  
  // Step 5: Prepare deployment package
  if (success && !prepareDeployment()) {
    success = false;
  }
  
  // Step 6: Generate checklist
  generateDeploymentChecklist();
  
  // Final status
  console.log(`\n${success ? '✅' : '❌'} Deployment preparation ${success ? 'completed successfully' : 'failed'}`);
  
  if (success) {
    console.log('\n🎉 Ready for deployment!');
    console.log(`   Package: ${CONFIG.deploymentDir}/`);
    console.log('   Follow the deployment checklist above');
  } else {
    console.log('\n🛑 Please fix the issues above before deploying');
  }
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateEnvironment,
  runSecurityChecks,
  buildProduction,
  validateBuildOutput,
  prepareDeployment
};