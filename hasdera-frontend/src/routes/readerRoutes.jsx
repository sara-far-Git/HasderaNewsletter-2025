import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import styled from "styled-components";
import { ArrowRight } from "lucide-react";
import FlipbookViewer from "../components/FlipbookViewer";
import IssuesList from "../components/IssuesList";
import ReaderHome from "../components/ReaderHome";
import ReaderProfile from "../components/ReaderProfile";
import ReaderProtectedRoute from "../components/ReaderProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import LoginPage from "../components/LoginPage";
import { useAuth } from "../contexts/AuthContext";

/* ============ Styled Components for IssueViewer ============ */
const ViewerWrapper = styled.div`
  position: fixed;
  inset: 0;
  background: #0f172a;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const ViewerHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  color: #f8fafc;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.1);
  border: none;
  color: #f8fafc;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  transition: background 0.2s;

  &:hover {
    background: rgba(255,255,255,0.15);
  }
`;

const IssueTitle = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #f8fafc;
`;

const ViewerContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

// ✨ קומפוננט Wrapper לצפייה בגיליון - משתמש ב-FlipbookViewer (client-side בלבד)
function IssueViewer() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  console.log("📖 IssueViewer - received state:", state);
  
  const handleClose = () => {
    navigate("/issues");
  };
  
  // אם אין state, נחזיר למסך הגליונות
  if (!state) {
    handleClose();
    return null;
  }

  const pdfUrl = state.pdf_url || state.pdfUrl || state.fileUrl || state.file_url;
  const title = state.title || "גיליון";
  
  if (!pdfUrl) {
    return (
      <ViewerWrapper>
        <ViewerHeader>
          <BackButton onClick={handleClose}>
            <ArrowRight size={18} />
            חזרה לארכיון
          </BackButton>
        </ViewerHeader>
        <ViewerContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          לא נמצא קובץ PDF לגיליון זה
        </ViewerContent>
      </ViewerWrapper>
    );
  }
  
  return (
    <ViewerWrapper>
      <ViewerHeader>
        <BackButton onClick={handleClose}>
          <ArrowRight size={18} />
          חזרה לארכיון
        </BackButton>
        <IssueTitle>{title}</IssueTitle>
        <div style={{ width: 100 }} /> {/* spacer for centering */}
      </ViewerHeader>
      <ViewerContent>
        <FlipbookViewer fileUrl={pdfUrl} />
      </ViewerContent>
    </ViewerWrapper>
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
        <IssueViewer />
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
];

