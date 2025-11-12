import admin from 'firebase-admin';


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


const { id, booth } = req.query;
if (!id || !booth) {
return res.status(400).json({ error: 'Missing id or booth' });
}


const stampRef = db.collection('stamps').doc(id);
const stampSnap = await stampRef.get();


if (!stampSnap.exists) {
return res.status(404).json({ error: 'Stamp card not found' });
}


const stampData = stampSnap.data();
const updatedStamps = stampData.stamps.map(s =>
s.boothId === booth ? { ...s, filled: true, filledAt: new Date().toISOString() } : s
);


await stampRef.update({ stamps: updatedStamps });


return res.status(200).json({ success: true, stamps: updatedStamps });
} catch (err) {
console.error('Error marking stamp:', err);
return res.status(500).json({ error: 'Internal server error' });
}
}