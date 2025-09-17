# Production Deployment Guide

This guide provides comprehensive instructions for deploying the OneDrive Photo Gallery to production environments.

## Prerequisites

- Node.js 18+ with npm
- Azure Active Directory tenant with app registration
- Web server or hosting platform (Azure Static Web Apps, Netlify, etc.)
- SSL certificate for HTTPS

## Quick Start

```bash
# 1. Set environment variables
cp .env.local.example .env.production
# Edit .env.production with your values

# 2. Run deployment preparation
npm run deploy:prepare

# 3. Deploy the contents of deployment/ directory
```

## Environment Configuration

### Required Variables

Create `.env.production` with the following values:

```env
# Azure AD Configuration
NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id  
NEXT_PUBLIC_AZURE_REDIRECT_URI=https://your-domain.com

# Application Settings
NEXT_PUBLIC_APP_NAME=OneDrive Photo Gallery
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Azure AD App Registration

1. **Create App Registration**:
   - Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
   - Click "New registration"
   - Name: "OneDrive Photo Gallery"
   - Supported account types: Choose appropriate option
   - Redirect URI: Web → `https://your-domain.com`

2. **Configure Authentication**:
   - Add redirect URIs for all deployment environments
   - Enable "Access tokens" and "ID tokens"
   - Set logout URL: `https://your-domain.com`

3. **API Permissions**:
   - Add Microsoft Graph permissions:
     - `User.Read` (Delegated)
     - `Files.Read.All` (Delegated)
   - Grant admin consent if required

4. **Copy Configuration**:
   - Application (client) ID → `NEXT_PUBLIC_AZURE_CLIENT_ID`
   - Directory (tenant) ID → `NEXT_PUBLIC_AZURE_TENANT_ID`

## Deployment Methods

### Method 1: Azure Static Web Apps

1. **Create Static Web App**:
   ```bash
   az staticwebapp create \
     --name onedrive-photo-gallery \
     --resource-group your-rg \
     --source https://github.com/your-org/your-repo \
     --location "East US 2" \
     --branch main \
     --app-location "/" \
     --output-location "out"
   ```

2. **Configure Environment Variables**:
   - Go to Azure Portal → Static Web Apps → Configuration
   - Add all required environment variables

3. **Custom Domain** (Optional):
   - Add custom domain in Azure Portal
   - Update Azure AD redirect URIs

### Method 2: Netlify

1. **Deploy to Netlify**:
   ```bash
   # Build locally
   npm run deploy:prepare
   
   # Upload deployment/ directory to Netlify
   # Or connect GitHub repository
   ```

2. **Configuration**:
   - Build command: `npm run build:static`
   - Publish directory: `out`
   - Add environment variables in Netlify dashboard

### Method 3: Traditional Web Server

1. **Prepare Build**:
   ```bash
   npm run deploy:prepare
   ```

2. **Upload Files**:
   - Upload contents of `deployment/` directory to web root
   - Ensure proper file permissions

