import React, { useRef, useState } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'

const ImageUpload = ({ onImageSelected }) => {
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageSelected(e.target.result, file)
      }
      reader.readAsDataURL(file)
    } else {
      alert('Please select a valid image file')
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="text-center">
      <div
        className={`upload-area ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Upload Watermelon Photo
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop an image here, or click to select
            </p>
            <button className="btn btn-primary">
              <Upload className="w-4 h-4" />
              Choose File
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>📸 Tips for best results:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Take photo in good lighting</li>
          <li>Show the entire watermelon</li>
          <li>Include the stem area if visible</li>
          <li>Avoid shadows or reflections</li>
        </ul>
      </div>
    </div>
  )
}

export default ImageUpload