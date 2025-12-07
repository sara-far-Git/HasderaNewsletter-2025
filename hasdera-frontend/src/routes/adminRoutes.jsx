import { useParams, useNavigate } from "react-router-dom";
import AdminDashboard from "../Components/AdminDashboard";
import UsersManagement from "../Components/UsersManagement";
import ContentManagement from "../Components/ContentManagement";
import AdvertisersManagement from "../Components/AdvertisersManagement";
import PaymentsManagement from "../Components/PaymentsManagement";
import IssuesManagement from "../Components/IssuesManagement";
import AdminFlipbookViewer from "../Components/AdminFlipbookViewer";
import AdSlotsManagement from "../Components/AdSlotsManagement";
import AnalyticsManagement from "../Components/AnalyticsManagement";
import InfrastructureManagement from "../Components/InfrastructureManagement";
import IntegrationsManagement from "../Components/IntegrationsManagement";
import AdminProtectedRoute from "../Components/AdminProtectedRoute";
import PublicRoute from "../Components/PublicRoute";
import LoginPage from "../Components/LoginPage";

// 🎯 קומפוננט Wrapper לעיתון באזור הניהול
function AdminFlipbookViewerWrapper() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  
  console.log('🔍 AdminFlipbookViewerWrapper - issueId from params:', issueId);
  
  const handleClose = () => {
    navigate("/admin/issues");
  };
  
  if (!issueId || issueId === 'undefined') {
    console.error('❌ AdminFlipbookViewerWrapper: Invalid issueId!', issueId);
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>שגיאה: לא נמצא מזהה גיליון</h2>
        <button onClick={handleClose}>חזרה לניהול גליונות</button>
      </div>
    );
  }
  
  const parsedIssueId = parseInt(issueId);
  if (isNaN(parsedIssueId)) {
    console.error('❌ AdminFlipbookViewerWrapper: issueId is not a number!', issueId);
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>שגיאה: מזהה גיליון לא תקין</h2>
        <button onClick={handleClose}>חזרה לניהול גליונות</button>
      </div>
    );
  }
  
  return <AdminFlipbookViewer issueId={parsedIssueId} onClose={handleClose} />;
}

export const adminRoutes = [
  { 
    path: "/login", 
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ) 
  },
  { 
    path: "/admin", 
    element: (
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/users", 
    element: (
      <AdminProtectedRoute>
        <UsersManagement />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/content", 
    element: (
      <AdminProtectedRoute>
        <ContentManagement />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/advertisers", 
    element: (
      <AdminProtectedRoute>
        <AdvertisersManagement />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/payments", 
    element: (
      <AdminProtectedRoute>
        <PaymentsManagement />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/issues", 
    element: (
      <AdminProtectedRoute>
        <IssuesManagement />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/flipbook/:issueId", 
    element: (
      <AdminProtectedRoute>
        <AdminFlipbookViewerWrapper />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/ad-slots", 
    element: (
      <AdminProtectedRoute>
        <AdSlotsManagement />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/analytics", 
    element: (
      <AdminProtectedRoute>
        <AnalyticsManagement />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/infrastructure", 
    element: (
      <AdminProtectedRoute>
        <InfrastructureManagement />
      </AdminProtectedRoute>
    ) 
  },
  { 
    path: "/admin/integrations", 
    element: (
      <AdminProtectedRoute>
        <IntegrationsManagement />
      </AdminProtectedRoute>
    ) 
  },
];

