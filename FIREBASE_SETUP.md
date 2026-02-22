# Firebase Setup Guide

To make the upload feature work, you need to connect this app to a free Firebase project.

## Step 1: Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com/).
2. Click **Add project** and follow the steps (name it "Portfolio" or similar).
3. Disable Google Analytics if asked (simplifies things).

## Step 2: Enable Services
In your new project console:

### Firestore Database
1. Click **Prooduct categories** -> **Build** -> **Firestore Database**.
2. Click **Create database**.
3. Choose a location (default is fine).
4. **IMPORTANT**: Choose **Start in Test mode** (allows read/write for 30 days). We can secure it later.

### Storage
1. Click **Build** -> **Storage**.
2. Click **Get started**.
3. **IMPORTANT**: Choose **Start in Test mode**.
4. Click **Done**.

## Step 3: Get API Keys
1. Click the **Gear icon** (Project Settings) next to Project Overview.
2. Scroll down to **Your apps**.
3. Click the **</> (Web)** icon.
4. Register app (nickname "Portfolio Website").
5. You will see a `firebaseConfig` object.


## Action Required
Copy the `firebaseConfig` object (everything inside `const firebaseConfig = { ... }`) and paste it into `src/lib/firebase.js`.

It should look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "portfolio-....firebaseapp.com",
  projectId: "portfolio-...",
  storageBucket: "portfolio-....appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```
