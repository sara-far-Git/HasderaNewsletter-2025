import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";

import './index.css'
import App from './App.jsx'

// קבלת Google Client ID מ-environment variable או fallback ל-hardcoded
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
  "953905721700-7f0m0fa230frft4l4ff0hkj20e5q04j5.apps.googleusercontent.com";

console.log('🔐 Google Client ID:', googleClientId ? 'Configured' : 'Not configured');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
