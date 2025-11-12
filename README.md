# E-Stamp Registration App

A mobile-responsive React app for event registration and digital stamp collection, deployed on Vercel.

## 🚀 Features

- **Mobile-responsive design** optimized for smartphones
- **FormSG integration** for registration form collection
- **Firebase integration** for data storage
- **QR code scanning** for stamp collection
- **Digital stamp card** with 11 booths (Discovery Atrium: 4, Envision Gallery: 3, Experience Zone: 4)

## 📱 How It Works

1. **Registration**: Users complete a FormSG form
2. **Webhook Processing**: FormSG sends data to `/api/formsg-webhook`
3. **User Creation**: System generates unique user ID and empty stamp card
4. **Stamp Collection**: Users scan QR codes at booths to collect stamps
5. **Real-time Updates**: Stamp card updates automatically

## 🛠 Setup

### Environment Variables

Create `.env` file:
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyDiPpHzA_EB2HctYykz3bJLS40-lkuhJdg
REACT_APP_FIREBASE_AUTH_DOMAIN=add-a-web-app-fcd6c.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=add-a-web-app-fcd6c
REACT_APP_FIREBASE_STORAGE_BUCKET=add-a-web-app-fcd6c.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1038860701851
REACT_APP_FIREBASE_APP_ID=1:1038860701851:web:f8c1b71789aee83d58f63e
REACT_APP_FIREBASE_MEASUREMENT_ID=G-4CSGKYLW3H
DOMAIN=https://registration-smoky-chi.vercel.app
```

Create `.env.local` file with Firebase service account:
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"add-a-web-app-fcd6c",...}
```

### FormSG Configuration

Configure FormSG webhook URL:
```
https://registration-smoky-chi.vercel.app/api/formsg-webhook
```

### Generate QR Codes

```bash
npm run generate-qr
```

This creates QR code images for all 11 booths.

## 🏗 API Endpoints

- `POST /api/formsg-webhook` - Receives FormSG form submissions
- `GET /api/get-stamp?id={userId}` - Gets user's stamp card
- `POST /api/mark-stamp?id={userId}&booth={boothId}` - Marks a stamp as collected
- `POST /api/save-form` - Alternative form submission endpoint

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   └── StampGrid.js       # Stamp display component
│   ├── pages/
│   │   ├── HomePage.js        # Landing page with form link
│   │   └── StampPage.js       # Stamp collection page
│   ├── App.js                 # Main app router
│   ├── App.css                # Mobile-responsive styles
│   └── firebase.js            # Firebase configuration
├── api/
│   ├── formsg-webhook.js      # FormSG webhook handler
│   ├── get-stamp.js           # Retrieve stamp data
│   ├── mark-stamp.js          # Update stamp status
│   └── save-form.js           # Manual form submission
├── scripts/
│   └── make-qr.js             # QR code generator
└── public/
    └── manifest.json          # PWA configuration
```

## 🚀 Deployment

Deployed on Vercel at:
- Primary: https://registration-smoky-chi.vercel.app
- Git branch: https://registration-git-main-xuejuns-projects.vercel.app

## 📋 Booth Layout

**Discovery Atrium (4 booths)**: booth1, booth2, booth3, booth4
**Envision Gallery (3 booths)**: booth5, booth6, booth7
**Experience Zone (4 booths)**: booth8, booth9, booth10, booth11

## 🔧 Development

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
