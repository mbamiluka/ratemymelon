import { 
  extractColorHistogram, 
  getDominantColors, 
  detectEdges, 
  calculateImageMetrics,
  findWatermelonContour 
} from './imageUtils'

/**
 * Get dominant colors with detailed sampling for field spot analysis
 * Uses smaller step size for more accurate color detection
 */
function getDetailedDominantColors(imageData, region = null, numColors = 5) {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  
  const roi = region || { x: 0, y: 0, width, height }
  const colorMap = new Map()
  
  // Use very detailed sampling for field spot analysis (even smaller step)
  const step = Math.max(1, Math.floor(Math.sqrt(roi.width * roi.height) / 150))
  
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
 * Analyze field spot color (ground spot) - 25% weight
 * Deeper yellow indicates longer vine time and sweeter melon
 */
export async function analyzeFieldSpotColor(imageData, modelPrediction) {
  try {
    const contour = findWatermelonContour(imageData)
    const width = imageData.width
    const height = imageData.height
    
    // Look for field spot in bottom portion of watermelon (expanded search area)
    const searchRegion = {
      x: Math.max(0, contour.boundingBox.x),
      y: Math.max(0, contour.boundingBox.y + contour.boundingBox.height * 0.5), // Start higher
      width: contour.boundingBox.width,
      height: Math.min(height, contour.boundingBox.height * 0.5) // Cover more area
    }
    
    // Use more detailed sampling for field spot detection
    const dominantColors = getDetailedDominantColors(imageData, searchRegion, 5)
    
    // Analyze for yellow/cream colors indicating field spot
    let yellowScore = 0
    let bestYellowColor = null
    
    dominantColors.forEach(color => {
      const { r, g, b } = color.rgb
      
      // Calculate yellowness - more lenient thresholds
      const yellowness = (r + g) / 2 - b
      const brightness = (r + g + b) / 3
      
      // More comprehensive field spot detection - look for various yellow/cream/tan tones
      // Include more color variations that could indicate field spots
      const isYellowish = (r > g && g > b && brightness > 80) || // Traditional yellow
                         (r > g && r > b && g > b * 1.1 && brightness > 90) || // Cream/tan
                         (r >= g && g >= b && r > b * 1.2 && brightness > 70) || // Light brown/tan
                         (Math.abs(r - g) < 30 && r > b * 1.3 && brightness > 85) // Beige/cream
      
      if (isYellowish) {
        let colorScore = 0
        
        // Strong yellow (original criteria)
        if (yellowness > 40 && r > 140 && g > 110 && b < 110) {
          colorScore = Math.min(100, (yellowness / 80) * 70 + (color.percentage / 15) * 30)
        }
        // Moderate yellow/cream (expanded criteria)
        else if (yellowness > 15 && r > 110 && g > 90 && b < 130) {
          colorScore = Math.min(70, (yellowness / 60) * 45 + (color.percentage / 20) * 25)
        }
        // Pale yellow/cream (more lenient)
        else if (yellowness > 5 && r > 85 && g > 75 && b < 140) {
          colorScore = Math.min(50, (yellowness / 40) * 30 + (color.percentage / 25) * 20)
        }
        // Very pale/cream/tan (expanded detection)
        else if (yellowness > 0 && r > 75 && g > 65 && b < 150 && brightness > 70) {
          colorScore = Math.min(35, (yellowness / 30) * 20 + (color.percentage / 30) * 15)
        }
        // Light tan/beige (new category for very subtle field spots)
        else if (r >= g && g >= b && r > b * 1.1 && brightness > 60 && brightness < 180) {
          const tanScore = (r - b) / 4 + (color.percentage / 40) * 10
          colorScore = Math.min(25, tanScore)
        }
        
        if (colorScore > yellowScore) {
          yellowScore = colorScore
          bestYellowColor = color
        }
      }
    })
    
    // More conservative final scoring
    const finalScore = Math.min(100, yellowScore)
    
    let description = 'No clear field spot detected'
    if (finalScore > 70) {
      description = 'Excellent yellow field spot - indicates good ripeness'
    } else if (finalScore > 45) {
      description = 'Good field spot coloring'
    } else if (finalScore > 25) {
      description = 'Moderate field spot - some ripeness indicators'
    } else if (finalScore >= 10) {
      description = 'Faint field spot - minimal ripeness indicators'
    } else if (finalScore > 5) {
      description = 'Very faint field spot - likely underripe'
    }
    
    return {
      score: Math.round(finalScore),
      description,
      details: {
        dominantColors,
        bestYellowColor,
        searchRegion
      }
    }
    
  } catch (error) {
    console.error('Field spot analysis failed:', error)
    return {
      score: 50,
      description: 'Field spot analysis unavailable',
      details: { error: error.message }
    }
  }
}

/**
 * Analyze stem color - 20% weight
 * Brown/dry stem = vine-ripened; green = picked early
 */
export async function analyzeStemColor(imageData, modelPrediction) {
  try {
    const contour = findWatermelonContour(imageData)
    
    // Look for stem in top portion of watermelon
    const searchRegion = {
      x: Math.max(0, contour.boundingBox.x + contour.boundingBox.width * 0.3),
      y: Math.max(0, contour.boundingBox.y),
      width: Math.min(imageData.width, contour.boundingBox.width * 0.4),
      height: Math.min(imageData.height, contour.boundingBox.height * 0.3)
    }
    
    const dominantColors = getDominantColors(imageData, searchRegion, 5)
    
    let brownScore = 0
    let greenPenalty = 0
    let bestStemColor = null
    
    dominantColors.forEach(color => {
      const { r, g, b } = color.rgb
      
      // Check for brown/dry colors (good)
      const brownness = Math.min(r, g * 0.8, b * 0.6) // Brown has balanced RGB with slight red bias
      const isDryBrown = r > 80 && r < 180 && g > 60 && g < 150 && b > 40 && b < 120 && 
                        Math.abs(r - g) < 50 && r > b
      
      if (isDryBrown) {
        const colorScore = Math.min(100, (brownness / 80) * 70 + (color.percentage / 15) * 30)
        if (colorScore > brownScore) {
          brownScore = colorScore
          bestStemColor = color
        }
      }
      
      // Check for green colors (penalty)
      const greenness = g - (r + b) / 2
      if (greenness > 30 && g > 100) {
        greenPenalty += (color.percentage / 100) * 40
      }
    })
    
    // Improved scoring logic for non-visible stems
    let finalScore = Math.max(0, Math.min(100, brownScore - greenPenalty))
    let description = 'Stem area not clearly visible'
    let stemVisible = true
    
    if (brownScore < 10 && greenPenalty < 10) {
      // No clear stem detected - give neutral score instead of penalizing
      finalScore = 65 // Neutral score when stem isn't visible
      description = 'Stem not visible in image - neutral score applied'
      stemVisible = false
    } else if (finalScore > 75) {
      description = 'Excellent brown/dry stem - vine ripened'
    } else if (finalScore > 50) {
      description = 'Moderate stem dryness'
    } else if (greenPenalty > 20) {
      description = 'Green stem detected - may be picked early'
    } else if (finalScore > 25) {
      description = 'Stem appears partially dry'
    } else if (finalScore > 10) {
      description = 'Stem condition unclear'
    } else {
      // Very low score but some stem detected - give slight benefit of doubt
      finalScore = Math.max(finalScore, 35)
      description = 'Stem condition poor but partially visible'
    }
    
    return {
      score: Math.round(finalScore),
      description,
      details: {
        dominantColors,
        bestStemColor,
        brownScore,
        greenPenalty,
        searchRegion,
        stemVisible
      }
    }
    
  } catch (error) {
    console.error('Stem color analysis failed:', error)
    return {
      score: 50,
      description: 'Stem analysis unavailable',
      details: { error: error.message }
    }
  }
}

/**
 * Analyze skin dullness - 20% weight
 * Dull skin = mature; shiny = underripe
 */
export async function analyzeSkinDullness(imageData, modelPrediction) {
  try {
    const contour = findWatermelonContour(imageData)
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    // Simple approach: analyze brightness variation in the center region
    const centerX = Math.floor(contour.boundingBox.x + contour.boundingBox.width / 2)
    const centerY = Math.floor(contour.boundingBox.y + contour.boundingBox.height / 2)
    const regionSize = Math.min(contour.boundingBox.width, contour.boundingBox.height) * 0.3
    
    let pixelValues = []
    const step = 8
    
    // Sample pixels in a grid around the center
    for (let y = centerY - regionSize/2; y < centerY + regionSize/2; y += step) {
      for (let x = centerX - regionSize/2; x < centerX + regionSize/2; x += step) {
        const px = Math.floor(x)
        const py = Math.floor(y)
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const idx = (py * width + px) * 4
          const r = data[idx] || 0
          const g = data[idx + 1] || 0
          const b = data[idx + 2] || 0
          const brightness = (r + g + b) / 3
          
          if (!isNaN(brightness)) {
            pixelValues.push(brightness)
          }
        }
      }
    }
    
    if (pixelValues.length < 5) {
      throw new Error('Insufficient pixel data for analysis')
    }
    
    // Calculate brightness statistics
    const avgBrightness = pixelValues.reduce((sum, val) => sum + val, 0) / pixelValues.length
    const variance = pixelValues.reduce((sum, val) => sum + Math.pow(val - avgBrightness, 2), 0) / pixelValues.length
    const stdDev = Math.sqrt(variance)
    
    // Dullness score based on low variation (consistent, matte appearance)
    // Lower standard deviation = more consistent = duller = higher score
    const variationScore = Math.max(0, Math.min(100, 100 - (stdDev * 2)))
    
    // Brightness component - moderate brightness is ideal for dullness detection
    const brightnessScore = Math.max(0, Math.min(100, 100 - Math.abs(avgBrightness - 128) / 128 * 100))
    
    const dullnessScore = (variationScore * 0.7) + (brightnessScore * 0.3)
    const finalScore = Math.round(Math.max(0, Math.min(100, dullnessScore)))
    
    let description = 'Skin dullness analysis completed'
    if (finalScore > 75) {
      description = 'Excellent dull skin - indicates maturity'
    } else if (finalScore > 60) {
      description = 'Good skin dullness'
    } else if (finalScore > 45) {
      description = 'Moderate skin dullness'
    } else if (finalScore > 30) {
      description = 'Somewhat shiny skin - may be underripe'
    } else {
      description = 'Shiny skin detected - likely underripe'
    }
    
    return {
      score: finalScore,
      description,
      details: {
        pixelCount: pixelValues.length,
        avgBrightness: Math.round(avgBrightness * 10) / 10,
        stdDev: Math.round(stdDev * 10) / 10,
        variationScore: Math.round(variationScore),
        brightnessScore: Math.round(brightnessScore),
        centerX,
        centerY,
        regionSize: Math.round(regionSize)
      }
    }
    
  } catch (error) {
    console.error('Skin dullness analysis failed:', error)
    return {
      score: 50,
      description: 'Skin analysis unavailable - ' + error.message,
      details: { error: error.message }
    }
  }
}

