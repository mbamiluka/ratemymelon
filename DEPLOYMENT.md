# 🚀 Deployment Guide - Watermelon Rater

This guide covers deploying the Watermelon Rater app to various platforms.

## Quick Deploy Options

### 🔥 Vercel (Recommended)
**One-click deployment with optimal performance**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Custom Domain** (Optional)
   ```bash
   vercel domains add your-domain.com
   vercel alias your-deployment-url.vercel.app your-domain.com
   ```

**Features:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions ready
- ✅ Perfect PWA support

### 🌐 Netlify
**Great for static sites with form handling**

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Or drag & drop** the `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)

**Features:**
- ✅ Form handling
- ✅ Split testing
- ✅ Analytics
- ✅ Edge functions

### 📱 GitHub Pages
**Free hosting for open source projects**

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/watermelon-rater"
   }
   ```

3. **Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

## Platform-Specific Configurations

### Mobile App Stores

#### 📱 iOS App Store (PWA)
1. Users can "Add to Home Screen" from Safari
2. App behaves like native iOS app
3. Offline functionality included
4. Camera access works seamlessly

#### 🤖 Google Play Store (TWA)
1. **Install Bubblewrap**
   ```bash
   npm install -g @bubblewrap/cli
   ```

2. **Initialize TWA**
   ```bash
   bubblewrap init --manifest https://your-domain.com/manifest.webmanifest
   ```

3. **Build APK**
   ```bash
   bubblewrap build
   ```

4. **Upload to Play Console**

### Desktop Deployment

#### 💻 Electron App
1. **Install Electron**
   ```bash
   npm install --save-dev electron electron-builder
   ```

2. **Create main.js**
   ```javascript
   const { app, BrowserWindow } = require('electron')
   
   function createWindow() {
     const win = new BrowserWindow({
       width: 1200,
       height: 800,
       webPreferences: {
         nodeIntegration: false,
         contextIsolation: true
       }
     })
     win.loadFile('dist/index.html')
   }
   
   app.whenReady().then(createWindow)
   ```

3. **Build**
   ```bash
   npm run build
   electron-builder
   ```

## Performance Optimization

### Bundle Analysis
```bash
npm install --save-dev rollup-plugin-analyzer
npm run build -- --analyze
```

### Code Splitting
The app already implements dynamic imports for ML models:
```javascript
const { analyzeWatermelon } = await import('./utils/watermelonAnalyzer')
```

### Caching Strategy
- **Static assets**: 1 year cache
- **ML models**: Cached after first load
- **Service worker**: Updates automatically

## Environment Variables

### Production Settings
```bash
# .env.production
VITE_API_URL=https://api.watermelon-rater.com
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Development Settings
```bash
# .env.development
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

## Monitoring & Analytics

### Error Tracking
```bash
npm install @sentry/react @sentry/tracing
```

### Performance Monitoring
```bash
npm install web-vitals
```

### Usage Analytics
```bash
npm install @google-analytics/gtag
```

## Security Headers

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: blob:;">
```

### Additional Headers
Already configured in `netlify.toml` and `vercel.json`:
- Cross-Origin-Embedder-Policy
- Cross-Origin-Opener-Policy
- X-Frame-Options
- X-Content-Type-Options

## Testing Deployment

### Lighthouse Audit
```bash
npm install -g lighthouse
lighthouse https://your-domain.com --view
```

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100

### Cross-Browser Testing
- ✅ Chrome 80+
- ✅ Safari 13+
- ✅ Firefox 75+
- ✅ Edge 80+

### Mobile Testing
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Samsung Internet
- ✅ Opera Mobile

## Troubleshooting

### Common Issues

#### 1. Camera Not Working
**Problem**: Camera access denied
**Solution**: Ensure HTTPS deployment and proper permissions

#### 2. ML Models Not Loading
**Problem**: CORS errors with TensorFlow.js
**Solution**: Check Cross-Origin headers in deployment config

#### 3. PWA Not Installing
**Problem**: Service worker registration failed
**Solution**: Verify manifest.json and HTTPS requirement

#### 4. Large Bundle Size
**Problem**: App loads slowly
**Solution**: Implement code splitting and lazy loading

### Debug Commands
```bash
# Check bundle size
npm run build -- --analyze

# Test PWA features
npm install -g pwa-asset-generator
pwa-asset-generator logo.svg ./public --manifest ./public/manifest.json

# Validate service worker
npm install -g workbox-cli
workbox wizard
```

## Scaling Considerations

### CDN Setup
- Use Cloudflare or AWS CloudFront
- Cache ML models at edge locations
- Optimize image delivery

### API Integration
```javascript
// Future API integration
const API_BASE = import.meta.env.VITE_API_URL

export async function saveAnalysis(results) {
  return fetch(`${API_BASE}/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results)
  })
}
```

### Database Integration
- Store user preferences
- Cache analysis results
- Collect improvement data

## Maintenance

### Updates
```bash
# Update dependencies
npm update

# Security audit
npm audit fix

# Rebuild and redeploy
npm run build
vercel --prod
```

### Monitoring
- Set up uptime monitoring
- Track Core Web Vitals
- Monitor error rates
- Analyze user feedback

---

## 🎉 Ready to Deploy!

Your Watermelon Rater app is production-ready with:
- ✅ Cross-platform compatibility
- ✅ PWA capabilities
- ✅ Offline functionality
- ✅ Mobile-first design
- ✅ AI-powered analysis
- ✅ Optimized performance

Choose your preferred deployment method and launch your watermelon rating service! 🍉