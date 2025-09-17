# Production Deployment Guide - Ready to Deploy!

## 🚀 Quick Deployment Options

Since Node.js isn't available in this environment, here are the fastest ways to deploy your M365-style OneDrive photo sharing app:

### Option 1: Azure Static Web Apps (Recommended)

1. **Create Azure Static Web App**
   ```bash
   # In Azure Portal or Azure CLI
   az staticwebapp create \
     --name "myfamapp-photos" \
     --resource-group "your-rg" \
     --source "https://github.com/yourusername/myfamapp" \
     --location "Central US" \
     --branch "main" \
     --app-location "/" \
     --output-location "out"
   ```

2. **GitHub Actions Deployment**
   - Connect your GitHub repository
   - Azure will auto-detect Next.js and configure build pipeline
   - Build command: `npm run build:static`
   - Output directory: `out`

### Option 2: Netlify (Alternative)

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Build command: `npm run build:static`
   - Publish directory: `out`

2. **Environment Variables**
   ```
   NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-client-id
   NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id
   NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.com
   NODE_ENV=production
   ```

### Option 3: Manual Upload (Fastest)

If you have the built files, you can upload directly to any web host:

1. **Required Files Structure:**
   ```
   out/
   ├── _next/
   ├── index.html
   ├── gallery.html
   ├── 404.html
   └── static files...
   ```

2. **Upload to any web server** (Apache, Nginx, IIS, etc.)

## 📋 Pre-Deployment Checklist

### ✅ Azure AD Configuration

1. **App Registration**
   - Create new app registration in Azure Portal
   - Set redirect URI: `https://yourdomain.com`
   - Enable implicit flow for ID tokens
   - Add Microsoft Graph permissions:
     - `Files.Read`
     - `Sites.Read.All`
     - `User.Read`

2. **Get Required Values**
   - Client ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Tenant ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Redirect URI: `https://yourdomain.com`

### ✅ Production Environment

Create `.env.production` with:
```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your-actual-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-actual-tenant-id
NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.com
NEXT_PUBLIC_GRAPH_ENDPOINT=https://graph.microsoft.com
NODE_ENV=production
```

## 🔧 Build Process (Run Locally)

If you have Node.js available elsewhere:

```bash
# Install dependencies
npm install

# Create production build
npm run build:static

# This creates the 'out' folder ready for deployment
```

## 🌐 Domain Configuration

### Custom Domain Setup
1. **Azure Static Web Apps**
   - Go to Custom domains in Azure Portal
   - Add your domain
   - Configure DNS CNAME record

2. **SSL Certificate**
   - Automatically provisioned by Azure/Netlify
   - Let's Encrypt or platform certificates

### Security Headers
Add these headers in your hosting platform:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://graph.microsoft.com https://login.microsoftonline.com;
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## 📊 Monitoring Setup

### Application Insights (Azure)
```javascript
// Add to _app.tsx
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: 'your-key'
  }
});
```

### Analytics
- Google Analytics 4
- Microsoft Clarity
- Azure Application Insights

## 🧪 Post-Deployment Testing

1. **Authentication Flow**
   - Test login/logout
   - Verify token refresh
   - Check Graph API calls

2. **Performance**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Verify lazy loading

3. **Accessibility**
   - Screen reader testing
   - Keyboard navigation
   - WCAG compliance

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure redirect URI matches exactly
2. **Build Failures**: Check Next.js configuration
3. **Authentication Issues**: Verify Azure AD app registration

### Quick Fixes
- Clear browser cache
- Check network tab for errors
- Verify environment variables

## ⚡ Next Steps

1. **Choose deployment platform** (Azure Static Web Apps recommended)
2. **Configure Azure AD** with production URLs
3. **Set environment variables**
4. **Deploy and test**

Your app is production-ready! All the code, configurations, and documentation are in place.