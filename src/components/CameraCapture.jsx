import React, { useRef, useState, useEffect } from 'react'
import { Camera, Square, RotateCcw, X, Upload } from 'lucide-react'

const CameraCapture = ({ onImageCaptured }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [facingMode, setFacingMode] = useState('environment') // 'user' for front, 'environment' for back

  const startCamera = async () => {
    try {
      setError(null)
      setIsStreaming(false)
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser')
      }

      // Check if we're on HTTPS (required for camera access)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS connection')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      console.log('Camera stream obtained:', stream)
      console.log('Video tracks:', stream.getVideoTracks())
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Set streaming immediately after getting the stream
        setIsStreaming(true)
        
        // Try to play the video
        try {
          await videoRef.current.play()
          console.log('Video playing successfully')
        } catch (playError) {
          console.error('Video play error:', playError)
          // Don't set error here, the video might still work without explicit play
        }
      }
    } catch (err) {
      console.error('Camera access error:', err)
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

  const switchCamera = () => {
    stopCamera()
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Handle camera switching
  useEffect(() => {
    if (isStreaming) {
      startCamera()
    }
  }, [facingMode])

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
      </div>
    )
  }

  return (
    <div className="text-center">
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
        </div>
      ) : (
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              controls={false}
              webkit-playsinline="true"
              className="w-full max-h-96 object-cover"
              style={{
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                minHeight: '300px',
                maxHeight: '400px',
                backgroundColor: '#000',
                width: '100%',
                display: 'block'
              }}
              onLoadedMetadata={(e) => {
                console.log('Video metadata loaded:', e.target.videoWidth, 'x', e.target.videoHeight)
              }}
              onPlay={() => console.log('Video started playing')}
              onError={(e) => console.error('Video error:', e)}
              onCanPlay={() => console.log('Video can play')}
            />
            
            {/* Camera overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white border-dashed rounded-lg w-64 h-48 flex items-center justify-center">
                <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  Center watermelon here
                </span>
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="flex gap-4 justify-center">
            <button
              className="btn btn-secondary"
              onClick={switchCamera}
              title="Switch Camera"
            >
              <RotateCcw className="w-4 h-4" />
              Flip
            </button>
            
            <button
              className="btn btn-primary"
              onClick={capturePhoto}
            >
              <Square className="w-4 h-4" />
              Capture Photo
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={stopCamera}
            >
              <X className="w-4 h-4" />
              Cancel
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