3. **Web Server Configuration**:

   **Apache (.htaccess)**:
   ```apache
   # Redirect to HTTPS
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # Security Headers
   Header always set X-Content-Type-Options nosniff
   Header always set X-Frame-Options DENY
   Header always set X-XSS-Protection "1; mode=block"
   Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
   
   # CSP Header
   Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' login.microsoftonline.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: graph.microsoft.com; connect-src 'self' login.microsoftonline.com graph.microsoft.com"
   
   # Cache static assets
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType text/css "access plus 1 year"
     ExpiresByType application/javascript "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
   </IfModule>
   ```

   **Nginx**:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     return 301 https://$server_name$request_uri;
   }
   
   server {
     listen 443 ssl http2;
     server_name your-domain.com;
     
     ssl_certificate /path/to/certificate.crt;
     ssl_certificate_key /path/to/private.key;
     
     root /var/www/onedrive-gallery;
     index index.html;
     
     # Security headers
     add_header X-Content-Type-Options nosniff;
     add_header X-Frame-Options DENY;
     add_header X-XSS-Protection "1; mode=block";
     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
     
     # CSP header
     add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' login.microsoftonline.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: graph.microsoft.com; connect-src 'self' login.microsoftonline.com graph.microsoft.com";
     
     # Static file caching
     location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
     
     # SPA routing
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

## Security Configuration

### Content Security Policy (CSP)

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' login.microsoftonline.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: graph.microsoft.com *.sharepoint.com;
  connect-src 'self' login.microsoftonline.com graph.microsoft.com;
  font-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
```

### Security Headers

Ensure the following headers are set:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Performance Optimization

### Caching Strategy

```nginx
# Static assets - 1 year cache
location ~* \.(css|js|woff2?|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# HTML files - no cache (for SPA updates)
location ~* \.html$ {
  expires -1;
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### CDN Configuration

For global deployment, consider using a CDN:

1. **Azure CDN**:
   - Create CDN profile and endpoint
   - Point to Static Web App
   - Configure caching rules

2. **CloudFlare**:
   - Add domain to CloudFlare
   - Configure Page Rules for caching
   - Enable security features

## Monitoring & Maintenance

### Performance Monitoring

1. **Core Web Vitals**:
   ```javascript
   // Add to production build
   if (typeof window !== 'undefined') {
     import('./utils/performance').then(({ monitorPerformance }) => {
       monitorPerformance();
     });
   }
   ```

2. **Real User Monitoring**:
   - Google Analytics 4 with Core Web Vitals
   - Azure Application Insights
   - Custom performance tracking

### Error Monitoring

1. **JavaScript Errors**:
   ```javascript
   window.addEventListener('error', (event) => {
     // Log to monitoring service
     console.error('Global error:', event.error);
   });
   
   window.addEventListener('unhandledrejection', (event) => {
     // Log promise rejections
     console.error('Unhandled promise rejection:', event.reason);
   });
   ```

2. **API Errors**:
   - Monitor Graph API response times
   - Track authentication failures
   - Alert on high error rates

### Health Checks

Create monitoring endpoints:

```javascript
// /api/health
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION
  });
}
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Verify Azure AD configuration
   - Check redirect URIs
   - Confirm tenant ID and client ID

2. **CORS Errors**:
   - Check Azure AD app registration
   - Verify domain in redirect URIs
   - Ensure HTTPS is enabled

3. **Bundle Size Errors**:
   ```bash
   npm run validate:bundle
   npm run analyze
   ```

4. **Performance Issues**:
   ```bash
   npm run validate:performance
   npm run test:lighthouse
   ```

### Debug Mode

Enable debug logging in production:

```env
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true
```

## Rollback Plan

1. **Backup Current Version**:
   ```bash
   cp -r /var/www/onedrive-gallery /var/www/onedrive-gallery.backup
   ```

2. **Automated Rollback**:
   ```bash
   # Script to rollback to previous version
   ./scripts/rollback.sh
   ```

3. **Database/State Considerations**:
   - No database to rollback
   - User sessions handled by Azure AD
   - Clear browser cache if needed

## Post-Deployment Checklist

- [ ] Verify HTTPS is working
- [ ] Test user authentication flow
- [ ] Check photo gallery loading
- [ ] Validate Core Web Vitals scores
- [ ] Confirm security headers are set
- [ ] Test mobile responsiveness
- [ ] Verify accessibility with screen reader
- [ ] Monitor error rates for 24 hours
- [ ] Update documentation with production URLs
- [ ] Train support team on new features

## Support & Maintenance

### Regular Tasks

- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and rotate secrets
- **Annually**: Renew SSL certificates and review security

### Emergency Contacts

- **Azure Support**: [Azure Portal](https://portal.azure.com)
- **Microsoft Graph Issues**: [Microsoft Graph Support](https://developer.microsoft.com/graph/support)
- **Security Issues**: Follow responsible disclosure process

---

For more information:
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Microsoft Graph Documentation](https://docs.microsoft.com/graph/)
- [MSAL.js Documentation](https://docs.microsoft.com/azure/active-directory/develop/msal-js-initializing-client-applications)