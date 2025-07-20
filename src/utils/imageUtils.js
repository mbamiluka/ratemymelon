import * as tf from '@tensorflow/tfjs'

/**
 * Create an Image object from a data URL
 * @param {string} dataURL - Base64 encoded image data
 * @returns {Promise<HTMLImageElement>} - Loaded image element
 */
export function createImageFromDataURL(dataURL) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataURL
  })
}

/**
 * Preprocess image for TensorFlow model input
 * @param {HTMLImageElement} image - Input image
 * @param {number} targetSize - Target size for model input (default: 224)
 * @returns {tf.Tensor} - Preprocessed tensor
 */
export function preprocessImage(image, targetSize = 224) {
  return tf.tidy(() => {
    // Convert image to tensor
    const tensor = tf.browser.fromPixels(image)
    
    // Resize to model input size
    const resized = tf.image.resizeBilinear(tensor, [targetSize, targetSize])
    
    // Normalize pixel values to [0, 1]
    const normalized = resized.div(255.0)
    
    // Add batch dimension
    const batched = normalized.expandDims(0)
    
    return batched
  })
}

/**
 * Extract color histogram from image data
 * @param {ImageData} imageData - Canvas image data
 * @param {Object} region - Region to analyze {x, y, width, height}
 * @returns {Object} - Color histogram data
 */
export function extractColorHistogram(imageData, region = null) {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  
  // Define region to analyze (default: entire image)
  const roi = region || { x: 0, y: 0, width, height }
  
  // Initialize histograms
  const rHist = new Array(256).fill(0)
  const gHist = new Array(256).fill(0)
  const bHist = new Array(256).fill(0)
  
  let pixelCount = 0
  
  // Process pixels in the region of interest
  for (let y = roi.y; y < roi.y + roi.height && y < height; y++) {
    for (let x = roi.x; x < roi.x + roi.width && x < width; x++) {
      const index = (y * width + x) * 4
      
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      
      rHist[r]++
      gHist[g]++
      bHist[b]++
      pixelCount++
    }
  }
  
  // Normalize histograms with NaN protection
  const normalize = (hist) => hist.map(count => pixelCount === 0 ? 0 : count / pixelCount)
  
  return {
    red: normalize(rHist),
    green: normalize(gHist),
    blue: normalize(bHist),
    pixelCount
  }
}

/**
 * Calculate dominant colors in an image region
 * @param {ImageData} imageData - Canvas image data
 * @param {Object} region - Region to analyze
 * @returns {Array} - Array of dominant colors with percentages
 */
export function getDominantColors(imageData, region = null, numColors = 5) {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  
  const roi = region || { x: 0, y: 0, width, height }
  const colorMap = new Map()
  
  // Sample pixels (optimized for speed)
  const step = Math.max(2, Math.floor(Math.sqrt(roi.width * roi.height) / 50))
  
  for (let y = roi.y; y < roi.y + roi.height && y < height; y += step) {
    for (let x = roi.x; x < roi.x + roi.width && x < width; x += step) {
      const index = (y * width + x) * 4
      
      const r = Math.floor(data[index] / 32) * 32 // Quantize to reduce color space
      const g = Math.floor(data[index + 1] / 32) * 32
      const b = Math.floor(data[index + 2] / 32) * 32
      
      const colorKey = `${r},${g},${b}`
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
    }
  }
  
  // Sort by frequency and return top colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, numColors)
  
  const totalPixels = sortedColors.reduce((sum, [, count]) => sum + count, 0)
  
  return sortedColors.map(([colorKey, count]) => {
    const [r, g, b] = colorKey.split(',').map(Number)
    return {
      rgb: { r, g, b },
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      percentage: totalPixels === 0 ? 0 : (count / totalPixels) * 100
    }
  })
}

/**
 * Detect edges using simple gradient calculation
 * @param {ImageData} imageData - Canvas image data
 * @returns {ImageData} - Edge-detected image data
 */
export function detectEdges(imageData) {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const output = new ImageData(width, height)
  
  // Sobel operators
  const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
  const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]
  
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      let gx = 0, gy = 0
      
      // Apply Sobel operators
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          
          gx += gray * sobelX[ky + 1][kx + 1]
          gy += gray * sobelY[ky + 1][kx + 1]
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy)
      const outputIdx = (y * width + x) * 4
      
      output.data[outputIdx] = magnitude
      output.data[outputIdx + 1] = magnitude
      output.data[outputIdx + 2] = magnitude
      output.data[outputIdx + 3] = 255
    }
  }
  
  return output
}

/**
 * Calculate image brightness and contrast metrics
 * @param {ImageData} imageData - Canvas image data
 * @returns {Object} - Brightness and contrast metrics
 */
export function calculateImageMetrics(imageData) {
  const data = imageData.data
  const pixelCount = data.length / 4
  
  let totalBrightness = 0
  let brightnessValues = []
  
  // Calculate brightness for each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    // Calculate perceived brightness
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b)
    totalBrightness += brightness
    brightnessValues.push(brightness)
  }
  
  const avgBrightness = pixelCount === 0 ? 0 : totalBrightness / pixelCount
  
  // Calculate contrast (standard deviation of brightness)
  const variance = pixelCount === 0 ? 0 : brightnessValues.reduce((acc, brightness) => {
    return acc + Math.pow(brightness - avgBrightness, 2)
  }, 0) / pixelCount
  
  const contrast = Math.sqrt(variance)
  
  return {
    brightness: avgBrightness,
    contrast: contrast,
    normalized: {
      brightness: avgBrightness / 255,
      contrast: contrast / 128 // Normalize contrast
    }
  }
}

/**
 * Find the largest contour (watermelon outline) in the image
 * @param {ImageData} imageData - Canvas image data
 * @returns {Object} - Bounding box and contour information
 */
export function findWatermelonContour(imageData) {
  const width = imageData.width
  const height = imageData.height
  
  // Simple approach: find the largest connected region
  // This is a simplified version - in production, you'd use more sophisticated algorithms
  
  let minX = width, maxX = 0, minY = height, maxY = 0
  let centerX = 0, centerY = 0, pixelCount = 0
  
  // Find approximate bounds by looking for non-background pixels
  const data = imageData.data
  
  // Sample every 3rd pixel for faster processing
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      
      // Simple background detection (assuming light background)
      const isBackground = (r > 200 && g > 200 && b > 200) || 
                          (r < 50 && g < 50 && b < 50)
      
      if (!isBackground) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
        centerX += x
        centerY += y
        pixelCount++
      }
    }
  }
  
  if (pixelCount > 0) {
    centerX = centerX / pixelCount
    centerY = centerY / pixelCount
  } else {
    centerX = width / 2
    centerY = height / 2
  }
  
  return {
    boundingBox: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    },
    center: { x: centerX, y: centerY },
    area: pixelCount
  }
}