/**
 * Analyze shape ratio - 15% weight
 * Round = sweeter; oblong = more watery
 */
export async function analyzeShapeRatio(imageData, modelPrediction) {
  try {
    const contour = findWatermelonContour(imageData)
    const { width, height } = contour.boundingBox
    
    if (width === 0 || height === 0) {
      throw new Error('Could not detect watermelon shape')
    }
    
    // Calculate aspect ratio with NaN protection
    const aspectRatio = height === 0 ? 1 : width / height
    
    // Ideal ratio is close to 1 (round), penalize as it gets more elongated
    const idealRatio = 1.0
    const ratioDeviation = Math.abs(aspectRatio - idealRatio)
    
    // More aggressive penalty for elongated shapes (long/oval = more watery)
    let shapeScore = Math.max(0, 100 - (ratioDeviation * 100))
    
    // Bonus for truly round shapes (0.95 - 1.05 range)
    if (aspectRatio >= 0.95 && aspectRatio <= 1.05) {
      shapeScore = Math.min(100, shapeScore * 1.2)
    }
    // Moderate bonus for slightly wider than tall (1.05 - 1.15 range)
    else if (aspectRatio >= 1.05 && aspectRatio <= 1.15) {
      shapeScore = Math.min(100, shapeScore * 1.1)
    }
    // Penalty for very elongated shapes
    else if (ratioDeviation > 0.3) {
      shapeScore = Math.max(0, shapeScore * 0.7)
    }
    
    let description = 'Shape analysis completed'
    let shapeType = 'irregular'
    
    if (aspectRatio < 0.7) {
      shapeType = 'very tall/narrow'
      description = 'Very elongated shape - likely watery'
    } else if (aspectRatio < 0.85) {
      shapeType = 'tall/oval'
      description = 'Tall oval shape - may be watery'
    } else if (aspectRatio < 0.95) {
      shapeType = 'slightly tall'
      description = 'Slightly elongated - moderate sweetness'
    } else if (aspectRatio <= 1.05) {
      shapeType = 'round'
      description = 'Excellent round shape - indicates sweetness'
    } else if (aspectRatio <= 1.2) {
      shapeType = 'slightly wide'
      description = 'Slightly wide - good sweetness potential'
    } else if (aspectRatio <= 1.4) {
      shapeType = 'wide/oval'
      description = 'Wide oval shape - moderate sweetness'
    } else {
      shapeType = 'very wide'
      description = 'Very wide shape - may be watery'
    }
    
    return {
      score: Math.round(shapeScore),
      description,
      details: {
        aspectRatio: Math.round(aspectRatio * 100) / 100,
        width,
        height,
        shapeType,
        ratioDeviation: Math.round(ratioDeviation * 100) / 100
      }
    }
    
  } catch (error) {
    console.error('Shape analysis failed:', error)
    return {
      score: 50,
      description: 'Shape analysis unavailable',
      details: { error: error.message }
    }
  }
}

