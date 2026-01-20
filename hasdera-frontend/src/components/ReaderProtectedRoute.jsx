// src/Components/ReaderProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ReaderProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  console.log('🛡️ ReaderProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated);

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

  // אם לא מחובר - לדף ההתחברות
  if (!isAuthenticated || !user) {
    console.log('🛡️ ReaderProtectedRoute - not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // אם Admin - לאזור הניהול
  const role = (user.role || '').toLowerCase();
  if (role === 'admin') {
    console.log('🛡️ ReaderProtectedRoute - admin detected, redirecting to /admin');
    return <Navigate to="/admin" replace />;
  }

  // כל שאר המשתמשים (reader/advertiser) יכולים לצפות בתכנים
  console.log('🛡️ ReaderProtectedRoute - user authorized, showing content');
  return children;
}

