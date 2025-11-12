// Test endpoint to debug FormSG webhook data
export default async function handler(req, res) {
  // Allow all methods for testing
  const method = req.method;
  
  console.log('=== FormSG Test Webhook Called ===');
  console.log('Method:', method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  
  // Log the raw data types
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));
  
  // Return detailed response for testing
  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    method: method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    message: 'FormSG test webhook received successfully'
  });
}