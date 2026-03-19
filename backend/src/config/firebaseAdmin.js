const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// During local development, this will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
// Or the default credentials if logged into gcloud/firebase CLI
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID || 'ai-dev-roast-lab-123'
});


const db = admin.firestore();

module.exports = { admin, db };
