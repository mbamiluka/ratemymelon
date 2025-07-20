// MongoDB initialization script for Docker
// This script runs when the MongoDB container starts for the first time

// Switch to the ratemymelon database
db = db.getSiblingDB('ratemymelon');

// Create a user for the application
db.createUser({
  user: process.env.MONGO_INITDB_USER || 'ratemymelon_user',
  pwd: process.env.MONGO_INITDB_PASSWORD || 'ratemymelon_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ratemymelon'
    }
  ]
});

// Create indexes for better performance
db.analyses.createIndex({ "sessionId": 1 });
db.analyses.createIndex({ "timestamp": -1 });
db.analyses.createIndex({ "userConsent": 1 });
db.analyses.createIndex({ "analysisResults.overallScore": 1 });

// Create a sample collection to ensure the database is properly initialized
db.analyses.insertOne({
  _id: ObjectId(),
  sessionId: "init_session",
  imageUrl: "https://example.com/init.jpg",
  cloudinaryPublicId: "init_image",
  analysisResults: {
    overallScore: 0,
    fieldSpotColor: { score: 0, description: "Initialization record" },
    stemColor: { score: 0, description: "Initialization record" },
    skinDullness: { score: 0, description: "Initialization record" },
    shapeRatio: { score: 0, description: "Initialization record" },
    webbingDensity: { score: 0, description: "Initialization record" },
    recommendations: ["This is an initialization record"]
  },
  userConsent: true,
  userAgent: "MongoDB Init Script",
  ipAddress: "127.0.0.1",
  timestamp: new Date(),
  imageMetadata: {
    width: 0,
    height: 0,
    format: "init",
    size: 0
  }
});

print('Database initialized successfully');
print('Created user: ratemymelon_user');
print('Created indexes on analyses collection');
print('Inserted initialization record');