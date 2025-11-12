# FormSG Integration Guide

## 🔗 How to Set Up FormSG Webhook

### **1. Configure FormSG Webhook URL**

In your FormSG form settings, set the webhook URL to:
```
https://registration-smoky-chi.vercel.app/api/formsg-webhook
```

For testing, you can also use:
```
https://registration-smoky-chi.vercel.app/api/formsg-test
```

### **2. FormSG Webhook Data Format**

FormSG can send data in different formats depending on your configuration:

#### **Format 1: Encrypted Submission**
```json
{
  "formId": "60c0b2b1e8b4a2001a1b2c3d",
  "submissionId": "60c0b2b1e8b4a2001a1b2c3e", 
  "timestamp": "2023-11-12T10:30:00.000Z",
  "data": "iv:encryptedData"
}
```

#### **Format 2: Direct Responses**
```json
{
  "formId": "60c0b2b1e8b4a2001a1b2c3d",
  "submissionId": "60c0b2b1e8b4a2001a1b2c3e",
  "timestamp": "2023-11-12T10:30:00.000Z",
  "responses": [
    {
      "question": "What is your email address?",
      "answer": "user@example.com"
    },
    {
      "question": "What is your name?", 
      "answer": "John Doe"
    }
  ]
}
```

#### **Format 3: Legacy Format**
```json
[
  {
    "question": "Email",
    "answer": "user@example.com"
  },
  {
    "question": "Name",
    "answer": "John Doe" 
  }
]
```

### **3. Environment Variables**

Add these to your Vercel environment variables:

```env
# Optional: FormSG webhook signature verification
FORMSG_WEBHOOK_SECRET=your_webhook_secret_from_formsg

# Optional: FormSG encryption key (if using encrypted submissions)
FORMSG_SECRET_KEY=your_secret_key_from_formsg
```

### **4. How the Webhook Works**

1. **User submits FormSG form** → FormSG processes submission
2. **FormSG sends webhook** → Your `/api/formsg-webhook` endpoint
3. **Webhook processes data** → Extracts email, name, and other fields
4. **Creates user in Firebase** → Generates unique user ID
5. **Creates stamp card** → Empty stamp card with 11 booths
6. **Returns success response** → With user ID and redirect URL

### **5. Testing Your Webhook**

#### **Test Endpoint:**
Use `/api/formsg-test` to see exactly what data FormSG is sending:
```bash
curl -X POST https://registration-smoky-chi.vercel.app/api/formsg-test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### **Manual Test:**
```bash
curl -X POST https://registration-smoky-chi.vercel.app/api/formsg-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "formId": "test123",
    "submissionId": "sub456", 
    "responses": [
      {"question": "Email", "answer": "test@example.com"},
      {"question": "Name", "answer": "Test User"}
    ]
  }'
```

### **6. FormSG Form Configuration**

In your FormSG form (https://form.gov.sg/6911b9ea7b7a150c5e112447):

1. **Add Webhook Settings**:
   - Webhook URL: `https://registration-smoky-chi.vercel.app/api/formsg-webhook`
   - Method: POST
   - Content-Type: application/json

2. **Required Form Fields**:
   - Email field (required for user identification)
   - Name field (recommended)
   - Any additional fields you need

3. **Optional Security**:
   - Enable webhook signature verification
   - Enable form encryption for sensitive data

### **7. Data Flow After Webhook**

```
FormSG Form → Webhook → Firebase → User gets redirected to:
https://registration-smoky-chi.vercel.app/stamps?id={userId}
```

### **8. Debugging**

Check your Vercel function logs:
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on `formsg-webhook` function
3. View real-time logs to see webhook data

### **9. Common Issues**

- **No email extracted**: Check that your form has an email field
- **Webhook not firing**: Verify the webhook URL in FormSG settings
- **Decryption errors**: Make sure FORMSG_SECRET_KEY is correct
- **Signature validation fails**: Check FORMSG_WEBHOOK_SECRET

### **10. Response Format**

Successful webhook response:
```json
{
  "success": true,
  "userId": "uuid-generated-id",
  "email": "user@example.com",
  "name": "User Name",
  "redirectUrl": "https://registration-smoky-chi.vercel.app/stamps?id=uuid",
  "message": "Registration completed successfully",
  "timestamp": "2023-11-12T10:30:00.000Z"
}
```