# RateMyMelon API Documentation

This document provides comprehensive documentation for the RateMyMelon API endpoints.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://ratemymelon.onrender.com`

## Authentication

Currently, the API does not require authentication for public endpoints. Future versions may include API key authentication for advanced features.

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Image Upload**: 2 requests per second per IP with burst of 5
- **Analytics**: Admin access only (future implementation)

## Content Types

- **Request**: `multipart/form-data` for image uploads, `application/json` for other requests
- **Response**: `application/json`

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional details (development only)"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (database connection issues)

## Endpoints

### Health Check

Check the API health status.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-07-20T01:30:00.000Z"
}
```

**Example**:
```bash
curl -X GET https://ratemymelon.onrender.com/api/health
```

---

### Analyze Watermelon

Upload an image and analysis results for data collection.

**Endpoint**: `POST /api/analyze`

**Content-Type**: `multipart/form-data`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP, max 10MB) |
| `analysisResults` | String/JSON | Yes | JSON string of analysis results |
| `userConsent` | String | Yes | Must be "true" for data collection |
| `sessionId` | String | No | Unique session identifier |

**Analysis Results Format**:
```json
{
  "overallScore": 85,
  "fieldSpotColor": {
    "score": 90,
    "description": "Excellent creamy field spot",
    "details": {
      "dominantColor": "#F5E6D3",
      "colorIntensity": 0.85,
      "coverage": 0.12
    }
  },
  "stemColor": {
    "score": 80,
    "description": "Good brown stem color",
    "details": {
      "brownness": 0.75,
      "dryness": 0.80
    }
  },
  "skinDullness": {
    "score": 75,
    "description": "Moderately dull skin",
    "details": {
      "dullnessScore": 0.75,
      "shininess": 0.25
    }
  },
  "shapeRatio": {
    "score": 85,
    "description": "Good oval shape",
    "details": {
      "ratio": 1.3,
      "symmetry": 0.85
    }
  },
  "webbingDensity": {
    "score": 70,
    "description": "Moderate webbing pattern",
    "details": {
      "density": 0.35,
      "coverage": 0.20,
      "lineCount": 15
    }
  },
  "recommendations": [
    "This watermelon shows good ripeness indicators",
    "The field spot suggests optimal sugar development"
  ]
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Analysis data saved successfully",
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/watermelon-training-data/watermelon_session123_1234567890.jpg",
  "analysisId": "watermelon_session123_1234567890"
}
```

**Error Responses**:

```json
// Missing image
{
  "error": "No image file provided"
}

// Missing consent
{
  "error": "User consent required for data collection"
}

// Invalid analysis results
{
  "error": "Invalid analysis results format"
}

// File too large
{
  "error": "File too large"
}

// Invalid file type
{
  "error": "Only image files are allowed"
}
```

**Example**:
```bash
curl -X POST https://ratemymelon.onrender.com/api/analyze \
  -F "image=@watermelon.jpg" \
  -F "userConsent=true" \
  -F "sessionId=unique-session-123" \
  -F 'analysisResults={"overallScore":85,"fieldSpotColor":{"score":90,"description":"Excellent"}}'
