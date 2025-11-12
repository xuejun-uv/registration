import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

function initAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}

export default async function handler(req, res) {
  // Only accept POST requests from FormSG
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initAdmin();
    const db = admin.firestore();
    
    // Extract data from FormSG webhook
    const formData = req.body;
    console.log('FormSG webhook received:', formData);
    
    // Extract email from the form submission
    // FormSG sends data in different formats, so we'll handle common cases
    let email = '';
    let formId = formData.formId || '';
    
    // Try to find email in different possible locations
    if (formData.data) {
      // Look for email field in the form data
      const emailField = formData.data.find(field => 
        field.question && field.question.toLowerCase().includes('email')
      );
      if (emailField) {
        email = emailField.answer;
      }
    }
    
    // If no email found in data array, check direct properties
    if (!email && formData.email) {
      email = formData.email;
    }
    
    // Generate unique user ID
    const userId = uuidv4();
    
    // Create stamp array with 11 booths (4+3+4)
    const stampArray = Array.from({ length: 11 }, (_, i) => ({
      boothId: `booth${i + 1}`,
      filled: false,
      filledAt: null
    }));
    
    // Save user data
    await db.collection('users').doc(userId).set({
      email: email,
      formId: formId,
      createdAt: new Date().toISOString(),
      formData: formData, // Store complete form data for reference
    });
    
    // Save stamp card
    await db.collection('stamps').doc(userId).set({
      stamps: stampArray,
      createdAt: new Date().toISOString(),
    });
    
    console.log(`Created user ${userId} with email: ${email}`);
    
    // Generate redirect URL with user ID
    const redirectUrl = `${process.env.DOMAIN || 'https://registration-smoky-chi.vercel.app'}/stamps?id=${userId}`;
    
    // Return response for FormSG
    return res.status(200).json({
      success: true,
      userId: userId,
      redirectUrl: redirectUrl,
      message: 'User registered successfully'
    });
    
  } catch (error) {
    console.error('Error processing FormSG webhook:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}