# Portfolio with AI Assistant

A modern, responsive portfolio website featuring a dynamic project showcase and an AI-powered chatbot that can answer questions about your experience and projects.

## Tech Stack

### Frontend
-   **React** (built with Vite)
-   **Tailwind CSS** (v4) for styling
-   **Framer Motion** for animations
-   **React Router** for navigation
-   **Lucide React** for icons

### Backend (Serverless)
-   **Firebase Firestore**: NoSQL database for storing projects and user profile data.
-   **Firebase Storage**: For storing project screenshots and APK files.
-   **Firebase Authentication**: For securely logging in the Admin.
-   **Firebase Cloud Functions (Node.js)**: A secure backend proxy that handles:
    -   Secure communication with Google Gemini API.
    -   Protecting your API Key from public exposure.

## Features
-   **AI Chatbot**: Context-aware assistant that knows your projects and resume.
-   **Admin Dashboard**:
    -   Upload/Manage Projects.
    -   **AI Configuration**: Set your Resume/Bio and API Key securely.
-   **Dynamic Theme**: Light/Dark mode with "Google-style" aesthetics.
-   **Responsive Design**: Works perfectly on mobile and desktop.

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    cd functions && npm install && cd ..
    ```

2.  **Run Locally**
    ```bash
    npm run dev
    ```

3.  **Deploy Backend (Required for Chatbot)**
    Cloud functions must be deployed to work (even for local frontend).
    ```bash
    firebase deploy --only functions,firestore:rules
    ```

4.  **Configure AI**
    -   Go to `/admin` -> "AI Configuration".
    -   Paste your Gemini API Key.
    -   Paste your Resume Text.
    -   Save.
