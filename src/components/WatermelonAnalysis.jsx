import React from 'react'
import { Brain, Zap } from 'lucide-react'

const WatermelonAnalysis = ({ isAnalyzing, onAnalyze, disabled }) => {
  if (isAnalyzing) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Analyzing Watermelon...
          </h3>
          <p className="text-gray-600">
            Running AI analysis on your watermelon image
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>🔍 Detecting field spot color...</p>
            <p>🌿 Analyzing stem condition...</p>
            <p>✨ Checking skin dullness...</p>
            <p>📐 Measuring shape ratio...</p>
            <p>🕸️ Evaluating webbing density...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Brain className="w-8 h-8 text-green-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Ready for AI Analysis
      </h3>
      
      <p className="text-gray-600 mb-6">
        Our AI will analyze your watermelon across 5 quality criteria
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="font-medium text-green-800">Field Spot Color</div>
          <div className="text-green-600">30% weight</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="font-medium text-blue-800">Stem Color</div>
          <div className="text-blue-600">25% weight</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="font-medium text-purple-800">Skin Dullness</div>
          <div className="text-purple-600">25% weight</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="font-medium text-orange-800">Shape Ratio</div>
          <div className="text-orange-600">10% weight</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="font-medium text-red-800">Webbing Density</div>
          <div className="text-red-600">10% weight</div>
        </div>
      </div>
      
      <button
        className="btn btn-primary"
        onClick={onAnalyze}
        disabled={disabled}
      >
        <Zap className="w-4 h-4" />
        Start AI Analysis
      </button>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Analysis typically takes 2-5 seconds</p>
        <p>All processing happens on your device</p>
      </div>
    </div>
  )
}

export default WatermelonAnalysis