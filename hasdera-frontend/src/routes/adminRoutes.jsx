import { useParams, useNavigate } from "react-router-dom";
import UsersManagement from "../components/UsersManagement";
import ContentManagement from "../components/ContentManagement";
import AdminSections from "../components/AdminSections";
import AdvertisersManagement from "../components/AdvertisersManagement";
import PaymentsManagement from "../components/PaymentsManagement";
import IssuesManagement from "../components/IssuesManagement";
import AdminFlipbookViewer from "../components/AdminFlipbookViewer";
import AdSlotsManagement from "../components/AdSlotsManagement";
import AnalyticsManagement from "../components/AnalyticsManagement";
import InfrastructureManagement from "../components/InfrastructureManagement";
import IntegrationsManagement from "../components/IntegrationsManagement";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import LoginPage from "../components/LoginPage";
import PlacementBook from "../components/PlacementBook";

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
        <IssuesManagement />
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
    path: "/admin/placement-book", 
    element: (
      <AdminProtectedRoute>
        <PlacementBook />
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
  { 
    path: "/admin/sections", 
    element: (
      <AdminProtectedRoute>
        <AdminSections />
      </AdminProtectedRoute>
    ) 
  },
];

