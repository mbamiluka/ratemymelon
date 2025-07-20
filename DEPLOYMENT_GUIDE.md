# Watermelon Rater - Deployment Guide

This guide covers deploying the Watermelon Rater app to Render with data collection capabilities for training your next AI model.

## Architecture Overview

- **Frontend**: React + Vite (served as static files in production)
- **Backend**: Node.js + Express API server
- **Database**: MongoDB (for storing analysis results and user data)
- **Image Storage**: Cloudinary (for storing watermelon photos)
- **Deployment**: Render (full-stack deployment)

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **MongoDB Atlas**: Set up a free cluster at [mongodb.com](https://www.mongodb.com/atlas)
3. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
4. **GitHub Repository**: Push your code to GitHub

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Create a new cluster in MongoDB Atlas
2. Create a database user with read/write permissions
3. Get your connection string (replace `<password>` with your actual password):
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/watermelon-rater?retryWrites=true&w=majority
   ```

### 2. Cloudinary Setup

1. Sign up for a free Cloudinary account
2. Go to your Dashboard and note down:
   - Cloud Name
   - API Key
   - API Secret

### 3. Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file
4. Set the following environment variables in Render:
   - `MONGODB_URI`: Your MongoDB connection string
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

#### Option B: Manual Setup

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `cd server && npm install && cd .. && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node
4. Add environment variables (same as above)

### 4. Environment Variables

Set these in your Render dashboard:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/watermelon-rater
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Data Collection Features

### What Data is Collected

When users consent, the app collects:

1. **Watermelon Images**: Stored in Cloudinary for training data
2. **Analysis Results**: All AI analysis scores and details
3. **User Interactions**: Anonymous usage analytics
4. **Image Metadata**: Dimensions, format, file size

### Database Schema

```javascript
{
  sessionId: String,           // Unique session identifier
  imageUrl: String,           // Cloudinary URL
  cloudinaryPublicId: String, // For image management
  analysisResults: {
    overallScore: Number,
    fieldSpotColor: { score, description, details },
    stemColor: { score, description, details },
    skinDullness: { score, description, details },
    shapeRatio: { score, description, details },
    webbingDensity: { score, description, details },
    recommendations: [String]
  },
  userConsent: Boolean,
  timestamp: Date,
  imageMetadata: { width, height, format, size }
}
```

### Privacy & Consent

- Users see a consent banner on first visit
- Consent choice is stored locally
- No personal information is collected
- Users can opt-out at any time
- Data is used solely for AI model improvement

## API Endpoints

### POST /api/analyze
Upload analysis data and images for training.

**Request:**
- `image`: Image file (multipart/form-data)
- `analysisResults`: JSON string of analysis results
- `userConsent`: Boolean consent flag
- `sessionId`: Unique session identifier

**Response:**
```json
{
  "success": true,
  "message": "Analysis data saved successfully",
  "imageUrl": "https://res.cloudinary.com/...",
  "analysisId": "watermelon_session_123_456"
}
```

### GET /api/analytics
Get aggregated analytics data (for admin use).

**Response:**
```json
{
  "totalAnalyses": 1250,
  "recentAnalyses": 45,
  "averageScores": {
    "avgOverallScore": 72.5,
    "avgFieldSpot": 68.2,
    "avgStem": 71.8,
    "avgSkin": 75.1,
    "avgShape": 69.3,
    "avgWebbing": 66.7
  }
}
```

### GET /api/health
Health check endpoint.

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your credentials
   ```

3. **Run development servers:**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   npm run server:dev
   ```

4. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Monitoring & Analytics

### Built-in Analytics

The app tracks:
- App launches
- Image uploads/captures
- Analysis completions
- User consent decisions
- Tab switches and resets

### Accessing Data

1. **MongoDB Compass**: Connect to your Atlas cluster to view raw data
2. **Analytics API**: Use `/api/analytics` endpoint for aggregated stats
3. **Cloudinary Console**: View uploaded images and usage stats

## Scaling Considerations

### Free Tier Limits

- **Render**: 750 hours/month, sleeps after 15min inactivity
- **MongoDB Atlas**: 512MB storage, shared cluster
- **Cloudinary**: 25GB storage, 25GB bandwidth/month

### Upgrading for Production

1. **Render**: Upgrade to paid plan for always-on service
2. **MongoDB**: Upgrade to dedicated cluster for better performance
3. **Cloudinary**: Upgrade for more storage and transformations

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- Helmet.js for security headers
- File type validation for uploads
- Input sanitization and validation
- CORS configuration
- Environment variable protection

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are in package.json
2. **Database Connection**: Verify MongoDB URI and network access
3. **Image Upload Fails**: Check Cloudinary credentials
4. **CORS Errors**: Ensure frontend URL is in CORS whitelist

### Logs

Check Render logs for:
- Build process errors
- Runtime errors
- Database connection issues
- API request failures

## Next Steps

Once deployed and collecting data:

1. **Monitor Usage**: Check analytics regularly
2. **Export Training Data**: Use MongoDB exports for model training
3. **Improve Model**: Use collected data to train better models
4. **A/B Testing**: Test different analysis algorithms
5. **User Feedback**: Add feedback collection for model validation

## Support

For issues with:
- **Render**: Check [Render docs](https://render.com/docs)
- **MongoDB**: Check [MongoDB Atlas docs](https://docs.atlas.mongodb.com/)
- **Cloudinary**: Check [Cloudinary docs](https://cloudinary.com/documentation)