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
if (!id) return res.status(400).json({ error: 'Missing id' });


const doc = await db.collection('stamps').doc(id).get();
if (!doc.exists) return res.status(404).json({ error: 'Stamp card not found' });


return res.status(200).json({ success: true, stamps: doc.data().stamps });
} catch (err) {
console.error('Error fetching stamp:', err);
return res.status(500).json({ error: 'Internal server error' });
}
}