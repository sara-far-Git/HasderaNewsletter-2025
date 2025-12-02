import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe } from '../Services/Login';

const AuthContext = createContext(null);

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
        
        console.log('🔐 Auth init - token exists:', !!token, 'user exists:', !!userStr);
        
        if (token && userStr) {
          try {
            // נסה לוודא שהטוקן עדיין תקף על ידי קריאה לשרת
            console.log('🔐 Validating token with server...');
            const freshUser = await fetchMe();
            // רק אם הקריאה הצליחה, נגדיר את המשתמש כמחובר
            console.log('✅ Token valid, user authenticated:', freshUser);
            setUser(freshUser);
            setIsAuthenticated(true);
            localStorage.setItem('hasdera_user', JSON.stringify(freshUser));
          } catch (err) {
            // אם הטוקן לא תקף, ננקה הכל
            console.warn('❌ Token validation failed:', err);
            localStorage.removeItem('hasdera_token');
            localStorage.removeItem('hasdera_user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // אם אין token או user, נוודא שהמשתמש לא מחובר
          console.log('🔓 No token found, user not authenticated');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        // במקרה של שגיאה כללית, נוודא שהמשתמש לא מחובר
        console.error('❌ Auth init error:', err);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('hasdera_token');
        localStorage.removeItem('hasdera_user');
      } finally {
        // תמיד נקבע את loading ל-false בסוף
        console.log('🔐 Auth init complete, loading set to false');
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