/**
 * Analyze webbing density - 15% weight
 * More webbing = better pollination and sugar seepage
 * Specifically looks for brown lines (thin or wide, high or low contrast)
 */
export async function analyzeWebbingDensity(imageData, modelPrediction) {
  try {
    const contour = findWatermelonContour(imageData)
    
    // Analyze the main surface for webbing patterns
    const searchRegion = {
      x: Math.max(0, Math.floor(contour.boundingBox.x + contour.boundingBox.width * 0.1)),
      y: Math.max(0, Math.floor(contour.boundingBox.y + contour.boundingBox.height * 0.1)),
      width: Math.floor(contour.boundingBox.width * 0.8),
      height: Math.floor(contour.boundingBox.height * 0.8)
    }
    
    // Ensure search region is valid
    if (searchRegion.width <= 0 || searchRegion.height <= 0) {
      console.warn('Invalid search region for webbing analysis')
      return {
        score: 30,
        description: 'Unable to analyze webbing - invalid region',
        details: { error: 'Invalid search region' }
      }
    }
    
    const data = imageData.data
    const width = imageData.width
    let sampleCount = 0
    let brownLinePixels = 0
    let webbingClusters = []
    
    // Step size for sampling - optimized for speed vs accuracy balance
    const step = Math.max(2, Math.floor(Math.sqrt(searchRegion.width * searchRegion.height) / 60))
    
    // First pass: Detect brown pixels that could be webbing
    let brownPixelMap = new Map()
    
    for (let y = searchRegion.y; y < searchRegion.y + searchRegion.height; y += step) {
        for (let x = searchRegion.x; x < searchRegion.x + searchRegion.width; x += step) {
            if (x >= width || y >= imageData.height) continue;

            const idx = (y * width + x) * 4;
            const r = data[idx] || 0;
            const g = data[idx + 1] || 0;
            const b = data[idx + 2] || 0;
            
            // Check if pixel is brown/dark (webbing characteristics)
            const isBrown = detectBrownWebbing(r, g, b);
            
            if (isBrown.isBrown) {
                brownLinePixels++;
                brownPixelMap.set(`${x},${y}`, {
                    x, y,
                    brownness: isBrown.brownness,
                    contrast: isBrown.contrast,
                    lineWidth: 1 // Will be calculated in clustering
                });
            }
            
            sampleCount++;
        }
    }

    // Second pass: Find concentrated webbing regions (clustering)
    const clusters = findWebbingClusters(brownPixelMap, step * 3); // Cluster radius
    
    // Third pass: Analyze line characteristics in clusters
    let totalWebbingScore = 0;
    let maxClusterScore = 0;
    
    clusters.forEach(cluster => {
        const clusterScore = analyzeWebbingCluster(cluster, data, width);
        totalWebbingScore += clusterScore.score;
        maxClusterScore = Math.max(maxClusterScore, clusterScore.score);
        
        webbingClusters.push({
            center: cluster.center,
            size: cluster.pixels.length,
            score: clusterScore.score,
            avgBrownness: clusterScore.avgBrownness,
            avgLineWidth: clusterScore.avgLineWidth,
            density: clusterScore.density
        });
    });

    // Calculate final webbing score
    const brownPixelRatio = brownLinePixels / sampleCount;
    const clusterDensity = clusters.length / (searchRegion.width * searchRegion.height / 10000); // clusters per 100x100 area
    
    // Base score from brown pixel detection
    let baseScore = Math.min(60, brownPixelRatio * 300);
    
    // Bonus for concentrated webbing regions
    let clusterBonus = 0;
    if (clusters.length > 0) {
        clusterBonus = Math.min(40, maxClusterScore * 0.6 + clusterDensity * 20);
    }
    
    // Bonus for multiple webbing areas
    let distributionBonus = 0;
    if (clusters.length >= 2) {
        distributionBonus = Math.min(20, clusters.length * 5);
    }
    
    const finalScore = Math.min(100, Math.max(0, Math.round(baseScore + clusterBonus + distributionBonus)));
    
    let description = 'Webbing analysis completed'
    if (finalScore > 80) {
      description = 'Excellent webbing density with concentrated regions - superior pollination'
    } else if (finalScore > 65) {
      description = 'Very good webbing patterns with clear brown lines'
    } else if (finalScore > 45) {
      description = 'Good webbing - some brown line patterns detected'
    } else if (finalScore > 25) {
      description = 'Moderate webbing - limited brown line patterns'
    } else if (finalScore > 10) {
      description = 'Minimal webbing - few brown lines detected'
    } else {
      description = 'No significant brown webbing patterns detected'
    }
    
    return {
      score: finalScore,
      description,
      details: {
        brownPixelRatio: Math.round(brownPixelRatio * 1000) / 1000,
        brownLinePixels,
        totalClusters: clusters.length,
        clusterDensity: Math.round(clusterDensity * 100) / 100,
        maxClusterScore: Math.round(maxClusterScore),
        baseScore: Math.round(baseScore),
        clusterBonus: Math.round(clusterBonus),
        distributionBonus: Math.round(distributionBonus),
        webbingClusters: webbingClusters.slice(0, 5), // Top 5 clusters
        sampleCount,
        searchRegion
      }
    }
    
  } catch (error) {
    console.error('Webbing analysis failed:', error)
    return {
      score: 30,
      description: 'Webbing analysis unavailable - ' + error.message,
      details: { error: error.message }
    }
  }
}

