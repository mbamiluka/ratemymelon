# Environment Variables Setup Guide - RateMyMelon

## 🚨 **YOU MUST MANUALLY SET ENVIRONMENT VARIABLES**

**Environment variables are NOT automatically deployed.** You need to manually configure them in each platform's dashboard.

## 🎯 Why Manual Setup is Required

### Security Reasons:
- **Credentials are sensitive** - Never stored in code repositories
- **Platform isolation** - Each deployment environment needs its own config
- **Access control** - Only authorized users can set production variables

### What's NOT Automated:
- ❌ Environment variables are not pushed to Git (`.env` files are ignored)
- ❌ Render doesn't automatically read your local `.env` files
- ❌ No magic deployment of secrets

## 🔧 Manual Setup Required for Each Platform

### 1. **Render** (Your Main Deployment)
**Location**: Render Dashboard → Your Service → Environment

**Required Variables to Set Manually:**
```
MONGODB_URI=mongodb+srv://mbamiluka:9pdenuQxjImRQXRj@ratemy...
CLOUDINARY_CLOUD_NAME=dcewz2dat
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secure-random-jwt-secret-here
CORS_ORIGIN=https://your-app-name.onrender.com
```

**Steps:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your RateMyMelon service
3. Click "Environment" tab
4. Add each variable manually
5. Click "Save Changes"

### 2. **Vercel** (Alternative Frontend Deployment)
**Location**: Vercel Dashboard → Project → Settings → Environment Variables

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable for Production, Preview, and Development

### 3. **Netlify** (Alternative Frontend Deployment)
**Location**: Netlify Dashboard → Site → Environment Variables

**Steps:**
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to Site Settings → Environment Variables
4. Add each variable manually

## 📋 What IS Automated vs Manual

### ✅ **Automated** (Already Done):
- **Code deployment** - GitHub pushes trigger automatic builds
- **Dependencies installation** - `npm install` runs automatically
- **Build process** - `npm run build` executes automatically
- **Service startup** - Your app starts with `npm start`

### ❌ **Manual** (You Must Do):
- **Environment variables** - Set in each platform's dashboard
- **Domain configuration** - Custom domains need manual setup
- **SSL certificates** - Custom domains need manual SSL setup
- **Database connections** - MongoDB URI must be manually configured

## 🔐 Your Current Environment Variables

### From Your Local `.env` File:
```bash
# These are in your server/.env but NOT automatically deployed
MONGODB_URI=mongodb+srv://mbamiluka:9pdenuQxjImRQXRj@ratemy...
CLOUDINARY_CLOUD_NAME=dcewz2dat
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### What You Need to Copy to Render:
1. **Copy each variable name and value**
2. **Paste into Render's Environment tab**
3. **Update CORS_ORIGIN** to your Render URL
4. **Change NODE_ENV** to `production`

## 🛠️ Step-by-Step Render Setup

### Step 1: Get Your Cloudinary Credentials
1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up/login
3. Copy from dashboard:
   - Cloud Name: `dcewz2dat` (you have this)
   - API Key: `your_api_key` (get this)
   - API Secret: `your_api_secret` (get this)

### Step 2: Set Variables in Render
1. **Login to Render**: [dashboard.render.com](https://dashboard.render.com)
2. **Create/Select Service**: Connect your GitHub repo
3. **Go to Environment Tab**
4. **Add Each Variable**:
   ```
   Key: MONGODB_URI
   Value: mongodb+srv://mbamiluka:9pdenuQxjImRQXRj@ratemy...
   
   Key: CLOUDINARY_CLOUD_NAME
   Value: dcewz2dat
   
   Key: CLOUDINARY_API_KEY
   Value: [your_cloudinary_api_key]
   
   Key: CLOUDINARY_API_SECRET
   Value: [your_cloudinary_api_secret]
   
   Key: NODE_ENV
   Value: production
   
   Key: PORT
   Value: 3001
   
   Key: JWT_SECRET
   Value: [generate_random_secure_string]
   
   Key: CORS_ORIGIN
   Value: https://your-app-name.onrender.com
   ```

### Step 3: Deploy
1. **Save Environment Variables**
2. **Trigger Deployment** (automatic after saving)
3. **Monitor Logs** for any errors

## ⚠️ Common Mistakes

### ❌ **Don't Do This:**
- Don't commit `.env` files to Git
- Don't assume variables deploy automatically
- Don't use localhost URLs in production
- Don't use development secrets in production

### ✅ **Do This:**
- Manually set each variable in platform dashboards
- Use production URLs for CORS_ORIGIN
- Generate secure, random JWT secrets
- Test each environment separately

## 🎯 Summary

**Environment variables require manual setup in each platform's dashboard.** This is by design for security reasons. Your code is automatically deployed, but secrets must be manually configured to prevent accidental exposure.

**Next Steps:**
1. Get Cloudinary credentials
2. Set all variables in Render dashboard
3. Deploy and test your application