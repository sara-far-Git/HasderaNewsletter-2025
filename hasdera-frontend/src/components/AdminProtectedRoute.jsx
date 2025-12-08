// src/Components/AdminProtectedRoute.jsx
// ⚠️ מיועד למנהלים בלבד
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        טוען...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // רק מנהלים יכולים לגשת לאזור הניהול
  // רק משתמשים עם תפקיד Admin יכולים להיכנס
  if (user.role !== 'Admin' && user.role !== 'admin') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#ef4444' }}>אין הרשאה</h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          גישה לאזור הניהול מוגבלת למנהלים בלבד
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          חזרה לדף הבית
        </button>
      </div>
    );
  }

  return children;
}