```

**JavaScript Example**:
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('userConsent', 'true');
formData.append('sessionId', 'unique-session-123');
formData.append('analysisResults', JSON.stringify(analysisResults));

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

---

### Analytics (Admin)

Get aggregated analytics data about watermelon analyses.

**Endpoint**: `GET /api/analytics`

**Note**: This endpoint is intended for administrative use and may require authentication in future versions.

**Response**:
```json
{
  "totalAnalyses": 1250,
  "recentAnalyses": 45,
  "averageScores": {
    "avgOverallScore": 78.5,
    "avgFieldSpot": 82.3,
    "avgStem": 75.8,
    "avgSkin": 71.2,
    "avgShape": 80.1,
    "avgWebbing": 68.9
  },
  "timestamp": "2024-07-20T01:30:00.000Z"
}
```

**Error Response**:
```json
{
  "error": "Database not available"
}
```

**Example**:
```bash
curl -X GET https://ratemymelon.onrender.com/api/analytics
```

## Data Models

### Analysis Document

The complete structure of an analysis document stored in the database:

```json
{
  "_id": "ObjectId",
  "sessionId": "unique-session-123",
  "imageUrl": "https://res.cloudinary.com/...",
  "cloudinaryPublicId": "watermelon_session123_1234567890",
  "analysisResults": {
    "overallScore": 85,
    "fieldSpotColor": {
      "score": 90,
      "description": "Excellent creamy field spot",
      "details": { /* detailed analysis data */ }
    },
    "stemColor": { /* stem analysis */ },
    "skinDullness": { /* skin analysis */ },
    "shapeRatio": { /* shape analysis */ },
    "webbingDensity": { /* webbing analysis */ },
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "userConsent": true,
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "timestamp": "2024-07-20T01:30:00.000Z",
  "imageMetadata": {
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "size": 2048576
  }
}
```

## Image Requirements

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Size Limits
- Maximum file size: 10MB
- Recommended resolution: 800x600 to 4000x3000 pixels
- Minimum resolution: 300x300 pixels

### Quality Guidelines
- Clear, well-lit images work best
- Avoid blurry or heavily compressed images
- Include the entire watermelon in the frame
- Ensure good contrast between watermelon and background

## Integration Examples

### React/JavaScript Integration

```javascript
import { useState } from 'react';

const WatermelonAnalyzer = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeWatermelon = async (imageFile, analysisResults, userConsent) => {
    if (!userConsent) {
      throw new Error('User consent is required');
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('analysisResults', JSON.stringify(analysisResults));
      formData.append('userConsent', 'true');
      formData.append('sessionId', generateSessionId());

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setResult(result);
      return result;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
};
```

### Python Integration

```python
import requests
import json

def analyze_watermelon(image_path, analysis_results, user_consent=True):
    """
    Upload watermelon image and analysis results to RateMyMelon API
    """
    url = "https://ratemymelon.onrender.com/api/analyze"
    
    with open(image_path, 'rb') as image_file:
        files = {
            'image': image_file
        }
        data = {
            'analysisResults': json.dumps(analysis_results),
            'userConsent': 'true' if user_consent else 'false',
            'sessionId': f'python_session_{int(time.time())}'
        }
        
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"API request failed: {response.status_code} - {response.text}")

# Example usage
analysis_data = {
    "overallScore": 85,
    "fieldSpotColor": {"score": 90, "description": "Excellent"},
    # ... other analysis results
}

result = analyze_watermelon('watermelon.jpg', analysis_data)
print(f"Upload successful: {result['imageUrl']}")
```

## Error Handling Best Practices

### Client-Side Error Handling

```javascript
const handleApiError = (error, response) => {
  if (response?.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  } else if (response?.status === 400) {
    return 'Invalid request. Please check your data and try again.';
  } else if (response?.status >= 500) {
    return 'Server error. Please try again later.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};
```

### Retry Logic

```javascript
const apiCallWithRetry = async (apiCall, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries || error.status === 400) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

## Security Considerations

### Data Privacy
- User consent is required for all data collection
- Images are stored securely on Cloudinary
- IP addresses are logged for security purposes only
- No personal information is collected beyond what's necessary

### Rate Limiting
- Implement client-side rate limiting to avoid hitting API limits
- Use exponential backoff for retry logic
- Monitor your application's API usage

### Input Validation
- Always validate file types and sizes on the client side
- Sanitize any user inputs before sending to the API
- Handle all possible error responses gracefully

## Changelog

### Version 1.0.0
- Initial API release
- Health check endpoint
- Image upload and analysis storage
- Basic analytics endpoint
- Rate limiting implementation
- Error handling and validation

## Support

For API support and questions:
- GitHub Issues: [Create an issue](https://github.com/your-username/ratemymelon/issues)
- Email: api-support@ratemymelon.com
- Documentation: This file and README.md

## Future Enhancements

Planned API improvements:
- Authentication and API keys
- Webhook support for real-time notifications
- Batch processing endpoints
- Advanced analytics and reporting
- GraphQL endpoint
- WebSocket support for real-time updates