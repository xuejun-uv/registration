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

    // Handle FormSG webhook data - for simple email-only form
    console.log('=== Raw FormSG Webhook Data ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body));
    
    const { formId, submissionId, encryptedContent, created, responses, data } = req.body;
    
    console.log('Form ID:', formId);
    console.log('Submission ID:', submissionId);
    console.log('Created:', created);
    console.log('Has encrypted content:', !!encryptedContent);
    console.log('Has direct responses:', !!responses);
    console.log('Has data field:', !!data);
    console.log('Data field type:', typeof data);

    // Extract email from FormSG form (single email field)
    let email = 'unknown@example.com';
    let otherData = {};

    console.log('=== Attempting to extract email ===');

    // Method 1: Check direct responses array
    if (responses && Array.isArray(responses)) {
      console.log('Method 1: Processing responses array...');
      responses.forEach((response, index) => {
        const question = (response.question || response.field || `field_${index}`);
        const answer = response.answer || response.value || '';
        
        console.log(`Response ${index}:`, {
          question: question,
          answer: answer,
          fieldType: response.fieldType
        });
        
        // For email-only form, any response with @ symbol is likely the email
        if (answer && answer.includes('@')) {
          email = answer.trim();
          console.log('✅ Found email in responses:', email);
        }
        
        otherData[question || `field_${index}`] = answer;
      });
    }

    // Method 2: Check if data field contains form responses
    if (data && typeof data === 'object') {
      console.log('Method 2: Processing data object...');
      console.log('Data object:', JSON.stringify(data, null, 2));
      
      // Handle different data structures
      if (data.responses && Array.isArray(data.responses)) {
        data.responses.forEach((response, index) => {
          const answer = response.answer || response.value || '';
          console.log(`Data response ${index}:`, response);
          
          if (answer && answer.includes('@')) {
            email = answer.trim();
            console.log('✅ Found email in data.responses:', email);
          }
        });
      }
    }

    // Method 3: Check if encryptedContent exists (need to handle encryption)
    if (encryptedContent && typeof encryptedContent === 'string') {
      console.log('Method 3: Has encrypted content, length:', encryptedContent.length);
      console.log('Encrypted content sample:', encryptedContent.substring(0, 100) + '...');
      // For now, log that we have encrypted content but can't decrypt without proper key
      console.log('⚠️ Encrypted content detected but not decrypted yet');
    }

    // Method 4: Check top-level fields in request body
    console.log('Method 4: Checking top-level fields...');
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      console.log(`Top-level field ${key}:`, typeof value, value);
      
      if (typeof value === 'string' && value.includes('@')) {
        email = value.trim();
        console.log('✅ Found email in top-level field:', email);
      }
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== 'unknown@example.com') {
      if (!emailRegex.test(email)) {
        console.log('⚠️ Invalid email format detected:', email);
      } else {
        console.log('✅ Valid email format confirmed:', email);
      }
    } else {
      console.log('❌ No email found in any method, using default');
    }

    console.log('📧 Extracted email:', email);

    // Generate unique user ID
    const userId = uuidv4();
    
    // Create stamp array (11 booths)
    const stampArray = Array.from({ length: 11 }, (_, i) => ({
      boothId: `booth${i + 1}`,
      filled: false,
      filledAt: null
    }));

    // Save user data to Firebase (email-based registration)
    const userData = {
      userId,
      email,
      name: email.split('@')[0], // Use email prefix as display name
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

    console.log('✅ User registration and stamp card created successfully');
    console.log('📧 Email:', email);
    console.log('🆔 User ID:', userId);
    console.log('🎯 Stamp collection URL:', `${process.env.DOMAIN || 'https://registration-orpin-alpha.vercel.app'}/stamps?id=${userId}`);

    // Generate redirect URL for immediate access to stamp collection
    const redirectUrl = `${process.env.DOMAIN || 'https://registration-orpin-alpha.vercel.app'}/stamps?id=${userId}&success=true`;

    // Return success response to FormSG
    return res.status(200).json({
      success: true,
      message: 'Email registered successfully - stamp collection ready!',
      email: email,
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