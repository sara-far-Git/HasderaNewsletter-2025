import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import AnalyticsTable from "./Components/AnalyticsTable";
import AdvertisersList from "./Components/AdvertisersList";
import IssuesList from "./Components/IssuesList";
import AdvertiserNav from "./Components/AdvertiserNav"; 
import PlacementBook from "./Components/PlacementBook";
import FlipCanvasViewer from "./Components/FlipCanvasViewer";
import FlipIssue from "./Components/FlipIssue";
const PaymentPage = () => <div style={{padding: 40, textAlign: 'center'}}>עמוד תשלום (בקרוב)</div>;

// ✨ קומפוננט חדש שמקבל את המידע ומעביר ל-FlipCanvasViewer
function IssueViewer() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  console.log("📖 IssueViewer - received state:", state);
  
  // state מגיע מה-navigate ב-IssuesList:
  // navigate(`/issues/${it.issue_id}`, { state: it });
  // state מכיל את כל המידע על הגיליון כולל pdf_url ו-title
  
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdvertiserNav />} />
        <Route path="/issues" element={<IssuesList />} />
        
        {/* 🔧 שינוי כאן - קומפוננט wrapper במקום ישירות */}
        <Route path="/issues/:id" element={<IssueViewer />} />
        
        <Route path="/analytics" element={<AnalyticsTable />} />
        <Route path="/advertisers" element={<AdvertisersList />} />
        <Route path="/advertiser/placement" element={<PlacementBook />} />
        <Route path="/advertiser/payment" element={<PaymentPage />} />
        <Route path="/viewer" element={<FlipCanvasViewer />} />
        <Route path="/viewer/:id" element={<FlipIssue />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;