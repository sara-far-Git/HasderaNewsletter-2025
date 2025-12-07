// src/Components/ProtectedRoute.jsx
// ⚠️ כל הברנץ' הזה מיועד למפרסמים בלבד
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
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

  // מפרסמים ומנהלים יכולים לגשת
  if (user.role !== 'Advertiser' && user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
