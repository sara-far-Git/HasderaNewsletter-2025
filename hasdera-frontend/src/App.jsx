import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import hasederaTheme, { GlobalStyles } from "./styles/HasederaTheme";
import AnalyticsTable from "./Components/AnalyticsTable";
import AdvertisersList from "./Components/AdvertisersList";
import IssuesList from "./Components/IssuesList";
import AdvertiserNav from "./Components/AdvertiserNav"; 
import PlacementBook from "./Components/PlacementBook";
import FlipCanvasViewer from "./Components/FlipCanvasViewer";
import FlipIssue from "./Components/FlipIssue";
import LoginPage from "./Components/LoginPage";
import Navbar from "./Components/Navbar";
import AdvertiserChat from "./Components/AdvertiserChat";
import AdvertiserProfile from "./Components/AdvertiserProfile";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminProtectedRoute from "./Components/AdminProtectedRoute";
import PublicRoute from "./Components/PublicRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// 🛠️ אזור ניהול - Components
import AdminDashboard from "./Components/AdminDashboard";
import UsersManagement from "./Components/UsersManagement";
import ContentManagement from "./Components/ContentManagement";
import AdvertisersManagement from "./Components/AdvertisersManagement";
import PaymentsManagement from "./Components/PaymentsManagement";
import IssuesManagement from "./Components/IssuesManagement";
import AdSlotsManagement from "./Components/AdSlotsManagement";
import AnalyticsManagement from "./Components/AnalyticsManagement";
import InfrastructureManagement from "./Components/InfrastructureManagement";
import IntegrationsManagement from "./Components/IntegrationsManagement";

// 🎨 הגדרת סטיילים גלובליים
const GlobalStyleComponent = createGlobalStyle`
  ${GlobalStyles}
`;

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
      <ChatSupportContent />
    </div>
  );
}

// קומפוננט פנימי שיכול להשתמש ב-useAuth
function ChatSupportContent() {
  const { user } = useAuth();
  const userProfile = user?.advertiserId ? { advertiserId: user.advertiserId } : null;
  
  return <AdvertiserChat userProfile={userProfile} />;
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

// 🏠 קומפוננט Wrapper לדף הבית - מעביר לדף התחברות אם לא מחובר
function HomePageWrapper() {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('🏠 HomePageWrapper - loading:', loading, 'isAuthenticated:', isAuthenticated);
  
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
  
  // אם המשתמש מחובר, נציג את דף הבית
  console.log('🏠 HomePageWrapper - user authenticated, showing home page');
  return <AdvertiserNav />;
}

// 🎯 App - קומפוננט ראשי
function App() {
  return (
    <>
      {/* 🎨 סטיילים גלובליים */}
      <GlobalStyleComponent />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 🔒 דף התחברות - רק למשתמשים לא מחוברים */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            
            {/* 🏠 דף הבית - Landing Page (מוגן - מעביר לדף התחברות אם לא מחובר) */}
            <Route path="/" element={<HomePageWrapper />} />
            
            {/* ✨ דשבורד - אזור מפרסמים (מוגן - מפרסמים בלבד) */}
            <Route 
              path="/Navbar" 
              element={
                <ProtectedRoute>
                  <Navbar />
                </ProtectedRoute>
              } 
            />
            
            {/* 📖 גליונות (מוגן - מפרסמים בלבד) */}
            <Route 
              path="/issues" 
              element={
                <ProtectedRoute>
                  <IssuesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/issues/:id" 
              element={
                <ProtectedRoute>
                  <IssueViewer />
                </ProtectedRoute>
              } 
            />
            
            {/* 🎨 מפרסם - ניהול (מוגן - מפרסמים בלבד) */}
            <Route 
              path="/advertiser/placement" 
              element={
                <ProtectedRoute>
                  <PlacementBook />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/advertiser/payment" 
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 📊 אנליטיקה (מוגן - מפרסמים בלבד) */}
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsTable />
                </ProtectedRoute>
              } 
            />
            
            {/* 👥 מפרסמים (מוגן - מפרסמים בלבד) */}
            <Route 
              path="/advertisers" 
              element={
                <ProtectedRoute>
                  <AdvertisersList />
                </ProtectedRoute>
              } 
            />
            
            {/* 💬 צ'אט תמיכה (מוגן - מפרסמים בלבד) */}
            <Route 
              path="/advertiser/chat" 
              element={
                <ProtectedRoute>
                  <ChatSupportPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 👤 אזור אישי (מוגן - מפרסמים בלבד) */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AdvertiserProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/advertiser/profile" 
              element={
                <ProtectedRoute>
                  <AdvertiserProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* ❓ עזרה (מוגן - מפרסמים בלבד) */}
            <Route 
              path="/help" 
              element={
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 📱 Viewers (מוגן - מפרסמים בלבד) */}
            <Route 
              path="/viewer" 
              element={
                <ProtectedRoute>
                  <FlipCanvasViewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/viewer/:id" 
              element={
                <ProtectedRoute>
                  <FlipIssue />
                </ProtectedRoute>
              } 
            />
            
            {/* 🛠️ אזור ניהול (מוגן - מנהלים בלבד) */}
            <Route 
              path="/admin" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminProtectedRoute>
                  <UsersManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/content" 
              element={
                <AdminProtectedRoute>
                  <ContentManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/advertisers" 
              element={
                <AdminProtectedRoute>
                  <AdvertisersManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/payments" 
              element={
                <AdminProtectedRoute>
                  <PaymentsManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/issues" 
              element={
                <AdminProtectedRoute>
                  <IssuesManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ad-slots" 
              element={
                <AdminProtectedRoute>
                  <AdSlotsManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <AdminProtectedRoute>
                  <AnalyticsManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/infrastructure" 
              element={
                <AdminProtectedRoute>
                  <InfrastructureManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/integrations" 
              element={
                <AdminProtectedRoute>
                  <IntegrationsManagement />
                </AdminProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;