// Debug endpoint to see exactly what FormSG sends
export default async function handler(req, res) {
  console.log('=== FormSG Debug Webhook Called ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));
  
  // Log specific webhook fields if they exist
  if (req.body) {
    console.log('=== Specific Fields ===');
    console.log('formId:', req.body.formId);
    console.log('submissionId:', req.body.submissionId);
    console.log('created:', req.body.created);
    console.log('encryptedContent:', req.body.encryptedContent ? 'EXISTS' : 'NOT_FOUND');
    console.log('responses:', req.body.responses ? 'EXISTS' : 'NOT_FOUND');
    console.log('data:', req.body.data ? 'EXISTS' : 'NOT_FOUND');
  }
  
  return res.status(200).json({
    success: true,
    message: 'Debug webhook received - check logs',
    timestamp: new Date().toISOString(),
    receivedData: req.body
  });
}