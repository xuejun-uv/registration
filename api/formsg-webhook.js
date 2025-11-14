import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

function initAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}

// Function to verify FormSG signature (optional but recommended)
function verifySignature(body, signature, secret) {
  if (!secret || !signature) return true; // Skip verification if no secret configured
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Function to decrypt FormSG submission (if encryption is enabled)
function decryptSubmission(encryptedContent, secretKey) {
  try {
    if (!secretKey) {
      console.log('No secret key provided, assuming unencrypted data');
      return JSON.parse(encryptedContent);
    }

    // FormSG encryption format: {iv}:{encryptedData}
    const [ivHex, encryptedData] = encryptedContent.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedData, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(secretKey, 'hex'), iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error('Decryption failed, treating as plain text:', error);
    return typeof encryptedContent === 'string' ? 
      JSON.parse(encryptedContent) : encryptedContent;
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
    
    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-formsg-signature'];
    const webhookSecret = process.env.FORMSG_WEBHOOK_SECRET;
    
    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifySignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('❌ Invalid FormSG signature');
        return res.status(401).json({ error: 'Unauthorized - Invalid signature' });
      }
      console.log('✅ FormSG signature verified successfully');
    }
    
    // Enhanced logging
    console.log('🔔 FormSG webhook received at:', new Date().toISOString());
    console.log('📝 Raw body:', JSON.stringify(req.body, null, 2));
    
    let formData = req.body;
    let submissions = [];
    
    // Handle different FormSG data formats
    if (formData.encryptedContent) {
      // Encrypted submission
      const secretKey = process.env.FORMSG_SECRET_KEY;
      submissions = decryptSubmission(formData.encryptedContent, secretKey);
    } else if (formData.responses) {
      // Direct responses format
      submissions = req.body.responses;
      formData = req.body;
    } else {
      // Legacy format or direct data
      submissions = Array.isArray(req.body) ? req.body : [req.body];
    }

    console.log('Processed submissions:', submissions);
    
    // Extract email and name from submissions
    let email = '';
    let name = '';
    let additionalData = {};
    
    // Parse form responses
    if (Array.isArray(submissions)) {
      submissions.forEach(response => {
        const question = (response.question || '').toLowerCase();
        const answer = response.answer || response.value || '';
        
        if (question.includes('email')) {
          email = answer;
        } else if (question.includes('name') && !name) {
          name = answer;
        } else {
          // Store other form fields
          additionalData[question] = answer;
        }
      });
    }
    
    // Fallback email extraction
    if (!email) {
      if (formData.email) email = formData.email;
      else if (formData.data?.email) email = formData.data.email;
    }

    // Log extracted form data
    console.log('✅ FormSG webhook received:', { 
      email: email || "N/A", 
      name: name || "N/A",
      formId: formData.formId || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Generate unique user ID
    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Create stamp array with 11 booths (4+3+4)
    const stampArray = Array.from({ length: 11 }, (_, i) => ({
      boothId: `booth${i + 1}`,
      filled: false,
      filledAt: null
    }));
    
    // Save user data to Firestore
    await db.collection('users').doc(userId).set({
      email: email,
      name: name,
      formId: formData.formId || 'unknown',
      submissionId: formData.submissionId || userId,
      createdAt: timestamp,
      formData: formData,
      additionalData: additionalData
    });
    
    // Save stamp card
    await db.collection('stamps').doc(userId).set({
      stamps: stampArray,
      createdAt: timestamp,
      userId: userId
    });
    
    console.log(`✅ Created user ${userId} with email: ${email || "N/A"}, name: ${name || "N/A"}`);
    console.log(`📍 User ID: ${userId}`);
    console.log(`🎯 Stamp card created with ${stampArray.length} booths`);
    
    // Generate redirect URL with user ID
    const redirectUrl = `${process.env.DOMAIN || 'https://registration-orpin-alpha.vercel.app'}/stamps?id=${userId}`;
    
    // Return success response
    return res.status(200).json({
      success: true,
      userId: userId,
      email: email,
      name: name,
      redirectUrl: redirectUrl,
      message: 'Registration completed successfully',
      timestamp: timestamp
    });
    
  } catch (error) {
    console.error('❌ Error processing FormSG webhook:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}