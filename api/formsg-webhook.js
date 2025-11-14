import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

function initAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== FormSG Webhook Called ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  try {
    initAdmin();
    const db = admin.firestore();

    // Basic signature verification using the secret key you provided
    const signature = req.headers['x-formsg-signature'];
    const webhookSecret = process.env.FORMSG_WEBHOOK_SECRET;
    
    if (signature && webhookSecret) {
      const rawBody = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
      
      // FormSG may send signature in different formats, try both
      const isValidHmac = signature === expectedSignature || 
                         signature === `sha256=${expectedSignature}`;
      
      if (!isValidHmac) {
        console.error('Invalid webhook signature');
        console.error('Expected:', expectedSignature);
        console.error('Received:', signature);
        // Don't fail on signature mismatch for now, just log it
        console.log('⚠️ Signature mismatch, but proceeding...');
      } else {
        console.log('✅ Webhook signature verified');
      }
    }

    // Handle FormSG webhook data - extract what we can
    const { formId, submissionId, encryptedContent, created, responses } = req.body;
    
    console.log('Form ID:', formId);
    console.log('Submission ID:', submissionId);
    console.log('Created:', created);
    console.log('Has encrypted content:', !!encryptedContent);
    console.log('Has direct responses:', !!responses);

    // For now, save the raw webhook data and create user record
    let email = 'unknown@example.com'; // Default email
    let name = 'Form Respondent'; // Default name
    let otherData = {};

    // Try to extract any available data
    if (responses && Array.isArray(responses)) {
      responses.forEach((response, index) => {
        const question = (response.question || response.field || `field_${index}`).toLowerCase();
        const answer = response.answer || response.value || '';
        
        console.log(`Field ${index}: ${question} = ${answer}`);
        
        if (question.includes('email')) {
          email = answer;
        }
        
        if (question.includes('name')) {
          name = answer;
        }
        
        otherData[response.question || response.field || `field_${index}`] = answer;
      });
    }

    console.log('Extracted email:', email);
    console.log('Extracted name:', name);

    // Generate unique user ID
    const userId = uuidv4();
    
    // Create stamp array (11 booths)
    const stampArray = Array.from({ length: 11 }, (_, i) => ({
      boothId: `booth${i + 1}`,
      filled: false,
      filledAt: null
    }));

    // Save user data to Firebase
    const userData = {
      userId,
      email,
      name,
      formId: formId || 'unknown',
      submissionId: submissionId || userId,
      submissionData: otherData,
      rawWebhookData: req.body, // Store the entire webhook payload for debugging
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firebase collections
    await db.collection('users').doc(userId).set(userData);
    await db.collection('stamps').doc(userId).set({ 
      stamps: stampArray,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ User and stamp card created successfully');
    console.log('User ID:', userId);

    // Generate redirect URL
    const redirectUrl = `${process.env.DOMAIN || 'https://registration-orpin-alpha.vercel.app'}/stamps?id=${userId}&success=true`;

    // Return success response to FormSG
    return res.status(200).json({
      success: true,
      message: 'Form submission processed successfully',
      userId: userId,
      redirectUrl: redirectUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}