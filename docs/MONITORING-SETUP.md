# Production Monitoring & Analytics Setup

## 📊 Analytics Implementation

### 1. Google Analytics 4 Setup

#### Installation
```javascript
// lib/gtag.js
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const pageview = (url) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
```

#### Integration in _app.tsx
```javascript
// pages/_app.tsx
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import * as gtag from '../lib/gtag';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {/* Google Analytics */}
      {gtag.GA_TRACKING_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gtag.GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      
      <Component {...pageProps} />
    </>
  );
}
```

#### Event Tracking
```javascript
// Track user interactions
import * as gtag from '../lib/gtag';

// In Gallery.tsx
const handleImageClick = (imageId) => {
  gtag.event({
    action: 'image_view',
    category: 'engagement',
    label: imageId,
  });
};

// In auth service
const handleLogin = () => {
  gtag.event({
    action: 'login',
    category: 'authentication',
    label: 'microsoft',
  });
};

// Track errors
const handleError = (error, component) => {
  gtag.event({
    action: 'error',
    category: 'application',
    label: `${component}: ${error.message}`,
  });
};
```

### 2. Microsoft Clarity Setup

#### Installation
```javascript
// lib/clarity.js
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export const initClarity = () => {
  if (typeof window !== 'undefined' && CLARITY_PROJECT_ID) {
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
  }
};
```

#### Integration
```javascript
// pages/_app.tsx
import { initClarity } from '../lib/clarity';

useEffect(() => {
  initClarity();
}, []);
```

### 3. Azure Application Insights

#### Installation
```javascript
// lib/appInsights.js
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.NEXT_PUBLIC_APP_INSIGHTS_KEY,
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
  }
});

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APP_INSIGHTS_KEY) {
  appInsights.loadAppInsights();
}

export { appInsights };
```

#### Custom Tracking
```javascript
// Track authentication events
import { appInsights } from '../lib/appInsights';

export const trackAuthenticationEvent = (eventName, properties = {}) => {
  appInsights.trackEvent({
    name: eventName,
    properties: {
      timestamp: new Date().toISOString(),
      ...properties
    }
  });
};

// Track API calls
export const trackAPICall = (endpoint, duration, success) => {
  appInsights.trackDependency({
    target: endpoint,
    name: 'Microsoft Graph API',
    data: endpoint,
    duration: duration,
    success: success,
    resultCode: success ? 200 : 500,
  });
};

// Track errors
export const trackError = (error, severityLevel = 2) => {
  appInsights.trackException({
    exception: error,
    severityLevel: severityLevel,
    properties: {
      component: 'MyFamApp',
      timestamp: new Date().toISOString()
    }
  });
};
```

## 🚨 Error Tracking & Monitoring

### 1. Enhanced Error Boundary with Tracking

```javascript
// components/ErrorBoundary.tsx - Enhanced version
import React from 'react';
import * as gtag from '../lib/gtag';
import { trackError } from '../lib/appInsights';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error in analytics
    gtag.event({
      action: 'react_error',
      category: 'error',
      label: error.message,
    });

    // Track in Application Insights
    trackError(error, 3); // High severity

    // Log detailed error info
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We've been notified and are working on a fix.</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Reload Page
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details (Development)</summary>
              <pre>{this.state.error?.stack}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. API Error Monitoring

```javascript
// Enhanced data.ts with monitoring
import { trackAPICall, trackError } from '../lib/appInsights';

export const makeGraphRequest = async (endpoint: string) => {
  const startTime = Date.now();
  
  try {
    const token = await getValidToken();
    if (!token) {
      throw new Error('Authentication failed');
    }

    const response = await fetch(`${GRAPH_ENDPOINT}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    const duration = Date.now() - startTime;
    const success = response.ok;

    // Track API call performance
    trackAPICall(endpoint, duration, success);

    if (!success) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Track failed API call
    trackAPICall(endpoint, duration, false);
    trackError(error as Error, 2);

    throw error;
  }
};
```

### 3. Performance Monitoring

```javascript
// lib/performance.js
import { appInsights } from './appInsights';

// Track Core Web Vitals
export const trackWebVitals = (metric) => {
  // Send to Application Insights
  appInsights.trackMetric({
    name: metric.name,
    average: metric.value,
    properties: {
      id: metric.id,
      navigationType: metric.navigationType,
    }
  });

  // Send to Google Analytics
  gtag.event(metric.name, {
    value: Math.round(metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
};

// Track custom performance metrics
export const trackLoadTime = (componentName, loadTime) => {
  appInsights.trackMetric({
    name: 'component_load_time',
    average: loadTime,
    properties: {
      component: componentName,
      timestamp: new Date().toISOString()
    }
  });
};

// Track user interactions
export const trackUserInteraction = (action, element) => {
  appInsights.trackEvent({
    name: 'user_interaction',
    properties: {
      action,
      element,
      timestamp: new Date().toISOString(),
      url: window.location.pathname
    }
  });
};
```

## 📈 Custom Dashboards

### 1. Application Insights Queries

```kusto
// User engagement metrics
customEvents
| where name == "user_interaction"
| summarize count() by tostring(customDimensions.action), bin(timestamp, 1h)
| render timechart

// Error rate over time
exceptions
| summarize ErrorCount = count() by bin(timestamp, 5m)
| render timechart

// API performance
dependencies
| where target contains "graph.microsoft.com"
| summarize avg(duration), percentile(duration, 95) by bin(timestamp, 5m)
| render timechart

// Authentication success rate
customEvents
| where name in ("login_success", "login_failure")
| summarize count() by name, bin(timestamp, 1h)
| render columnchart
```

### 2. Google Analytics Custom Events

```javascript
// Track photo sharing features
gtag.event('photo_share', {
  event_category: 'engagement',
  event_label: 'social_media',
});

// Track performance milestones
gtag.event('page_load_time', {
  event_category: 'performance',
  value: loadTime,
  custom_parameter_1: 'gallery_page'
});

// Track user preferences
gtag.event('setting_change', {
  event_category: 'customization',
  event_label: settingName,
  value: settingValue
});
```

## 🔔 Alerting Setup

### 1. Azure Alerts

```json
{
  "alertRules": [
    {
      "name": "High Error Rate",
      "condition": "exceptions | summarize count() | where count_ > 10",
      "frequency": "PT5M",
      "severity": 2
    },
    {
      "name": "Slow API Responses",
      "condition": "dependencies | where duration > 5000",
      "frequency": "PT1M",
      "severity": 1
    }
  ]
}
```

### 2. Custom Health Checks

```javascript
// pages/api/health.js
export default function handler(req, res) {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'healthy',
      authentication: 'healthy',
      external_apis: 'healthy'
    }
  };

  res.status(200).json(healthCheck);
}
```

## 📋 Monitoring Checklist

### Analytics Setup
- [ ] Google Analytics 4 configured
- [ ] Microsoft Clarity installed
- [ ] Azure Application Insights connected
- [ ] Custom event tracking implemented
- [ ] Performance metrics tracked

### Error Monitoring
- [ ] Error boundaries with tracking
- [ ] API error monitoring
- [ ] Client-side error capture
- [ ] Error alerting configured

### Performance Monitoring
- [ ] Core Web Vitals tracking
- [ ] Custom performance metrics
- [ ] API response time monitoring
- [ ] Bundle size monitoring

### Health Monitoring
- [ ] Uptime monitoring
- [ ] Health check endpoints
- [ ] Alert rules configured
- [ ] Dashboard created

Your monitoring and analytics setup is now complete! 📊