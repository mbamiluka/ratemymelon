import React, { useState, useEffect } from 'react'
import { Info, Check, X } from 'lucide-react'

const ConsentBanner = ({ onConsentChange }) => {
  const [showBanner, setShowBanner] = useState(false)
  const [consent, setConsent] = useState(null)

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem('watermelon-data-consent')
    if (savedConsent) {
      const consentData = JSON.parse(savedConsent)
      setConsent(consentData.consent)
      onConsentChange(consentData.consent)
    } else {
      setShowBanner(true)
    }
  }, [onConsentChange])

  const handleConsent = (userConsent) => {
    const consentData = {
      consent: userConsent,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('watermelon-data-consent', JSON.stringify(consentData))
    setConsent(userConsent)
    setShowBanner(false)
    onConsentChange(userConsent)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Help Improve Our AI</h3>
            <p className="text-sm text-blue-100 mb-3">
              We'd like to collect your watermelon photos and analysis results to train better AI models. 
              Your data helps us improve accuracy for everyone. No personal information is stored.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleConsent(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Check className="w-4 h-4" />
                Yes, help improve AI
              </button>
              <button
                onClick={() => handleConsent(false)}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                No thanks
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsentBanner