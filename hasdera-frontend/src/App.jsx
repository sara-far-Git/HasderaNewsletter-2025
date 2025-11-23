import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import hasederaTheme, { GlobalStyles } from "./styles/HasederaTheme";
import AnalyticsTable from "./Components/AnalyticsTable";
import AdvertisersList from "./Components/AdvertisersList";
import IssuesList from "./Components/IssuesList";
import AdvertiserNav from "./Components/AdvertiserNav"; 
import PlacementBook from "./Components/PlacementBook";
import FlipCanvasViewer from "./Components/FlipCanvasViewer";
import FlipIssue from "./Components/FlipIssue";

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

// 🎯 App - קומפוננט ראשי
function App() {
  return (
    <>
      {/* 🎨 סטיילים גלובליים */}
      <GlobalStyleComponent />
      
      <BrowserRouter>
        <Routes>
          {/* 🏠 דף הבית - ניווט מפרסמים */}
          <Route path="/" element={<AdvertiserNav />} />
          
          {/* 📖 גליונות */}
          <Route path="/issues" element={<IssuesList />} />
          <Route path="/issues/:id" element={<IssueViewer />} />
          
          {/* 📊 אנליטיקה */}
          <Route path="/analytics" element={<AnalyticsTable />} />
          
          {/* 👥 רשימת מפרסמים */}
          <Route path="/advertisers" element={<AdvertisersList />} />
          
          {/* 🎨 מפרסם - ניהול */}
          <Route path="/advertiser/placement" element={<PlacementBook />} />
          <Route path="/advertiser/payment" element={<PaymentPage />} />
          
          {/* 📱 Viewers */}
          <Route path="/viewer" element={<FlipCanvasViewer />} />
          <Route path="/viewer/:id" element={<FlipIssue />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;