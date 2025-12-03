import admin from 'firebase-admin';


function initAdmin() {
if (!admin.apps.length) {
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
}


export default async function handler(req, res) {
try {
initAdmin();
const db = admin.firestore();

const { id } = req.query;
if (!id) return res.status(400).json({ success: false, error: 'Missing user ID' });

// Validate user ID format (UUID)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(id)) {
return res.status(400).json({ success: false, error: 'Invalid user ID format' });
}

// Check if user exists first
const userDoc = await db.collection('users').doc(id).get();
if (!userDoc.exists) {
return res.status(404).json({ success: false, error: 'User not found' });
}

// Get stamp data
const stampDoc = await db.collection('stamps').doc(id).get();
if (!stampDoc.exists) {
return res.status(404).json({ success: false, error: 'Stamp card not found' });
}

// Update user's last active timestamp
await db.collection('users').doc(id).update({
lastActive: admin.firestore.FieldValue.serverTimestamp()
});

return res.status(200).json({ 
success: true, 
stamps: stampDoc.data().stamps,
user: {
nickname: userDoc.data().nickname,
lastActive: new Date().toISOString()
}
});
} catch (err) {
console.error('Error fetching stamp:', err);
return res.status(500).json({ success: false, error: 'Internal server error' });
}
}