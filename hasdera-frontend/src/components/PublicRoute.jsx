// src/Components/PublicRoute.jsx
// ⚠️ כל הברנץ' הזה מיועד למפרסמים בלבד
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Route שמונע גישה למשתמשים מחוברים (כמו דף התחברות)
export default function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  console.log('🔓 PublicRoute - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);

  if (loading) {
    console.log('🔓 PublicRoute - showing loading screen');
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

  // אם כבר מחובר, ניתוב לפי role
  if (isAuthenticated && user) {
    if (user.role === 'Advertiser') {
      console.log('🔓 PublicRoute - advertiser authenticated, redirecting to /');
      return <Navigate to="/" replace />;
    }
    if (user.role === 'Reader') {
      console.log('🔓 PublicRoute - reader authenticated, redirecting to /issues');
      return <Navigate to="/issues" replace />;
    }
    if (user.role === 'Admin' || user.role === 'admin') {
      console.log('🔓 PublicRoute - admin authenticated, redirecting to /admin');
      return <Navigate to="/admin" replace />;
    }
  }

  console.log('🔓 PublicRoute - showing login page');
  return children;
}

