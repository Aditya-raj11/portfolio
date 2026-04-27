import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HelmetProvider>
  </React.StrictMode>,
)

