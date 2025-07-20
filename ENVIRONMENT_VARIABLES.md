# Environment Variables Guide

This document explains all environment variables used in RateMyMelon and how to set them up for different deployment scenarios.

## 🔐 Security Notice

**NEVER commit actual environment variable values to Git!** Always use `.env.example` files with placeholder values and keep your actual `.env` files in `.gitignore`.

## 📁 Environment Files Structure

```
ratemymelon/
├── .env.example          # Frontend environment template
├── .env                  # Frontend environment (create from .env.example)
├── server/.env.example   # Backend environment template
└── server/.env           # Backend environment (create from server/.env.example)
```

## 🖥️ Frontend Environment Variables

### Required for Development

Copy `.env.example` to `.env` and configure:

```bash
# Copy the template
cp .env.example .env
```

### Frontend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_NODE_ENV` | No | `development` | Environment mode |
| `VITE_API_BASE_URL` | No | `http://localhost:3001` | Backend API URL |
| `VITE_GOOGLE_ANALYTICS_ID` | No | - | Google Analytics tracking ID |
| `VITE_SENTRY_DSN` | No | - | Sentry error tracking DSN |
| `VITE_ENABLE_ANALYTICS` | No | `true` | Enable/disable analytics |
| `VITE_ENABLE_DATA_COLLECTION` | No | `true` | Enable/disable data collection |

### Example Frontend `.env`

```env
VITE_NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DATA_COLLECTION=true
```

## 🔧 Backend Environment Variables

### Required for Development

Copy `server/.env.example` to `server/.env` and configure:

```bash
# Copy the template
cp server/.env.example server/.env
```

### Backend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `MONGODB_URI` | **Yes** | - | MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | **Yes** | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | **Yes** | - | Cloudinary API secret |
| `GOOGLE_ANALYTICS_ID` | No | - | Google Analytics ID |
| `JWT_SECRET` | No | `random-secret` | JWT signing secret |
| `CORS_ORIGIN` | No | `*` | CORS allowed origins |

### Example Backend `.env`

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ratemymelon?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
#GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## 🐳 Docker Environment Variables

For Docker deployment, you can also set these in a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGO_INITDB_USER=ratemymelon_user
MONGO_INITDB_PASSWORD=your-app-password

# Application Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your-jwt-secret
```

## ☁️ Production Deployment

### Render Deployment

Set these environment variables in your Render dashboard:

#### Required Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ratemymelon?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Optional Variables
```
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-domain.com
```

### Other Cloud Providers

For AWS, Google Cloud, Azure, etc., set environment variables through their respective dashboards or CLI tools.

## 🔑 How to Obtain API Keys

### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string from "Connect" → "Connect your application"
5. Replace `<username>`, `<password>`, and `<cluster>` with your values

### Cloudinary
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard
4. Copy Cloud Name, API Key, and API Secret

### Google Analytics (Optional)
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property
3. Get the Measurement ID (starts with G-)

## 🛡️ Security Best Practices

### Strong Secrets
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate secure MongoDB password
openssl rand -base64 32
```

### Environment-Specific Configuration

#### Development
- Use local MongoDB or MongoDB Atlas free tier
- Use Cloudinary free tier
- Enable debug logging
- Allow CORS from localhost

#### Production
- Use production MongoDB cluster
- Use environment variables for all secrets
- Disable debug logging
- Restrict CORS to your domain
- Use HTTPS only

## 🔍 Troubleshooting

### Common Issues

#### "MongoDB connection failed"
- Check `MONGODB_URI` format
- Ensure database user has correct permissions
- Verify network access (IP whitelist)

#### "Cloudinary upload failed"
- Verify all three Cloudinary variables are set
- Check API key permissions
- Ensure cloud name is correct

#### "CORS error"
- Set `CORS_ORIGIN` to your frontend URL
- In development: `http://localhost:5173`
- In production: `https://your-domain.com`

### Validation Script

Create a script to validate your environment:

```javascript
// validate-env.js
const requiredVars = [
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}
```

Run with: `node validate-env.js`

## 📝 Environment Variable Checklist

### Before Development
- [ ] Copy `.env.example` to `.env`
- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Set up MongoDB Atlas account
- [ ] Set up Cloudinary account
- [ ] Configure all required backend variables
- [ ] Test database connection
- [ ] Test image upload functionality

### Before Production Deployment
- [ ] Set all environment variables in deployment platform
- [ ] Use production MongoDB cluster
- [ ] Generate secure JWT secret
- [ ] Configure CORS for production domain
- [ ] Test all functionality in staging environment
- [ ] Verify no secrets are committed to Git

### Security Audit
- [ ] No hardcoded secrets in code
- [ ] All `.env` files in `.gitignore`
- [ ] Strong passwords and secrets
- [ ] Minimal database permissions
- [ ] CORS properly configured
- [ ] HTTPS enabled in production

## 🆘 Getting Help

If you encounter issues with environment variables:

1. Check this guide first
2. Verify all required variables are set
3. Check the troubleshooting section
4. Create an issue on GitHub with:
   - Your deployment platform
   - Error messages (without exposing secrets)
   - Steps you've already tried

Remember: Never share actual environment variable values in issues or public forums!