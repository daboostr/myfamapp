# Azure AD Configuration for Production Deployment

## 🔑 Step-by-Step Azure AD Setup

### 1. Create Azure AD App Registration

1. **Go to Azure Portal**
   - Navigate to [portal.azure.com](https://portal.azure.com)
   - Search for "Azure Active Directory"
   - Select "App registrations" from the left menu

2. **Create New Registration**
   ```
   Name: MyFamApp Photo Sharing
   Supported account types: Accounts in this organizational directory only
   Redirect URI: Web - https://yourdomain.com (or leave blank for now)
   ```

3. **Note Down Required Values**
   - **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 2. Configure Authentication

1. **Go to Authentication tab**
   - Click "Add a platform" → "Web"
   - Add redirect URIs:
     ```
     https://yourdomain.com
     https://yourdomain.com/
     http://localhost:3000 (for development)
     ```

2. **Configure Token Settings**
   - ✅ Check "Access tokens"
   - ✅ Check "ID tokens"
   - ✅ Enable "Allow public client flows"

3. **Advanced Settings**
   - Supported account types: Single tenant
   - Allow public client flows: Yes

### 3. Configure API Permissions

1. **Add Microsoft Graph Permissions**
   ```
   Delegated Permissions:
   - Files.Read
   - Files.Read.All
   - Sites.Read.All
   - User.Read
   - User.ReadBasic.All
   ```

2. **Grant Admin Consent**
   - Click "Grant admin consent for [Your Tenant]"
   - Confirm the action

### 4. Configure Token Settings

1. **Go to Token configuration**
   - Add optional claims if needed
   - Configure group claims (optional)

### 5. Production Environment Variables

Once you have your Azure AD app configured, update your hosting platform with these environment variables:

#### For Azure Static Web Apps:
```bash
# In Azure Portal → Static Web Apps → Configuration
NEXT_PUBLIC_AZURE_CLIENT_ID=your-actual-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-actual-tenant-id
NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.azurestaticapps.net
NEXT_PUBLIC_GRAPH_ENDPOINT=https://graph.microsoft.com
NODE_ENV=production
```

#### For Netlify:
```bash
# In Netlify Dashboard → Site Settings → Environment Variables
NEXT_PUBLIC_AZURE_CLIENT_ID=your-actual-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-actual-tenant-id
NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.netlify.app
NEXT_PUBLIC_GRAPH_ENDPOINT=https://graph.microsoft.com
NODE_ENV=production
```

#### For Other Hosting:
Create `.env.production.local`:
```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your-actual-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-actual-tenant-id
NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.com
NEXT_PUBLIC_GRAPH_ENDPOINT=https://graph.microsoft.com
NODE_ENV=production
```

## 🔒 Security Configuration

### 1. Redirect URI Security
- **Always use HTTPS** in production
- **Exact match required** - no wildcards
- **Add all variants**:
  ```
  https://yourdomain.com
  https://yourdomain.com/
  https://www.yourdomain.com
  https://www.yourdomain.com/
  ```

### 2. CORS Configuration
Azure AD automatically handles CORS for registered redirect URIs.

### 3. Token Validation
Your app automatically validates tokens using MSAL configuration.

## 🧪 Testing Authentication

### 1. Test Login Flow
1. Visit your deployed site
2. Click "Sign In"
3. Authenticate with Microsoft account
4. Verify successful redirect back to app

### 2. Test API Access
1. After login, navigate to Gallery
2. Verify OneDrive photos load
3. Check browser dev tools for any errors

### 3. Test Token Refresh
1. Wait for token to expire (1 hour)
2. Perform an action requiring API access
3. Verify silent token refresh works

## 🚨 Troubleshooting

### Common Issues:

1. **AADSTS50011: Redirect URI mismatch**
   - Ensure exact URL match in Azure AD
   - Check for trailing slashes
   - Verify HTTPS vs HTTP

2. **CORS errors**
   - Add all domain variants to redirect URIs
   - Check if cookies are enabled

3. **Token validation errors**
   - Verify tenant ID and client ID
   - Check if app registration is enabled

4. **Permission denied**
   - Ensure admin consent granted
   - Check API permissions configuration
   - Verify user has access to OneDrive

### Quick Fixes:
```javascript
// Check current configuration in browser console
console.log('Client ID:', process.env.NEXT_PUBLIC_AZURE_CLIENT_ID);
console.log('Tenant ID:', process.env.NEXT_PUBLIC_AZURE_TENANT_ID);
console.log('Redirect URI:', process.env.NEXT_PUBLIC_REDIRECT_URI);
```

## ✅ Production Checklist

- [ ] App registration created
- [ ] Client ID and Tenant ID noted
- [ ] Redirect URIs configured (with HTTPS)
- [ ] API permissions granted
- [ ] Admin consent provided
- [ ] Environment variables set on hosting platform
- [ ] Authentication flow tested
- [ ] API access verified
- [ ] Token refresh validated

## 📋 Domain-Specific Configuration

### Azure Static Web Apps
- Default domain: `https://yourapp.azurestaticapps.net`
- Custom domain: Configure in Azure Portal

### Netlify
- Default domain: `https://yourapp.netlify.app`
- Custom domain: Configure in Netlify Dashboard

### Custom Domain
- Ensure SSL certificate is valid
- Update redirect URIs in Azure AD
- Test authentication after domain change

Your Azure AD configuration is now ready for production deployment!