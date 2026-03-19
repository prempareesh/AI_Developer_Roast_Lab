const admin = require('firebase-admin');

try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || 'ai-dev-roast-lab-123'
    });
    console.log("✅ Firebase Admin initialized successfully.");
} catch (err) {
    console.warn("⚠️ Firebase initialization failed. Firestore operations will be skipped.", err.message);
}


const db = admin.firestore();

module.exports = { admin, db };
