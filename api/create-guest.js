import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

function initAdmin() {
  if (!admin.apps.length) {
    try {
      console.log('Initializing Firebase Admin...');
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      
      if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing');
      }
      
      const serviceAccount = JSON.parse(serviceAccountJson);
      console.log('Service account loaded for project:', serviceAccount.project_id);
      
      admin.initializeApp({ 
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error);
      throw new Error(`Firebase initialization failed: ${error.message}`);
    }
  } else {
    console.log('Firebase Admin already initialized');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== Create Guest API Called ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Environment check:', {
    hasFirebaseAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    nodeEnv: process.env.NODE_ENV
  });

  try {
    // Validate environment variables first
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('Missing FIREBASE_SERVICE_ACCOUNT environment variable');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error - missing Firebase credentials',
        error: 'MISSING_FIREBASE_CONFIG'
      });
    }

    initAdmin();
    const db = admin.firestore();

    const { nickname } = req.body || {};
    console.log('Extracted nickname:', nickname);
    
    const name = (nickname || '').toString().trim();
    console.log('Processed name:', name, 'Length:', name.length);
    
    if (!name || name.length < 2 || name.length > 20) {
      console.log('Validation failed - invalid nickname length');
      return res.status(400).json({ success: false, message: 'Nickname must be 2-20 characters' });
    }

    // Generate a unique user id
    const userId = uuidv4();
    console.log('Generated userId:', userId);

    // Create user document
    const userDoc = {
      nickname: name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('Creating user document...');
    await db.collection('users').doc(userId).set(userDoc);
    console.log('User document created successfully');

    // Initialize stamps - 11 slots as in the app
    const stampsArray = Array.from({ length: 11 }, (_, i) => ({
      boothId: `booth${i + 1}`,
      filled: false
    }));

    console.log('Creating stamps document...');
    await db.collection('stamps').doc(userId).set({ 
      stamps: stampsArray, 
      userId, 
      createdAt: admin.firestore.FieldValue.serverTimestamp() 
    });
    console.log('Stamps document created successfully');

    console.log('✅ Guest creation completed successfully');
    return res.status(200).json({ success: true, id: userId });
    
  } catch (err) {
    console.error('❌ Error creating guest:', err);
    console.error('Error stack:', err.stack);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    
    // Provide specific error information
    let errorMessage = 'Internal server error';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (err.message?.includes('service account')) {
      errorMessage = 'Firebase authentication failed';
      errorCode = 'FIREBASE_AUTH_ERROR';
    } else if (err.message?.includes('PERMISSION_DENIED')) {
      errorMessage = 'Database permission denied';
      errorCode = 'PERMISSION_ERROR';
    } else if (err.message?.includes('network')) {
      errorMessage = 'Network connection failed';
      errorCode = 'NETWORK_ERROR';
    }
    
    return res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: errorCode,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
