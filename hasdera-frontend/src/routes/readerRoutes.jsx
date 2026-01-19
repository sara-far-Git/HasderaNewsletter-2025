import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import FlipCanvasViewer from "../components/FlipCanvasViewer";
import FlipIssue from "../components/FlipIssue";
import IssuesList from "../components/IssuesList";
import ReaderProtectedRoute from "../components/ReaderProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import LoginPage from "../components/LoginPage";
import { useAuth } from "../contexts/AuthContext";
import { getIssueById } from "../Services/issuesService";

// ✨ קומפוננט Wrapper לצפייה בגיליון
function IssueViewer() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(state?.Summary || state?.summary || null);
  
  console.log("📖 IssueViewer - received state:", state);
  
  const handleClose = () => {
    navigate("/issues");
  };
  
  // אם אין state, נחזיר למסך הגליונות
  if (!state) {
    handleClose();
    return null;
  }

  // טוען Summary מלא מהשרת כדי לאפשר קישורים על גבי העיתון
  useEffect(() => {
    if (!summary && state.issue_id) {
      (async () => {
        try {
          const fullIssue = await getIssueById(state.issue_id);
          setSummary(fullIssue.Summary || fullIssue.summary || null);
        } catch (e) {
          console.error("❌ Error loading full issue for links:", e);
        }
      })();
    }
  }, [summary, state?.issue_id]);
  
  // יצירת אובייקט issue בפורמט שהקומפוננטה מצפה לו
  const issue = {
    pdf_url: state.pdf_url || state.fileUrl,
    title: state.title,
    issue_id: state.issue_id,
    issueDate: state.issueDate,
    Summary: summary
  };
  
  return <FlipCanvasViewer issue={issue} onClose={handleClose} />;
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
  if (user && user.role && (user.role.toLowerCase() === 'admin')) {
    console.log('🏠 HomePageWrapper (reader) - user is Admin, redirecting to /admin');
    return <Navigate to="/admin" replace />;
  }
  
  // אם המשתמש הוא Advertiser, נפנה אותו לדשבורד של המפרסם
  if (user && user.role && (user.role.toLowerCase() === 'advertiser' || user.role === 'מפרסם')) {
    console.log('🏠 HomePageWrapper (reader) - user is Advertiser, redirecting to /');
    return <Navigate to="/" replace />;
  }
  
  // אם המשתמש מחובר, נציג את דף הגליונות
  console.log('🏠 HomePageWrapper (reader) - user authenticated, showing issues list');
  return <IssuesList />;
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
        <IssuesList />
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
    element: (
      <ReaderProtectedRoute>
        <FlipCanvasViewer />
      </ReaderProtectedRoute>
    ) 
  },
  { 
    path: "/viewer/:id", 
    element: (
      <ReaderProtectedRoute>
        <FlipIssue />
      </ReaderProtectedRoute>
    ) 
  },
];

