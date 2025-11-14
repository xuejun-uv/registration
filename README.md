# E-Stamp Registration App

A React-based stamp collection application with FormSG integration and Firebase backend, optimized for Vercel deployment.

## 🚀 Vercel Deployment

### Prerequisites
- Vercel account
- Firebase project with Firestore enabled
- FormSG form setup

### Environment Variables (Required in Vercel)

Set these environment variables in your Vercel project settings:

```bash
# Firebase Client Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (Server-side - CRITICAL)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

# Application Domain
DOMAIN=https://your-app-name.vercel.app

# FormSG Integration
FORMSG_WEBHOOK_SECRET=your_webhook_secret
FORMSG_SECRET_KEY=your_formsg_encryption_key
```

### Deploy to Vercel

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel dashboard → Your Project → Settings → Environment Variables
   - Add all variables from the list above

3. **Set FormSG Webhook URL**
   - In FormSG form settings, set webhook to: `https://your-app.vercel.app/api/formsg-webhook`

### API Endpoints

- `POST /api/formsg-webhook` - FormSG webhook handler
- `GET /api/get-stamp?id={userId}` - Get user stamps
- `POST /api/mark-stamp?id={userId}&booth={boothId}` - Mark stamp
- `POST /api/save-form` - Save form data
- `GET /api/formsg-redirect` - Handle FormSG redirects

### Features

- **Stamp Collection**: 11 booth stamps (s1.png - s11.png/jpg)
- **QR Code Scanning**: Mobile-optimized scanner
- **FormSG Integration**: Automatic user creation
- **Firebase Backend**: User and stamp data storage
- **Mobile Responsive**: Optimized for mobile devices

### Project Structure

```
/
├── api/                    # Vercel serverless functions
│   ├── formsg-webhook.js  # Main FormSG integration
│   ├── get-stamp.js       # Get user stamps
│   ├── mark-stamp.js      # Mark booth stamp
│   └── save-form.js       # Save form data
├── public/                 # Static assets
│   ├── s1.png - s11.png   # Stamp images
│   └── index.html
├── src/                   # React application
│   ├── components/
│   ├── pages/
│   └── firebase.js
├── vercel.json            # Vercel configuration
└── package.json
```

### Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Generate QR codes (optional)
npm run generate-qr
```

### Deployment Checklist

- [ ] Firebase project setup with Firestore
- [ ] Environment variables configured in Vercel
- [ ] FormSG webhook URL updated
- [ ] Stamp images (s1-s11) uploaded to `/public`
- [ ] Firebase Admin SDK service account JSON in environment
- [ ] Domain configured in environment variables

### Troubleshooting

1. **API Errors**: Check Firebase service account JSON format
2. **Missing Images**: Ensure s1-s11 images are in `/public`
3. **FormSG Issues**: Verify webhook URL and secrets
4. **Firebase Issues**: Check Firestore rules and indexes