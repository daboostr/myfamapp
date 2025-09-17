/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // Image optimization (disabled for static export)
  images: {
    unoptimized: true
  },
  
  // Performance optimizations
  swcMinify: true,
  
  // Bundle optimization
  experimental: {
    esmExternals: false
  },
  
  // Webpack configuration for bundle analysis
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analysis in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
          reportFilename: isServer 
            ? '../reports/server-bundle-report.html'
            : '../reports/client-bundle-report.html'
        })
      )
    }
    
    // Tree shaking optimizations
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false
    }
    
    // Code splitting optimizations
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true
          },
          common: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true
          }
        }
      }
    }
    
    return config
  },
  
  // Performance monitoring headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options', 
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString()
  }
}

module.exports = withBundleAnalyzer(nextConfig)