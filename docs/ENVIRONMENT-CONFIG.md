# Production Environment Configuration

## 🔧 Environment Variables Setup

### Required Environment Variables

Create these environment variables on your hosting platform:

```bash
# Azure AD Configuration
NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-app-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id
NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.com

# Microsoft Graph API
NEXT_PUBLIC_GRAPH_ENDPOINT=https://graph.microsoft.com
NEXT_PUBLIC_GRAPH_SCOPES=Files.Read,Sites.Read.All,User.Read

# Application Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_APP_INSIGHTS_KEY=your-app-insights-key
```

## 🏗️ Platform-Specific Configuration

### Azure Static Web Apps

1. **Through Azure Portal:**
   - Go to Static Web Apps → Your App → Configuration
   - Add application settings:

2. **Through GitHub Secrets (for GitHub Actions):**
   ```yaml
   # In your GitHub repository settings → Secrets
   AZURE_CLIENT_ID: your-azure-app-client-id
   AZURE_TENANT_ID: your-azure-tenant-id
   REDIRECT_URI: https://yourapp.azurestaticapps.net
   AZURE_STATIC_WEB_APPS_API_TOKEN: deployment-token-from-azure
   ```

### Netlify

1. **Through Netlify Dashboard:**
   - Site Settings → Environment variables
   - Add each variable individually

2. **Through netlify.toml:**
   ```toml
   [build.environment]
     NODE_ENV = "production"
     NEXT_TELEMETRY_DISABLED = "1"
   ```

### Vercel

```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_AZURE_CLIENT_ID
vercel env add NEXT_PUBLIC_AZURE_TENANT_ID
vercel env add NEXT_PUBLIC_REDIRECT_URI
```

### Traditional Web Hosting

Create `.env.production.local` file:
```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-app-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id
NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.com
NEXT_PUBLIC_GRAPH_ENDPOINT=https://graph.microsoft.com
NODE_ENV=production
```

## 🔐 Security Best Practices

### 1. Environment Variable Security

- **Never commit** `.env.production.local` to version control
- **Use platform-specific** secure environment variable storage
- **Rotate secrets** regularly
- **Limit access** to production environment variables

### 2. Azure AD Security

```env
# Use specific scopes only
NEXT_PUBLIC_GRAPH_SCOPES=Files.Read,User.Read

# Use organization-specific tenant
NEXT_PUBLIC_AZURE_TENANT_ID=your-specific-tenant-id

# Use exact redirect URI
NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.com
```

### 3. Content Security Policy

Add CSP headers through your hosting platform:

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://login.microsoftonline.com; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https: blob:; 
  connect-src 'self' https://graph.microsoft.com https://login.microsoftonline.com https://*.login.microsoftonline.com; 
  font-src 'self' data:; 
  frame-src https://login.microsoftonline.com;
```

## 📊 Analytics and Monitoring Configuration

### Google Analytics 4

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Add to `_app.tsx`:
```javascript
import { gtag } from '../lib/gtag';

useEffect(() => {
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    gtag.pageview(window.location.pathname);
  }
}, []);
```

### Azure Application Insights

```env
NEXT_PUBLIC_APP_INSIGHTS_KEY=your-instrumentation-key
```

### Microsoft Clarity

```env
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-id
```

## 🚀 Performance Configuration

### CDN Configuration

```env
# For assets optimization
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
NEXT_PUBLIC_IMAGES_DOMAIN=yourdomain.com
```

### Caching Headers

```env
# Cache configuration
NEXT_PUBLIC_CACHE_STATIC_ASSETS=31536000
NEXT_PUBLIC_CACHE_API_RESPONSES=300
```

## 🧪 Environment Validation

Create `scripts/validate-env.js`:

```javascript
const requiredEnvVars = [
  'NEXT_PUBLIC_AZURE_CLIENT_ID',
  'NEXT_PUBLIC_AZURE_TENANT_ID',
  'NEXT_PUBLIC_REDIRECT_URI'
];

function validateEnvironment() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`  - ${varName}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

validateEnvironment();
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Azure AD app registration completed
- [ ] Environment variables configured on hosting platform
- [ ] Security headers configured
- [ ] Analytics/monitoring setup (optional)

### Environment Variables Checklist
- [ ] `NEXT_PUBLIC_AZURE_CLIENT_ID` - From Azure AD app registration
- [ ] `NEXT_PUBLIC_AZURE_TENANT_ID` - From Azure AD directory
- [ ] `NEXT_PUBLIC_REDIRECT_URI` - Your production domain
- [ ] `NODE_ENV=production` - Set to production
- [ ] `NEXT_TELEMETRY_DISABLED=1` - Disable Next.js telemetry

### Security Checklist
- [ ] HTTPS enabled on domain
- [ ] Security headers configured
- [ ] CSP policy implemented
- [ ] No sensitive data in client-side code

### Testing Checklist
- [ ] Environment variables accessible in browser
- [ ] Authentication flow works
- [ ] API calls succeed
- [ ] Error handling works

## 🚨 Troubleshooting

### Environment Variable Issues

```javascript
// Add to _app.tsx for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Environment check:', {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
    tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI
  });
}
```

### Common Problems

1. **Variables not loading**
   - Check variable names start with `NEXT_PUBLIC_`
   - Verify deployment rebuilt after adding variables
   - Clear browser cache

2. **Authentication fails**
   - Verify redirect URI matches exactly
   - Check client ID and tenant ID are correct
   - Ensure HTTPS is used in production

3. **API calls fail**
   - Verify Graph endpoint URL
   - Check CORS configuration
   - Validate token scopes

Your environment configuration is now production-ready! 🎉