/**
 * Detect if a pixel represents brown webbing
 */
function detectBrownWebbing(r, g, b) {
  // Brown color detection - various shades from light tan to dark brown
  const brightness = (r + g + b) / 3;
  
  // Brown characteristics: R >= G >= B, with some tolerance
  const isReddishBrown = r >= g && g >= b && r > b;
  const isYellowishBrown = r >= g && r >= b && g > b * 1.2;
  
  // Calculate brownness score
  let brownness = 0;
  
  if (isReddishBrown || isYellowishBrown) {
    // Strong brown: darker colors with good red/yellow dominance
    if (brightness < 120 && r > g * 1.1 && r > b * 1.3) {
      brownness = Math.min(100, (r - b) / 2 + (r - g) / 4);
    }
    // Medium brown: moderate colors
    else if (brightness < 160 && r > g && g > b * 0.8) {
      brownness = Math.min(80, (r - b) / 3 + (r - g) / 6);
    }
    // Light brown/tan: lighter colors but still brownish
    else if (brightness < 200 && r > g * 0.9 && r > b * 1.1) {
      brownness = Math.min(60, (r - b) / 4 + (r - g) / 8);
    }
  }
  
  // Calculate contrast (how much it stands out from typical watermelon green)
  const greenWatermelonR = 80, greenWatermelonG = 120, greenWatermelonB = 60;
  const contrast = Math.sqrt(
    Math.pow(r - greenWatermelonR, 2) +
    Math.pow(g - greenWatermelonG, 2) +
    Math.pow(b - greenWatermelonB, 2)
  );
  
  return {
    isBrown: brownness > 15, // Threshold for considering it brown webbing
    brownness,
    contrast,
    brightness
  };
}

