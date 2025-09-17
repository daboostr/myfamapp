# M365-Style OneDrive Photo Sharing App

A modern, production-ready photo sharing application that connects to Microsoft OneDrive, built with Next.js and featuring a Microsoft 365-inspired design.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-18-blue)

## ✨ Features

### 🔐 **Enterprise Authentication**
- **Microsoft Azure AD** integration with MSAL
- **Single Sign-On (SSO)** support
- **Token refresh** and session management
- **Role-based access** control

### 📸 **Photo Gallery**
- **OneDrive integration** via Microsoft Graph API
- **Lazy loading** for optimal performance
- **Grid view** with responsive design
- **Full-screen preview** with keyboard navigation
- **People-based organization** and filtering

### 🚀 **Performance & Accessibility**
- **WCAG 2.1 AA compliant** accessibility features
- **Keyboard navigation** support
- **Lazy loading** with intersection observer
- **Code splitting** and bundle optimization
- **Core Web Vitals** optimized

### 🛡️ **Security & Production Ready**
- **Content Security Policy (CSP)** implementation
- **Security headers** configuration
- **Environment variable** validation
- **Error boundaries** and graceful error handling
- **Bundle size monitoring** and performance budgets

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Azure AD application registration
- Microsoft 365 account with OneDrive access

### Installation

```bash
# Clone the repository
git clone https://github.com/daboostr/myfamapp.git
cd myfamapp

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Azure AD configuration
```

### Environment Configuration

Create `.env.local` with your Azure AD settings:

```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_GRAPH_ENDPOINT=https://graph.microsoft.com
```

### Azure AD Setup

1. **Create App Registration** in Azure Portal
2. **Configure Authentication** with redirect URIs
3. **Add API Permissions** for Microsoft Graph:
   - `Files.Read`
   - `Sites.Read.All`
   - `User.Read`
4. **Grant admin consent** for the permissions

📖 **Detailed setup guide**: [docs/AZURE-AD-SETUP.md](docs/AZURE-AD-SETUP.md)

### Development

```bash
# Start development server
npm run dev

# Run with debugging
npm run dev:debug

# Lint and format code
npm run lint
npm run format
```

### Production Build

```bash
# Create optimized production build
npm run build:static

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

## 🌐 Deployment

### Azure Static Web Apps (Recommended)

1. **Connect GitHub repository** to Azure Static Web Apps
2. **Configure build settings**:
   - Build command: `npm run build:static`
   - Output directory: `out`
3. **Set environment variables** in Azure Portal
4. **Deploy automatically** on push to main branch

### Netlify

1. **Connect repository** to Netlify
2. **Use included configuration** (`netlify.toml`)
3. **Set environment variables** in Netlify dashboard
4. **Deploy automatically** on push

### Manual Deployment

```bash
# Create production build
npm run build:static

# Upload 'out' folder to your web server
```

📖 **Complete deployment guide**: [DEPLOY-NOW.md](DEPLOY-NOW.md)

## 📁 Project Structure

```
├── 📄 pages/                 # Next.js pages
│   ├── index.tsx            # Home page with authentication
│   ├── _app.tsx             # App wrapper with providers
│   └── 404.tsx              # Error page
├── 🧩 src/
│   ├── components/          # React components
│   │   ├── Gallery.tsx      # Photo gallery with lazy loading
│   │   ├── PreviewDialog.tsx # Full-screen photo preview
│   │   ├── PeoplePanel.tsx  # People filtering sidebar
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── services/           # API and authentication services
│   │   ├── auth.ts         # MSAL authentication
│   │   ├── data.ts         # Microsoft Graph API
│   │   └── grouping.ts     # Photo organization logic
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── state/              # State management
│   └── models/             # TypeScript interfaces
├── 📚 docs/                # Documentation
├── 🧪 tests/               # Test suites
├── 🛠️ scripts/            # Build and deployment scripts
└── 📋 specs/               # Feature specifications
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run accessibility tests
npm run test:a11y

# Run end-to-end tests
npm run test:e2e

# Validate performance
npm run validate:performance

# Security audit
npm audit
```

## 📊 Performance

- **Bundle Size**: Main bundle < 500KB, total < 2MB
- **Lighthouse Score**: Performance > 90, Accessibility > 95
- **Core Web Vitals**: All metrics in green
- **Load Time**: < 3 seconds on 3G networks

## 🛡️ Security

- **Content Security Policy** implemented
- **Security headers** configured
- **Environment variables** properly secured
- **Dependency vulnerability** scanning
- **No secrets** exposed in client-side code

## 🎯 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- 📱 Mobile browsers (iOS Safari, Chrome Mobile)

## 📖 Documentation

- **[Quick Start Guide](specs/001-title-m365-style/quickstart.md)** - Get running in 5 minutes
- **[Azure AD Setup](docs/AZURE-AD-SETUP.md)** - Authentication configuration
- **[Deployment Guide](DEPLOY-NOW.md)** - Production deployment
- **[Environment Config](docs/ENVIRONMENT-CONFIG.md)** - Environment setup
- **[Performance Guide](docs/PRODUCTION-OPTIMIZATIONS.md)** - Optimization strategies
- **[Monitoring Setup](docs/MONITORING-SETUP.md)** - Analytics and monitoring

## 🔧 Configuration

### Build Configuration

The app supports multiple build targets:

- **Development**: Fast builds with source maps
- **Production**: Optimized builds with minification
- **Static Export**: For hosting on CDNs and static hosts

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_AZURE_CLIENT_ID` | Azure AD application client ID | ✅ |
| `NEXT_PUBLIC_AZURE_TENANT_ID` | Azure AD tenant ID | ✅ |
| `NEXT_PUBLIC_REDIRECT_URI` | Authentication redirect URI | ✅ |
| `NEXT_PUBLIC_GRAPH_ENDPOINT` | Microsoft Graph API endpoint | ✅ |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | ❌ |

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow **TypeScript** best practices
- Maintain **accessibility** standards (WCAG 2.1 AA)
- Write **tests** for new features
- Update **documentation** as needed
- Ensure **performance** budgets are met

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: Check the `docs/` directory
- 🐛 **Issues**: [GitHub Issues](https://github.com/daboostr/myfamapp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/daboostr/myfamapp/discussions)

## 🙏 Acknowledgments

- **Microsoft** for Azure AD and Graph API
- **Next.js** team for the amazing framework
- **React** community for component patterns
- **Accessibility** community for WCAG guidelines

---

**Built with ❤️ for modern photo sharing experiences**

## 🎉 Ready for Production

This application is **production-ready** with:

- ✅ Enterprise-grade authentication
- ✅ Performance optimization
- ✅ Security hardening
- ✅ Accessibility compliance
- ✅ Comprehensive monitoring
- ✅ Complete documentation
- ✅ Automated testing

**Deploy now and start sharing photos securely!** 🚀