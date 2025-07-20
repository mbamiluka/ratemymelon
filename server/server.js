import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

app.use(limiter)
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('MongoDB connected successfully')
    } else {
      console.log('MongoDB URI not provided, running without database')
    }
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }
}

// Database schemas
const AnalysisSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  imageUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  analysisResults: {
    overallScore: Number,
    fieldSpotColor: {
      score: Number,
      description: String,
      details: mongoose.Schema.Types.Mixed
    },
    stemColor: {
      score: Number,
      description: String,
      details: mongoose.Schema.Types.Mixed
    },
    skinDullness: {
      score: Number,
      description: String,
      details: mongoose.Schema.Types.Mixed
    },
    shapeRatio: {
      score: Number,
      description: String,
      details: mongoose.Schema.Types.Mixed
    },
    webbingDensity: {
      score: Number,
      description: String,
      details: mongoose.Schema.Types.Mixed
    },
    recommendations: [String]
  },
  userConsent: { type: Boolean, required: true },
  userAgent: String,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now },
  imageMetadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number
  }
})

const Analysis = mongoose.model('Analysis', AnalysisSchema)

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Upload and store analysis data
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { analysisResults, userConsent, sessionId } = req.body
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    if (!userConsent || userConsent !== 'true') {
      return res.status(400).json({ error: 'User consent required for data collection' })
    }

    if (!analysisResults) {
      return res.status(400).json({ error: 'Analysis results required' })
    }

    // Parse analysis results if it's a string
    let parsedResults
    try {
      parsedResults = typeof analysisResults === 'string' 
        ? JSON.parse(analysisResults) 
        : analysisResults
    } catch (error) {
      return res.status(400).json({ error: 'Invalid analysis results format' })
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'watermelon-training-data',
          public_id: `watermelon_${sessionId || uuidv4()}_${Date.now()}`,
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(req.file.buffer)
    })

    // Save to database if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const analysis = new Analysis({
        sessionId: sessionId || uuidv4(),
        imageUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        analysisResults: parsedResults,
        userConsent: true,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        imageMetadata: {
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          size: uploadResult.bytes
        }
      })

      await analysis.save()
    }

    res.json({
      success: true,
      message: 'Analysis data saved successfully',
      imageUrl: uploadResult.secure_url,
      analysisId: uploadResult.public_id
    })

  } catch (error) {
    console.error('Analysis upload error:', error)
    res.status(500).json({ 
      error: 'Failed to save analysis data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get analytics data (for admin use)
app.get('/api/analytics', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not available' })
    }

    const totalAnalyses = await Analysis.countDocuments()
    const recentAnalyses = await Analysis.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })

    const avgScores = await Analysis.aggregate([
      {
        $group: {
          _id: null,
          avgOverallScore: { $avg: '$analysisResults.overallScore' },
          avgFieldSpot: { $avg: '$analysisResults.fieldSpotColor.score' },
          avgStem: { $avg: '$analysisResults.stemColor.score' },
          avgSkin: { $avg: '$analysisResults.skinDullness.score' },
          avgShape: { $avg: '$analysisResults.shapeRatio.score' },
          avgWebbing: { $avg: '$analysisResults.webbingDensity.score' }
        }
      }
    ])

    res.json({
      totalAnalyses,
      recentAnalyses,
      averageScores: avgScores[0] || {},
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

// Serve static files - check which directory exists
import fs from 'fs'

let staticPath
let indexPath

// Check if Docker build files exist (./public)
if (fs.existsSync(path.join(__dirname, 'public'))) {
  staticPath = path.join(__dirname, 'public')
  indexPath = path.join(__dirname, 'public/index.html')
  console.log('Using Docker static files from ./public')
}
// Check if local development files exist (../dist)
else if (fs.existsSync(path.join(__dirname, '../dist'))) {
  staticPath = path.join(__dirname, '../dist')
  indexPath = path.join(__dirname, '../dist/index.html')
  console.log('Using local development files from ../dist')
}
// Fallback
else {
  staticPath = path.join(__dirname, 'public')
  indexPath = path.join(__dirname, 'public/index.html')
  console.log('Using fallback path ./public (files may not exist)')
}

app.use(express.static(staticPath))

app.get('*', (req, res) => {
  // Check if index.html exists before trying to serve it
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).json({
      error: 'Frontend not found',
      message: 'Static files not available. Please check deployment configuration.',
      staticPath,
      indexPath,
      NODE_ENV: process.env.NODE_ENV
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
})

// Start server
const startServer = async () => {
  await connectDB()
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

startServer().catch(console.error)