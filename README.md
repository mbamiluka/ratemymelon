# 🍉 RateMyMelon

**AI-Powered Watermelon Quality Analysis Platform**

RateMyMelon is a cutting-edge web application that uses artificial intelligence to analyze watermelon quality and help users pick the perfect melon. The platform combines computer vision, machine learning, and expert knowledge to evaluate key ripeness indicators.

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://ratemymelon.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)

## ✨ Features

### 🔬 **Advanced Analysis Engine**
- **Field Spot Detection** - Analyzes ground spot color for ripeness indicators
- **Stem Color Analysis** - Evaluates stem dryness for vine-ripened quality
- **Skin Dullness Assessment** - Checks skin texture for maturity
- **Shape Ratio Analysis** - Determines sweetness potential from watermelon shape
- **Webbing Density Detection** - Identifies brown webbing patterns indicating good pollination
- **Traditional Gender Analysis** - Includes folklore-based shape analysis

### 🌐 **Global Platform**
- **Fast Analysis** - Optimized algorithms for quick results
- **Mobile Responsive** - Works perfectly on all devices
- **Privacy Compliant** - GDPR-ready consent management
- **Data Collection** - Ethical data gathering for AI model improvement
- **Cloud Storage** - Secure image storage and processing

### 📊 **Smart Scoring System**
- **Overall Quality Score** - Comprehensive 0-100 rating
- **Detailed Breakdown** - Individual feature scores with explanations
- **User-Friendly Tips** - Actionable advice for watermelon selection
- **Visual Feedback** - Clear, intuitive interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database
- Cloudinary account (for image storage)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ratemymelon.git
cd ratemymelon
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit server/.env with your credentials:
# MONGODB_URI=your_mongodb_connection_string
# CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
# CLOUDINARY_API_KEY=your_cloudinary_api_key
# CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. **Run the application**
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Frontend: npm run dev
# Backend: npm run server:dev
```

5. **Open your browser**
Navigate to `http://localhost:5173` to see RateMyMelon in action!

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 18** - Modern UI framework
- **TensorFlow.js** - Client-side AI processing
- **Vite** - Fast build tool and dev server
- **Responsive Design** - Mobile-first approach

### Backend (Node.js + Express)
- **Express.js** - RESTful API server
- **MongoDB** - Document database for data storage
- **Cloudinary** - Cloud image storage and processing
- **Security** - Helmet, CORS, rate limiting

### AI/ML Components
- **Computer Vision** - Image analysis and feature extraction
- **Color Analysis** - Advanced color detection algorithms
- **Pattern Recognition** - Webbing and texture analysis
- **Machine Learning** - Continuous model improvement

## 📁 Project Structure

```
ratemymelon/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ImageUpload.jsx      # Image upload interface
│   │   ├── ScoreDisplay.jsx     # Results display
│   │   └── ConsentBanner.jsx    # Privacy consent
│   ├── utils/                   # Utility functions
│   │   ├── watermelonAnalyzer.js # Main analysis engine
│   │   ├── featureDetectors.js  # Feature detection algorithms
│   │   ├── imageUtils.js        # Image processing utilities
│   │   └── dataCollectionService.js # Data collection service
│   └── App.jsx                  # Main application component
├── server/                      # Backend source code
│   ├── server.js               # Express server
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Environment template
├── public/                     # Static assets
├── render.yaml                 # Render deployment config
├── DEPLOYMENT_GUIDE.md         # Deployment instructions
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ratemymelon
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://ratemymelon.onrender.com
```

### Frontend Environment
```env
VITE_API_URL=https://ratemymelon.onrender.com/api
NODE_ENV=production
```

## 🚀 Deployment

### Render (Recommended)
1. Fork this repository
2. Connect your GitHub account to Render
3. Create a new Web Service from your fork
4. Render will automatically detect the `render.yaml` configuration
5. Set your environment variables in the Render dashboard
6. Deploy!

### Manual Deployment
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server && npm test

# Run end-to-end tests
npm run test:e2e
```

## 📈 Performance

- **Fast Analysis** - Optimized algorithms for sub-second results
- **Efficient Sampling** - Smart pixel sampling for speed without accuracy loss
- **Caching** - Intelligent caching for repeated operations
- **CDN Integration** - Global content delivery via Cloudinary

## 🔒 Privacy & Security

- **GDPR Compliant** - User consent management
- **Secure Storage** - Encrypted data transmission
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Comprehensive data sanitization
- **HTTPS Only** - Secure connections enforced

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js** - For making AI accessible in the browser
- **React Community** - For the amazing ecosystem
- **Watermelon Experts** - For sharing knowledge about quality indicators
- **Open Source Community** - For inspiration and tools

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/ratemymelon/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ratemymelon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ratemymelon/discussions)

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Additional fruit analysis
- [ ] Advanced ML model training
- [ ] Multi-language support
- [ ] API for third-party integration
- [ ] Premium features for commercial use

---

**Made with 🍉 and ❤️ by the RateMyMelon Team**

*Helping people pick perfect watermelons, one analysis at a time.*