import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

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

  try {
    initAdmin();
    const db = admin.firestore();

    const { nickname } = req.body || {};
    const name = (nickname || '').toString().trim();
    if (!name || name.length < 2 || name.length > 20) {
      return res.status(400).json({ success: false, message: 'Nickname must be 2-20 characters' });
    }

    // Generate a unique user id
    const userId = uuidv4();

    // Create user document
    const userDoc = {
      nickname: name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userId).set(userDoc);

    // Initialize stamps - 11 slots as in the app
    const stampsArray = Array.from({ length: 11 }, (_, i) => ({
      boothId: `booth${i + 1}`,
      filled: false
    }));

    await db.collection('stamps').doc(userId).set({ stamps: stampsArray, userId, createdAt: admin.firestore.FieldValue.serverTimestamp() });

    return res.status(200).json({ success: true, id: userId });
  } catch (err) {
    console.error('Error creating guest:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
