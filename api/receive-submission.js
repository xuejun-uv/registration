// Simple API to receive submission ID from tutor's middleman
// URL: https://registration-orpin-alpha.vercel.app/api/receive-submission

const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse existing initialization if available)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    console.log('Received request:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query
    });

    // Extract submission ID from request
    const submissionId = req.body.submissionId || req.body.submission_id || req.query.submissionId;
    
    if (!submissionId) {
      return res.status(400).json({
        error: 'Missing submission ID',
        message: 'Please provide submissionId in request body or query parameter'
      });
    }

    // Optional: Extract additional data
    const additionalData = {
      userId: req.body.userId || req.body.user_id,
      email: req.body.email,
      timestamp: new Date().toISOString(),
      source: 'middleman-api'
    };

    // Save submission data to Firebase
    const submissionRef = db.collection('submissions').doc(submissionId);
    await submissionRef.set({
      submissionId: submissionId,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...additionalData
    });

    console.log('Submission saved:', submissionId);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Submission ID received successfully',
      submissionId: submissionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}