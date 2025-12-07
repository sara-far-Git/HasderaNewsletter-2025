import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdvertiserNav from "../components/AdvertiserNav";
import IssuesList from "../components/IssuesList";
import FlipCanvasViewer from "../components/FlipCanvasViewer";
import FlipIssue from "../components/FlipIssue";
import PlacementBook from "../components/PlacementBook";
import AnalyticsTable from "../components/AnalyticsTable";
import AdvertisersList from "../components/AdvertisersList";
import AdvertiserChat from "../components/AdvertiserChat";
import AdvertiserProfile from "../components/AdvertiserProfile";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import LoginPage from "../components/LoginPage";
import hasederaTheme from "../styles/HasederaTheme";

// 📄 עמוד תשלום זמני
const PaymentPage = () => (
  <div style={{
    padding: 40, 
    textAlign: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <h1 style={{ 
      fontSize: hasederaTheme.typography.fontSize['3xl'],
      color: hasederaTheme.colors.text.primary,
      marginBottom: '1rem'
    }}>
      עמוד תשלום
    </h1>
    <p style={{
      fontSize: hasederaTheme.typography.fontSize.lg,
      color: hasederaTheme.colors.text.secondary
    }}>
      בקרוב...
    </p>
  </div>
);

// 📊 עמוד הגדרות זמני
const SettingsPage = () => (
  <div style={{
    padding: 40, 
    textAlign: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <h1 style={{ 
      fontSize: hasederaTheme.typography.fontSize['3xl'],
      color: hasederaTheme.colors.text.primary,
      marginBottom: '1rem'
    }}>
      הגדרות
    </h1>
    <p style={{
      fontSize: hasederaTheme.typography.fontSize.lg,
      color: hasederaTheme.colors.text.secondary
    }}>
      בקרוב...
    </p>
  </div>
);

// ❓ עמוד עזרה זמני
const HelpPage = () => (
  <div style={{
    padding: 40, 
    textAlign: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <h1 style={{ 
      fontSize: hasederaTheme.typography.fontSize['3xl'],
      color: hasederaTheme.colors.text.primary,
      marginBottom: '1rem'
    }}>
      עזרה
    </h1>
    <p style={{
      fontSize: hasederaTheme.typography.fontSize.lg,
      color: hasederaTheme.colors.text.secondary
    }}>
      בקרוב...
    </p>
  </div>
);

// 💬 עמוד צ'אט תמיכה - מציג את הצ'אט בוט
function ChatSupportPage() {
  const { user } = useAuth();
  const userProfile = user?.advertiserId ? { advertiserId: user.advertiserId } : null;
  
  return (
    <div style={{
      padding: 40, 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem'
    }}>
      <h1 style={{ 
        fontSize: hasederaTheme.typography.fontSize['3xl'],
        color: hasederaTheme.colors.text.primary,
        marginBottom: '1rem'
      }}>
        צ'אט תמיכה
      </h1>
      <p style={{
        fontSize: hasederaTheme.typography.fontSize.lg,
        color: hasederaTheme.colors.text.secondary,
        marginBottom: '2rem'
      }}>
        השתמשי בצ'אט בוט בפינה השמאלית התחתונה לקבלת עזרה
      </p>
      <AdvertiserChat userProfile={userProfile} />
    </div>
  );
}

// ✨ קומפוננט Wrapper לצפייה בגיליון
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
  
  // יצירת אובייקט issue בפורמט שהקומפוננטה מצפה לו
  const issue = {
    pdf_url: state.pdf_url || state.fileUrl,
    title: state.title,
    issue_id: state.issue_id,
    issueDate: state.issueDate
  };
  
  return <FlipCanvasViewer issue={issue} onClose={handleClose} />;
}

// 🏠 קומפוננט Wrapper לדף הבית
function HomePageWrapper() {
  const { isAuthenticated, loading, user } = useAuth();
  
  console.log('🏠 HomePageWrapper - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);
  
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
    console.log('🏠 HomePageWrapper - user not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }
  
  // אם המשתמש הוא Admin, נפנה אותו לאזור הניהול
  if (user && user.role && (user.role.toLowerCase() === 'admin')) {
    console.log('🏠 HomePageWrapper - user is Admin, redirecting to /admin');
    return <Navigate to="/admin" replace />;
  }
  
  // אם המשתמש מחובר, נציג את דף הבית של המפרסם
  console.log('🏠 HomePageWrapper - user authenticated, showing advertiser dashboard');
  return <AdvertiserNav />;
}

export const advertiserRoutes = [
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
    path: "/Navbar", 
    element: (
      <ProtectedRoute>
        <Navbar />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/issues", 
    element: (
      <ProtectedRoute>
        <IssuesList />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/issues/:id", 
    element: (
      <ProtectedRoute>
        <IssueViewer />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/advertiser/placement", 
    element: (
      <ProtectedRoute>
        <PlacementBook />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/advertiser/payment", 
    element: (
      <ProtectedRoute>
        <PaymentPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/analytics", 
    element: (
      <ProtectedRoute>
        <AnalyticsTable />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/advertisers", 
    element: (
      <ProtectedRoute>
        <AdvertisersList />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/advertiser/chat", 
    element: (
      <ProtectedRoute>
        <ChatSupportPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/settings", 
    element: (
      <ProtectedRoute>
        <AdvertiserProfile />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/advertiser/profile", 
    element: (
      <ProtectedRoute>
        <AdvertiserProfile />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/help", 
    element: (
      <ProtectedRoute>
        <HelpPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/viewer", 
    element: (
      <ProtectedRoute>
        <FlipCanvasViewer />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/viewer/:id", 
    element: (
      <ProtectedRoute>
        <FlipIssue />
      </ProtectedRoute>
    ) 
  },
];

