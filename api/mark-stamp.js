import admin from 'firebase-admin';


function initAdmin() {
if (!admin.apps.length) {
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
}


export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ success: false, error: 'Method not allowed' });
}

try {
initAdmin();
const db = admin.firestore();

const { id, booth } = req.query;
if (!id || !booth) {
return res.status(400).json({ success: false, error: 'Missing user ID or booth name' });
}

// Validate user ID format (UUID)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(id)) {
return res.status(400).json({ success: false, error: 'Invalid user ID format' });
}

// Validate booth name format
if (!/^[a-zA-Z0-9-_]+$/i.test(booth)) {
return res.status(400).json({ success: false, error: 'Invalid booth name format' });
}

// Check if user exists first
const userDoc = await db.collection('users').doc(id).get();
if (!userDoc.exists) {
return res.status(404).json({ success: false, error: 'User not found' });
}

// Get stamp data
const stampRef = db.collection('stamps').doc(id);
const stampSnap = await stampRef.get();

if (!stampSnap.exists) {
return res.status(404).json({ success: false, error: 'Stamp card not found' });
}

const stampData = stampSnap.data();

// Check if booth is valid (exists in stamps array)
const validBooth = stampData.stamps.find(s => s.boothId === booth);
if (!validBooth) {
return res.status(400).json({ success: false, error: 'Invalid booth name' });
}

// Check if already stamped
if (validBooth.filled) {
return res.status(409).json({ 
success: false, 
error: 'Booth already visited',
stamps: stampData.stamps
});
}

// Mark the stamp
const updatedStamps = stampData.stamps.map(s =>
s.boothId === booth ? { 
...s, 
filled: true, 
filledAt: new Date().toISOString(),
boothName: booth 
} : s
);

// Update both stamps and user last active
const batch = db.batch();
batch.update(stampRef, { 
stamps: updatedStamps,
lastUpdated: admin.firestore.FieldValue.serverTimestamp()
});
batch.update(db.collection('users').doc(id), {
lastActive: admin.firestore.FieldValue.serverTimestamp()
});
await batch.commit();

return res.status(200).json({ 
success: true, 
stamps: updatedStamps,
message: `Successfully stamped ${booth}!`
});
} catch (err) {
console.error('Error marking stamp:', err);
return res.status(500).json({ success: false, error: 'Internal server error' });
}
}