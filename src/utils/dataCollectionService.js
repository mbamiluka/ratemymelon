/**
 * Data Collection Service for training data
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? '' : 'http://localhost:3001'
)

/**
 * Upload analysis data to backend for training
 * @param {File} imageFile - Original image file
 * @param {Object} analysisResults - Analysis results from watermelon analyzer
 * @param {boolean} userConsent - User consent for data collection
 * @param {string} sessionId - Unique session identifier
 */
export async function uploadAnalysisData(imageFile, analysisResults, userConsent, sessionId) {
  if (!userConsent) {
    console.log('Data collection skipped - no user consent')
    return { success: false, reason: 'no_consent' }
  }

  try {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('analysisResults', JSON.stringify(analysisResults))
    formData.append('userConsent', userConsent.toString())
    formData.append('sessionId', sessionId)

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Analysis data uploaded successfully:', result)
    
    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('Failed to upload analysis data:', error)
    
    // Don't throw error - data collection is optional
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate a unique session ID for tracking user sessions
 */
export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Track user interaction events (optional analytics)
 */
export function trackEvent(eventName, properties = {}) {
  try {
    // Add timestamp and session info
    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      ...properties
    }

    // Store locally for now (can be sent to analytics service later)
    const events = JSON.parse(localStorage.getItem('watermelon-events') || '[]')
    events.push(eventData)
    
    // Keep only last 100 events to avoid storage bloat
    if (events.length > 100) {
      events.splice(0, events.length - 100)
    }
    
    localStorage.setItem('watermelon-events', JSON.stringify(events))
    
    console.log('Event tracked:', eventData)

  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

/**
 * Get or create session ID
 */
function getSessionId() {
  let sessionId = sessionStorage.getItem('watermelon-session-id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('watermelon-session-id', sessionId)
  }
  return sessionId
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 5000
    })
    
    return response.ok
  } catch (error) {
    console.log('Backend not available:', error.message)
    return false
  }
}

/**
 * Get analytics data (for admin/development use)
 */
export async function getAnalytics() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    throw error
  }
}