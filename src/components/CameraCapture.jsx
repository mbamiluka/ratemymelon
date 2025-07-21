import React, { useRef, useState, useEffect } from 'react'
import { Camera, Square, X, Upload } from 'lucide-react'

const CameraCapture = ({ onImageCaptured }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  console.log('🔄 CameraCapture component rendered/re-rendered')

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...')
      
      if (!isMounted) {
        console.warn('⚠️ Component not mounted, aborting camera start')
        return
      }
      
      setError(null)
      setIsStreaming(false)
      setDebugInfo('Starting camera...')
      
      console.log('🌐 Protocol:', location.protocol)
      console.log('🏠 Hostname:', location.hostname)
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser')
      }

      // Check if we're on HTTPS (required for camera access)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS connection')
      }

      setDebugInfo('Requesting camera permission...')
      console.log('📱 Requesting camera with rear camera (environment)')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      setDebugInfo('Camera stream obtained, setting up video...')
      console.log('✅ Camera stream obtained:', stream)
      console.log('📹 Video tracks:', stream.getVideoTracks())
      console.log('🔴 Stream active:', stream.active)
      console.log('🎬 Video element exists:', !!videoRef.current)
      console.log('🔍 DEBUG: videoRef.current type:', typeof videoRef.current)
      console.log('🔍 DEBUG: videoRef.current value:', videoRef.current)
      console.log('🔍 DEBUG: Component still mounted before video access:', isMounted)
      
      if (!isMounted) {
        console.warn('⚠️ Component unmounted during camera setup, aborting')
        return
      }
      
      if (videoRef.current) {
        console.log('🔗 Assigning stream to video element...')
        videoRef.current.srcObject = stream
        
        console.log('📺 Video element srcObject set:', !!videoRef.current.srcObject)
        
        // Wait a moment for the stream to be ready
        setTimeout(() => {
          console.log('🎯 Setting isStreaming to true...')
          setIsStreaming(true)
          setDebugInfo('Video stream active!')
        }, 500)
        
        // Add event listeners for debugging
        videoRef.current.onloadstart = () => {
          console.log('🎬 Video loadstart')
          setDebugInfo('Video loading started...')
        }
        videoRef.current.onloadeddata = () => {
          console.log('📊 Video loadeddata')
          setDebugInfo('Video data loaded!')
        }
        videoRef.current.oncanplay = () => {
          console.log('▶️ Video canplay')
          setDebugInfo('Video ready to play!')
        }
        videoRef.current.onplaying = () => {
          console.log('🎥 Video playing')
          setDebugInfo('Video is playing!')
        }
        
        // Try to play the video
        try {
          console.log('▶️ Attempting to play video...')
          await videoRef.current.play()
          console.log('✅ Video playing successfully')
          setDebugInfo('Video playing successfully!')
        } catch (playError) {
          console.error('❌ Video play error:', playError)
          setDebugInfo(`Play error: ${playError.message}`)
        }
      } else {
        console.error('❌ Video element not found!')
        setError('Video element not found. Please try again.')
      }
    } catch (err) {
      console.error('❌ Camera access error:', err)
      setDebugInfo(`Camera error: ${err.message}`)
      
      let errorMessage = 'Unable to access camera.'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permissions and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported in this browser.'
      } else if (err.message.includes('HTTPS')) {
        errorMessage = 'Camera access requires a secure (HTTPS) connection.'
      } else if (err.message.includes('not supported')) {
        errorMessage = 'Camera API not supported in this browser. Please use a modern browser.'
      }
      
      setError(errorMessage)
      setIsStreaming(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
      setDebugInfo('Camera stopped')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    onImageCaptured(imageData)

    // Stop camera after capture
    stopCamera()
  }


  useEffect(() => {
    console.log('🔧 CameraCapture component mounted')
    setIsMounted(true)
    return () => {
      console.log('🔧 CameraCapture component unmounting')
      setIsMounted(false)
      stopCamera()
    }
  }, [])


  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageCaptured(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Camera Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="space-y-3">
          <button className="btn btn-primary" onClick={startCamera}>
            Try Again
          </button>
          <div className="text-gray-500">or</div>
          <button className="btn btn-secondary" onClick={triggerFileUpload}>
            <Upload className="w-4 h-4" />
            Upload Photo Instead
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            Debug: {debugInfo}
          </div>
        )}
        
      </div>
    )
  }

  return (
    <div className="text-center">
      
      {/* Always render video element but hide it when not streaming */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls={false}
        webkit-playsinline="true"
        className={isStreaming ? "w-full h-full absolute inset-0" : "hidden"}
        style={{
          backgroundColor: '#000',
          display: isStreaming ? 'block' : 'none',
          objectFit: 'cover'
        }}
        onLoadedMetadata={(e) => {
          console.log('Video metadata loaded:', e.target.videoWidth, 'x', e.target.videoHeight)
          setDebugInfo(`Video: ${e.target.videoWidth}x${e.target.videoHeight}`)
        }}
        onPlay={() => {
          console.log('Video started playing')
          setDebugInfo('Video is playing!')
        }}
        onError={(e) => {
          console.error('Video error:', e)
          setDebugInfo(`Video error: ${e.type}`)
        }}
        onCanPlay={() => {
          console.log('Video can play')
          setDebugInfo('Video ready!')
        }}
      />
      
      {!isStreaming ? (
        <div className="py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Camera Access
          </h3>
          <p className="text-gray-600 mb-4">
            Allow camera access to take a photo of your watermelon
          </p>
          <div className="space-y-3">
            <button className="btn btn-primary" onClick={startCamera}>
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
            <div className="text-gray-500">or</div>
            <button className="btn btn-secondary" onClick={triggerFileUpload}>
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {debugInfo && (
            <div className="mt-4 p-2 bg-blue-100 rounded text-xs text-blue-600">
              Debug: {debugInfo}
            </div>
          )}
          
        </div>
      ) : (
        <div>
          {/* Debug Info */}
          {debugInfo && (
            <div className="p-2 bg-green-100 rounded text-xs text-green-600 mb-2">
              Debug: {debugInfo}
            </div>
          )}
          
          {/* Temporary Mobile Debug Info */}
          <div className="p-2 bg-yellow-50 rounded text-xs text-gray-600 mb-2 border">
            Screen: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}
          </div>
          
          {/* Video Preview Container - Very small for mobile */}
          <div className="relative bg-black rounded overflow-hidden border w-full" style={{ height: '200px' }}>
            {/* Video is rendered above but positioned here visually */}
            <div className="w-full h-full">
              {/* Camera overlay guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="border border-white border-dashed rounded w-24 h-16 flex items-center justify-center">
                  <span className="text-white text-xs bg-black bg-opacity-50 px-1 py-1 rounded">
                    🍉
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Controls - Very compact */}
          <div className="flex gap-2 justify-center mt-2">
            <button
              className="bg-green-500 text-white px-3 py-2 rounded text-sm"
              onClick={capturePhoto}
            >
              📷 Capture
            </button>
            
            <button
              className="bg-gray-500 text-white px-3 py-2 rounded text-sm"
              onClick={stopCamera}
            >
              ❌ Cancel
            </button>
          </div>

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>📱 Camera Tips:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Hold phone steady</li>
          <li>Ensure good lighting</li>
          <li>Frame the entire watermelon</li>
          <li>Avoid glare and shadows</li>
        </ul>
      </div>
    </div>
  )
}

export default CameraCapture