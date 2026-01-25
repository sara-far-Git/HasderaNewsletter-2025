import React from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import IssuesList from "../components/IssuesList";
import ReaderHome from "../components/ReaderHome";
import ReaderProfile from "../components/ReaderProfile";
import SectionPage from "../components/SectionPage";
import ReaderProtectedRoute from "../components/ReaderProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import LoginPage from "../components/LoginPage";
import { useAuth } from "../contexts/AuthContext";
import AdminFlipbookViewer from "../components/AdminFlipbookViewer";
import ShederaStreet from "../components/ShederaStreet";

// ✨ קומפוננט Wrapper לצפייה בגיליון (לוגיקה מהאדמין, read-only)
function ReaderFlipbookViewerWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/issues");
  };

  if (!id) {
    return <Navigate to="/issues" replace />;
  }

  return (
    <AdminFlipbookViewer
      issueId={Number(id)}
      onClose={handleClose}
      readOnly={true}
    />
  );
}


// 🏠 קומפוננט Wrapper לדף הבית - מעביר לדף התחברות אם לא מחובר
function HomePageWrapper() {
  const { isAuthenticated, loading, user } = useAuth();
  
  console.log('🏠 HomePageWrapper (reader) - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);
  
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
  
  // אם המשתמש לא מחובר, נעביר אותו לדף ההתחברות
  if (!isAuthenticated) {
    console.log('🏠 HomePageWrapper (reader) - user not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }
  
  // אם המשתמש הוא Admin, נפנה אותו לאזור הניהול
  const role = (user?.role || '').toLowerCase();
  if (role === 'admin') {
    console.log('🏠 HomePageWrapper (reader) - user is Admin, redirecting to /admin');
    return <Navigate to="/admin" replace />;
  }
  
  // כל שאר המשתמשים (reader/advertiser) רואים את דף הבית של הקוראים
  console.log('🏠 HomePageWrapper (reader) - user authenticated, showing reader home');
  return <ReaderHome />;
}

export const readerRoutes = [
  { 
    path: "/login", 
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ) 
  },
  { 
    path: "/", 
    element: <HomePageWrapper /> 
  },
  { 
    path: "/issues", 
    element: (
      <ReaderProtectedRoute>
        <IssuesList showAdvertiserActions={false} showReaderNav={true} />
      </ReaderProtectedRoute>
    ) 
  },
  { 
    path: "/archive", 
    element: (
      <ReaderProtectedRoute>
        <IssuesList showAdvertiserActions={false} showReaderNav={true} />
      </ReaderProtectedRoute>
    ) 
  },
  { 
    path: "/issues/:id", 
    element: (
      <ReaderProtectedRoute>
        <ReaderFlipbookViewerWrapper />
      </ReaderProtectedRoute>
    ) 
  },
  { 
    path: "/viewer", 
    element: <Navigate to="/issues" replace />
  },
  { 
    path: "/viewer/:id", 
    element: <Navigate to="/issues" replace />
  },
  { 
    path: "/me", 
    element: (
      <ReaderProtectedRoute>
        <ReaderProfile />
      </ReaderProtectedRoute>
    ) 
  },
  { 
    path: "/street", 
    element: (
      <ReaderProtectedRoute>
        <ShederaStreet />
      </ReaderProtectedRoute>
    ) 
  },
  { 
    path: "/sections/:sectionId", 
    element: (
      <ReaderProtectedRoute>
        <SectionPage />
      </ReaderProtectedRoute>
    ) 
  },
];