/**
 * Find clusters of brown pixels that represent webbing regions
 */
function findWebbingClusters(brownPixelMap, clusterRadius) {
  const pixels = Array.from(brownPixelMap.values());
  const clusters = [];
  const visited = new Set();
  
  pixels.forEach(pixel => {
    const key = `${pixel.x},${pixel.y}`;
    if (visited.has(key)) return;
    
    // Start new cluster
    const cluster = {
      center: { x: pixel.x, y: pixel.y },
      pixels: [pixel],
      totalBrownness: pixel.brownness,
      totalContrast: pixel.contrast
    };
    
    // Find nearby pixels to add to cluster
    const queue = [pixel];
    visited.add(key);
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      pixels.forEach(other => {
        const otherKey = `${other.x},${other.y}`;
        if (visited.has(otherKey)) return;
        
        const distance = Math.sqrt(
          Math.pow(current.x - other.x, 2) +
          Math.pow(current.y - other.y, 2)
        );
        
        if (distance <= clusterRadius) {
          visited.add(otherKey);
          cluster.pixels.push(other);
          cluster.totalBrownness += other.brownness;
          cluster.totalContrast += other.contrast;
          queue.push(other);
          
          // Update cluster center (weighted average)
          const totalPixels = cluster.pixels.length;
          cluster.center.x = cluster.pixels.reduce((sum, p) => sum + p.x, 0) / totalPixels;
          cluster.center.y = cluster.pixels.reduce((sum, p) => sum + p.y, 0) / totalPixels;
        }
      });
    }
    
    // Only keep clusters with minimum size
    if (cluster.pixels.length >= 3) {
      clusters.push(cluster);
    }
  });
  
  return clusters.sort((a, b) => b.pixels.length - a.pixels.length); // Sort by size
}

