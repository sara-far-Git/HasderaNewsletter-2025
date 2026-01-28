import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";

import './index.css'
import App from './App.jsx'

// קבלת Google Client ID מ-environment variable
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID is not configured. Google login will not work.');
}

console.log('🔐 Google Client ID:', googleClientId ? 'Configured' : 'Not configured');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
