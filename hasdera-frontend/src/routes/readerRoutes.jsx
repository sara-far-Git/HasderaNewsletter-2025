import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom";
import FlipCanvasViewer from "../components/FlipCanvasViewer";
import IssuesList from "../components/IssuesList";
import ReaderHome from "../components/ReaderHome";
import ReaderProfile from "../components/ReaderProfile";
import ReaderProtectedRoute from "../components/ReaderProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import LoginPage from "../components/LoginPage";
import { useAuth } from "../contexts/AuthContext";
import { getIssueById } from "../Services/issuesService";

// ✨ קומפוננט Wrapper לצפייה בגיליון - משתמש ב-FlipCanvasViewer (Real3D)
function IssueViewer() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [issueData, setIssueData] = useState(state || null);
  const [summary, setSummary] = useState(state?.Summary || state?.summary || null);
  const [loading, setLoading] = useState(!state);
  const [error, setError] = useState("");
  
  console.log("📖 IssueViewer - received state:", state);
  
  const handleClose = () => {
    navigate("/issues");
  };
  
  // אם אין state, ננסה להביא את הגיליון לפי הפרמטר ב-URL
  useEffect(() => {
    let isActive = true;

    if (state) {
      setIssueData(state);
      setLoading(false);
      return undefined;
    }

    if (!id) {
      setLoading(false);
      return undefined;
    }

    (async () => {
      try {
        setLoading(true);
        const fullIssue = await getIssueById(id);
        if (!isActive) return;
        setIssueData(fullIssue);
        setSummary(fullIssue.Summary || fullIssue.summary || null);
      } catch (e) {
        if (!isActive) return;
        console.error("❌ Error loading issue by id:", e);
        setError("שגיאה בטעינת הגיליון");
      } finally {
        if (isActive) setLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [state, id]);

  // טוען Summary מלא מהשרת כדי לאפשר קישורים על גבי העיתון
  useEffect(() => {
    const issueId = issueData?.issue_id || issueData?.issueId || id;
    if (!summary && issueId) {
      (async () => {
        try {
          const fullIssue = await getIssueById(issueId);
          setSummary(fullIssue.Summary || fullIssue.summary || null);
        } catch (e) {
          console.error("❌ Error loading full issue for links:", e);
        }
      })();
    }
  }, [summary, issueData, id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.1rem',
        color: '#94a3b8'
      }}>
        טוען גיליון...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.1rem',
        color: '#ef4444',
        gap: '1rem'
      }}>
        {error}
        <button
          onClick={handleClose}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          חזרה לארכיון
        </button>
      </div>
    );
  }

  if (!issueData) {
    return <Navigate to="/issues" replace />;
  }
  
  // יצירת אובייקט issue בפורמט שהקומפוננטה מצפה לו
  const issue = {
    pdf_url: issueData.pdf_url || issueData.pdfUrl || issueData.fileUrl || issueData.file_url,
    title: issueData.title,
    issue_id: issueData.issue_id || issueData.issueId || Number(id),
    issueDate: issueData.issueDate || issueData.issue_date,
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

