import React, { useState, useRef, useEffect } from 'react'
import { Camera, Upload, Zap, RotateCcw } from 'lucide-react'
import ImageUpload from './components/ImageUpload'
import CameraCapture from './components/CameraCapture'
import WatermelonAnalysis from './components/WatermelonAnalysis'
import ScoreDisplay from './components/ScoreDisplay'
import ConsentBanner from './components/ConsentBanner'
import { uploadAnalysisData, trackEvent, generateSessionId } from './utils/dataCollectionService'

function App() {
  const [currentImage, setCurrentImage] = useState(null)
  const [currentImageFile, setCurrentImageFile] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('upload') // 'upload' or 'camera'
  const [userConsent, setUserConsent] = useState(null)
  const [sessionId] = useState(() => generateSessionId())

  useEffect(() => {
    // Track app launch
    trackEvent('app_launched', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }, [])

  const handleImageSelected = (imageData, imageFile = null) => {
    setCurrentImage(imageData)
    setCurrentImageFile(imageFile)
    setAnalysisResults(null)
    
    // Track image selection
    trackEvent('image_selected', {
      method: activeTab,
      hasFile: !!imageFile
    })
  }

  const handleAnalyze = async () => {
    if (!currentImage) return

    setIsAnalyzing(true)
    trackEvent('analysis_started')
    
    try {
      // Import the analysis module dynamically to avoid loading ML models until needed
      const { analyzeWatermelon } = await import('./utils/watermelonAnalyzer')
      const results = await analyzeWatermelon(currentImage)
      setAnalysisResults(results)
      
      // Track successful analysis
      trackEvent('analysis_completed', {
        overallScore: results.overallScore,
        analysisTime: Date.now() - results.analysisTime
      })

      // Upload data for training if user consented and we have the original file
      if (userConsent && currentImageFile) {
        try {
          await uploadAnalysisData(currentImageFile, results, userConsent, sessionId)
          trackEvent('data_uploaded', { success: true })
        } catch (error) {
          console.error('Data upload failed:', error)
          trackEvent('data_upload_failed', { error: error.message })
        }
      }
      
    } catch (error) {
      console.error('Analysis failed:', error)
      trackEvent('analysis_failed', { error: error.message })
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setCurrentImage(null)
    setCurrentImageFile(null)
    setAnalysisResults(null)
    setIsAnalyzing(false)
    
    trackEvent('reset_clicked')
  }

  const handleConsentChange = (consent) => {
    setUserConsent(consent)
    trackEvent('consent_given', { consent })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600">
      <div className="container">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🍉 Watermelon Rater
          </h1>
          <p className="text-green-100 text-lg">
            AI-powered watermelon quality assessment
          </p>
        </header>

        {/* Main Content */}
        <div className="card">
          {!currentImage ? (
            <>
              {/* Tab Navigation */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => {
                    setActiveTab('upload')
                    trackEvent('tab_switched', { tab: 'upload' })
                  }}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Photo
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'camera'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => {
                    setActiveTab('camera')
                    trackEvent('tab_switched', { tab: 'camera' })
                  }}
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Take Photo
                </button>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'upload' ? (
                <ImageUpload onImageSelected={handleImageSelected} />
              ) : (
                <CameraCapture onImageCaptured={handleImageSelected} />
              )}
            </>
          ) : (
            <>
              {/* Image Preview and Controls */}
              <div className="text-center mb-6">
                <img
                  src={currentImage}
                  alt="Watermelon to analyze"
                  className="image-preview mx-auto"
                />
                
                <div className="flex gap-4 justify-center mt-4">
                  {!analysisResults && !isAnalyzing && (
                    <button
                      className="btn btn-primary"
                      onClick={handleAnalyze}
                    >
                      <Zap className="w-4 h-4" />
                      Analyze Watermelon
                    </button>
                  )}
                  
                  <button
                    className="btn btn-secondary"
                    onClick={handleReset}
                    disabled={isAnalyzing}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Another
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isAnalyzing && (
                <div className="loading">
                  <div className="spinner"></div>
                  <span>Analyzing watermelon quality...</span>
                </div>
              )}

              {/* Results */}
              {analysisResults && (
                <ScoreDisplay results={analysisResults} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-green-100">
          <p className="text-sm">
            Powered by AI • Built with React & TensorFlow.js
          </p>
        </footer>
      </div>

      {/* Consent Banner */}
      <ConsentBanner onConsentChange={handleConsentChange} />
    </div>
  )
}

export default App