import * as tf from '@tensorflow/tfjs'
import { loadMobileNetModel } from './modelLoader'
import { preprocessImage, createImageFromDataURL } from './imageUtils'
import {
  analyzeFieldSpotColor,
  analyzeStemColor,
  analyzeSkinDullness,
  analyzeShapeRatio,
  analyzeWebbingDensity
} from './featureDetectors'

// Weights for final score calculation (must sum to 100)
const FEATURE_WEIGHTS = {
  fieldSpotColor: 30,  // Increased from 25
  stemColor: 25,       // Increased from 20
  skinDullness: 25,    // Increased from 20
  shapeRatio: 10,      // Reduced from 15
  webbingDensity: 10   // Reduced from 15
  // Removed gender (was 5)
}

/**
 * Main function to analyze watermelon quality from image
 * @param {string} imageDataURL - Base64 encoded image data
 * @returns {Object} Analysis results with scores and recommendations
 */
export async function analyzeWatermelon(imageDataURL) {
  try {
    console.log('Starting watermelon analysis...')
    
    // Load the image
    const image = await createImageFromDataURL(imageDataURL)
    console.log('Image loaded:', image.width, 'x', image.height)
    
    // Load pre-trained model for object detection/segmentation
    const model = await loadMobileNetModel()
    console.log('Model loaded successfully')
    
    // Preprocess image for ML model
    const preprocessedImage = preprocessImage(image)
    
    // Get basic image features using the pre-trained model
    const modelPrediction = await model.predict(preprocessedImage).data()
    
    // Create canvas for image analysis
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0)
    
    // Get image data for pixel-level analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    console.log('Running feature detection...')
    
    // Run individual feature analyses
    const [
      fieldSpotResult,
      stemColorResult,
      skinDullnessResult,
      shapeRatioResult,
      webbingDensityResult
    ] = await Promise.all([
      analyzeFieldSpotColor(imageData, modelPrediction),
      analyzeStemColor(imageData, modelPrediction),
      analyzeSkinDullness(imageData, modelPrediction),
      analyzeShapeRatio(imageData, modelPrediction),
      analyzeWebbingDensity(imageData, modelPrediction)
    ])
    
    console.log('Feature detection complete')
    
    // Calculate weighted overall score with adaptive weighting for missing stems
    const safeScore = (score) => isNaN(score) || score === null || score === undefined ? 0 : score;
    
    // Adaptive weighting: if stem isn't visible, redistribute its weight to other features
    let weights = { ...FEATURE_WEIGHTS };
    const stemNotVisible = stemColorResult.details?.stemVisible === false;
    
    if (stemNotVisible) {
      // Redistribute stem weight to field spot and dullness (the most reliable indicators)
      const stemWeight = weights.stemColor;
      weights.stemColor = 0; // Don't count stem score when not visible
      weights.fieldSpotColor += stemWeight * 0.6; // Give 60% to field spot
      weights.skinDullness += stemWeight * 0.4;   // Give 40% to dullness
      
      console.log('Stem not visible - redistributing weights:', weights);
    }
    
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    const overallScore = Math.round(
      (safeScore(fieldSpotResult.score) * weights.fieldSpotColor +
       safeScore(stemColorResult.score) * weights.stemColor +
       safeScore(skinDullnessResult.score) * weights.skinDullness +
       safeScore(shapeRatioResult.score) * weights.shapeRatio +
       safeScore(webbingDensityResult.score) * weights.webbingDensity) / totalWeight
    )
    
    // Calculate confidence based on feature consistency with NaN protection
    const scores = [
      safeScore(fieldSpotResult.score),
      safeScore(stemColorResult.score),
      safeScore(skinDullnessResult.score),
      safeScore(shapeRatioResult.score),
      safeScore(webbingDensityResult.score)
    ].filter(score => !isNaN(score))
    
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const variance = scores.length > 0 ? scores.reduce((acc, score) => acc + Math.pow(score - avgScore, 2), 0) / scores.length : 0
    const confidence = Math.max(0.5, 1 - (variance / 1000)) // Normalize confidence
    
    // Generate recommendations
    const recommendations = generateRecommendations({
      fieldSpotResult,
      stemColorResult,
      skinDullnessResult,
      shapeRatioResult,
      webbingDensityResult,
      overallScore
    })
    
    console.log('Analysis complete. Overall score:', overallScore)
    
    return {
      overallScore,
      confidence,
      fieldSpotColor: fieldSpotResult,
      stemColor: stemColorResult,
      skinDullness: skinDullnessResult,
      shapeRatio: shapeRatioResult,
      webbingDensity: webbingDensityResult,
      recommendations,
      analysisTime: Date.now()
    }
    
  } catch (error) {
    console.error('Watermelon analysis failed:', error)
    throw new Error(`Analysis failed: ${error.message}`)
  }
}

/**
 * Generate recommendations based on analysis results
 */
function generateRecommendations(results) {
  const recommendations = []
  
  if (results.fieldSpotResult.score < 60) {
    recommendations.push('Look for a more pronounced yellow field spot for better sweetness')
  }
  
  if (results.stemColorResult.score < 60 && results.stemColorResult.details?.stemVisible !== false) {
    recommendations.push('Choose watermelons with brown, dry stems indicating vine ripeness')
  } else if (results.stemColorResult.details?.stemVisible === false) {
    recommendations.push('Stem not visible in image - other quality indicators evaluated')
  }
  
  if (results.skinDullnessResult.score < 60) {
    recommendations.push('Select melons with duller skin rather than shiny appearance')
  }
  
  if (results.shapeRatioResult.score < 60) {
    recommendations.push('Rounder watermelons tend to be sweeter than elongated ones')
  }
  
  if (results.webbingDensityResult.score < 60) {
    recommendations.push('Look for more pronounced webbing patterns on the skin')
  }
  
  if (results.overallScore >= 80) {
    recommendations.push('This watermelon shows excellent quality indicators!')
  } else if (results.overallScore >= 60) {
    recommendations.push('This watermelon shows good quality with room for improvement')
  } else {
    recommendations.push('Consider looking for a different watermelon with better quality indicators')
  }
  
  return recommendations
}