/**
 * Analyze characteristics of a webbing cluster
 */
function analyzeWebbingCluster(cluster, imageData, width) {
  const pixels = cluster.pixels;
  const avgBrownness = cluster.totalBrownness / pixels.length;
  const avgContrast = cluster.totalContrast / pixels.length;
  
  // Estimate line width by analyzing pixel distribution
  const distances = [];
  const centerX = cluster.center.x;
  const centerY = cluster.center.y;
  
  pixels.forEach(pixel => {
    const dist = Math.sqrt(
      Math.pow(pixel.x - centerX, 2) +
      Math.pow(pixel.y - centerY, 2)
    );
    distances.push(dist);
  });
  
  const avgLineWidth = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const maxLineWidth = Math.max(...distances);
  
  // Calculate cluster density
  const boundingArea = Math.PI * Math.pow(maxLineWidth, 2);
  const density = pixels.length / boundingArea;
  
  // Score this cluster
  let clusterScore = 0;
  
  // Base score from brownness and contrast
  clusterScore += Math.min(40, avgBrownness * 0.6);
  clusterScore += Math.min(20, avgContrast * 0.2);
  
  // Bonus for larger clusters (more concentrated webbing)
  clusterScore += Math.min(25, pixels.length * 2);
  
  // Bonus for wider lines (more prominent webbing)
  clusterScore += Math.min(15, avgLineWidth * 0.5);
  
  return {
    score: Math.min(100, clusterScore),
    avgBrownness: Math.round(avgBrownness),
    avgContrast: Math.round(avgContrast),
    avgLineWidth: Math.round(avgLineWidth * 10) / 10,
    maxLineWidth: Math.round(maxLineWidth * 10) / 10,
    density: Math.round(density * 100) / 100
  };
}

/**
 * Analyze gender (traditional belief) - 5% weight
 * Derived from shape ratio - included for completeness but low scientific basis
 */
export async function analyzeGender(imageData, modelPrediction) {
  try {
    const contour = findWatermelonContour(imageData)
    const { width, height } = contour.boundingBox
    
    if (width === 0 || height === 0) {
      throw new Error('Could not detect watermelon shape for gender analysis')
    }
    
    const aspectRatio = height === 0 ? 1 : width / height
    
    // Traditional belief: "female" watermelons (wider) are sweeter
    // "male" watermelons (taller) are more watery
    // This is largely myth but included as requested
    
    let genderScore = 50 // Default neutral score
    let genderType = 'neutral'
    let description = 'Gender analysis based on traditional beliefs'
    
    if (aspectRatio > 1.1) {
      // Wider than tall - traditionally "female"
      genderType = 'female'
      genderScore = 70
      description = 'Wide shape - traditionally considered "female" (sweeter)'
    } else if (aspectRatio < 0.9) {
      // Taller than wide - traditionally "male"  
      genderType = 'male'
      genderScore = 30
      description = 'Tall shape - traditionally considered "male" (more watery)'
    } else {
      // Roughly equal - neutral
      genderType = 'neutral'
      genderScore = 50
      description = 'Balanced shape - neutral gender characteristics'
    }
    
    return {
      score: Math.round(genderScore),
      description: description + ' (Note: Limited scientific basis)',
      details: {
        aspectRatio: Math.round(aspectRatio * 100) / 100,
        genderType,
        width,
        height,
        note: 'Gender analysis based on traditional beliefs with limited scientific evidence'
      }
    }
    
  } catch (error) {
    console.error('Gender analysis failed:', error)
    return {
      score: 50,
      description: 'Gender analysis unavailable (Note: Limited scientific basis)',
      details: { error: error.message }
    }
  }
}