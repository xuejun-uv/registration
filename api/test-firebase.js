import admin from 'firebase-admin';

function initAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing Firebase connection...');
    
    initAdmin();
    const db = admin.firestore();
    
    // Test write operation
    const testDoc = {
      message: 'Firebase connection test',
      timestamp: new Date().toISOString(),
      testData: {
        email: 'test@example.com',
        name: 'Test User'
      }
    };
    
    const testRef = db.collection('test').doc('connection-test');
    await testRef.set(testDoc);
    console.log('✅ Test document written successfully');
    
    // Test read operation
    const testRead = await testRef.get();
    console.log('✅ Test document read successfully:', testRead.data());
    
    // Test users collection structure
    const usersSnapshot = await db.collection('users').limit(1).get();
    const stampsSnapshot = await db.collection('stamps').limit(1).get();
    
    console.log('📊 Database stats:', {
      usersCount: usersSnapshot.size,
      stampsCount: stampsSnapshot.size
    });
    
    // Clean up test document
    await testRef.delete();
    console.log('🧹 Test document cleaned up');
    
    return res.status(200).json({
      success: true,
      message: 'Firebase connection successful',
      timestamp: new Date().toISOString(),
      collections: {
        users: usersSnapshot.size,
        stamps: stampsSnapshot.size
      },
      firebaseProject: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'N/A'
    });
    
  } catch (error) {
    console.error('❌ Firebase connection error:', error);
    return res.status(500).json({
      success: false,
      error: 'Firebase connection failed',
      message: error.message,
      firebaseProject: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'N/A'
    });
  }
}