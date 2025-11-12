import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';


function initAdmin() {
if (!admin.apps.length) {
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
}


export default async function handler(req, res) {
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });


try {
initAdmin();
const db = admin.firestore();
const { email, formId } = req.body;


const userId = uuidv4();
const stampArray = Array.from({ length: 11 }, (_, i) => ({ boothId: `booth${i+1}`, filled: false }));


await db.collection('users').doc(userId).set({ email, formId, createdAt: new Date().toISOString() });
await db.collection('stamps').doc(userId).set({ stamps: stampArray });


return res.status(200).json({ success: true, userId });
} catch (err) {
console.error(err);
return res.status(500).json({ error: 'Internal server error' });
}
}