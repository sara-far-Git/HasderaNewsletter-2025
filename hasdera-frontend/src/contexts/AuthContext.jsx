import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe } from '../Services/Login';

const AuthContext = createContext(null);

function isAuthFailure(err) {
  const status = err?.response?.status;
  return status === 401 || status === 403;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    localStorage.removeItem('hasdera_token');
    localStorage.removeItem('hasdera_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (token, userData) => {
    localStorage.setItem('hasdera_token', token);
    localStorage.setItem('hasdera_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // בדיקה ראשונית אם יש משתמש מחובר
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('hasdera_token');
        const userStr = localStorage.getItem('hasdera_user');

        if (import.meta.env.DEV) {
          console.log('🔐 Auth init - token exists:', !!token, 'user exists:', !!userStr);
        }

        if (token && userStr) {
          // Optimistic session restore (do not block UI on network)
          try {
            const cachedUser = JSON.parse(userStr);
            setUser(cachedUser);
            setIsAuthenticated(true);
          } catch {
            // ignore parse issues; we’ll validate against server anyway
          }

          try {
            // נסה לוודא שהטוקן עדיין תקף על ידי קריאה לשרת
            if (import.meta.env.DEV) console.log('🔐 Validating token with server...');
            const freshUser = await fetchMe();
            // רק אם הקריאה הצליחה, נגדיר את המשתמש כמחובר
            if (import.meta.env.DEV) console.log('✅ Token valid, user authenticated:', freshUser);
            setUser(freshUser);
            setIsAuthenticated(true);
            localStorage.setItem('hasdera_user', JSON.stringify(freshUser));
          } catch (err) {
            // Only clear session if token is truly invalid/unauthorized.
            if (isAuthFailure(err)) {
              if (import.meta.env.DEV) console.warn('❌ Token invalid (401/403), logging out:', err);
              localStorage.removeItem('hasdera_token');
              localStorage.removeItem('hasdera_user');
              setUser(null);
              setIsAuthenticated(false);
            } else {
              // Network / server issues: keep the cached session and allow UI to load.
              if (import.meta.env.DEV) console.warn('⚠️ Token validation skipped due to network/server error:', err);
            }
          }
        } else {
          // אם אין token או user, נוודא שהמשתמש לא מחובר
          if (import.meta.env.DEV) console.log('🔓 No token found, user not authenticated');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        // במקרה של שגיאה כללית, נוודא שהמשתמש לא מחובר
        if (import.meta.env.DEV) console.error('❌ Auth init error:', err);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('hasdera_token');
        localStorage.removeItem('hasdera_user');
      } finally {
        // תמיד נקבע את loading ל-false בסוף
        if (import.meta.env.DEV) console.log('🔐 Auth init complete, loading set to false');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

