import React from 'react'
import { Award, Info } from 'lucide-react'

const ScoreDisplay = ({ results }) => {
  // Helper function to ensure safe numeric values
  const safeValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined || isNaN(value)) {
      return defaultValue;
    }
    return value;
  };

  const {
    overallScore,
    fieldSpotColor,
    stemColor,
    skinDullness,
    shapeRatio,
    webbingDensity,
    confidence,
    recommendations
  } = results

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getOverallGrade = (score) => {
    if (score >= 90) return { grade: 'A+', desc: 'Excellent' }
    if (score >= 80) return { grade: 'A', desc: 'Very Good' }
    if (score >= 70) return { grade: 'B', desc: 'Good' }
    if (score >= 60) return { grade: 'C', desc: 'Fair' }
    return { grade: 'D', desc: 'Poor' }
  }

  const criteria = [
    {
      name: 'Field Spot Color',
      score: safeValue(fieldSpotColor?.score),
      weight: 30,
      description: fieldSpotColor?.description || 'Analysis unavailable',
      details: 'Deeper yellow indicates longer vine time and sweeter melon'
    },
    {
      name: 'Stem Color',
      score: safeValue(stemColor?.score),
      weight: 25,
      description: stemColor?.description || 'Analysis unavailable',
      details: 'Brown/dry stem means vine-ripened; green means picked early'
    },
    {
      name: 'Skin Dullness',
      score: safeValue(skinDullness?.score),
      weight: 25,
      description: skinDullness?.description || 'Analysis unavailable',
      details: 'Dull skin indicates maturity; shiny skin suggests underripe'
    },
    {
      name: 'Shape Ratio',
      score: safeValue(shapeRatio?.score),
      weight: 10,
      description: shapeRatio?.description || 'Analysis unavailable',
      details: 'Rounder melons tend to be sweeter; oblong ones more watery'
    },
    {
      name: 'Webbing Density',
      score: safeValue(webbingDensity?.score),
      weight: 10,
      description: webbingDensity?.description || 'Analysis unavailable',
      details: 'More webbing indicates better pollination and sugar development'
    }
  ]

  const overallGrade = getOverallGrade(safeValue(overallScore))

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="overall-score">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Award className="w-12 h-12" />
          <div>
            <div className="score-value">{safeValue(overallScore)}</div>
            <div className="text-xl font-semibold">
              Grade {overallGrade.grade} - {overallGrade.desc}
            </div>
          </div>
        </div>
        <div className="text-green-100 text-sm">
          💡 <strong>Tip:</strong> Take photo from the side, not top.
        </div>
      </div>

      {/* Individual Scores */}
      <div className="score-grid">
        {criteria.map((criterion, index) => (
          <div key={index} className="score-item">
            <div className="flex justify-between items-start mb-2">
              <div className="score-label font-medium">
                {criterion.name} ({criterion.weight}%)
              </div>
              <div className={`score-value text-2xl ${getScoreColor(criterion.score).split(' ')[0]}`}>
                {safeValue(criterion.score)}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {criterion.description}
            </div>
            <div className="text-xs text-gray-500 italic">
              {criterion.details}
            </div>
            
            {/* Score bar */}
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  criterion.score >= 80 ? 'bg-green-500' :
                  criterion.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${criterion.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">
              Recommendations
            </h3>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-blue-700 text-sm flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quality Summary */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-3">Quality Summary</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Best Features:</strong> {
              criteria
                .filter(c => c.score >= 80)
                .map(c => c.name)
                .join(', ') || 'None identified'
            }
          </p>
          <p>
            <strong>Areas for Improvement:</strong> {
              criteria
                .filter(c => c.score < 60)
                .map(c => c.name)
                .join(', ') || 'None identified'
            }
          </p>
          <p className="text-xs text-gray-500 mt-4">
            * Scores are based on visual analysis and may vary from actual taste.
            This tool is designed to assist in watermelon selection, not replace personal preference.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay