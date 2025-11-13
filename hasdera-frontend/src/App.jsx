import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AnalyticsTable from "./Components/AnalyticsTable";
import AdvertisersList from "./Components/AdvertisersList";
import IssuesList from "./Components/IssuesList";
import AdvertiserNav from "./Components/AdvertiserNav"; 
import PlacementBook from "./Components/PlacementBook";
import FlipCanvasViewer from "./Components/FlipCanvasViewer";
import FlipIssue from "./Components/FlipIssue";
const PaymentPage = () => <div style={{padding: 40, textAlign: 'center'}}>עמוד תשלום (בקרוב)</div>;

// ✨ קומפוננט חדש שמקבל את המידע ומעביר ל-FlipIssue
function IssueViewer() {
  const { state } = useLocation();
  
  console.log("📖 IssueViewer - received state:", state);
  
  // state.pdf_url מגיע מה-navigate ב-IssuesList:
  // navigate(`/issues/${it.issue_id}`, { state: it });
  
  return <FlipIssue fileUrl={state?.pdf_url} />;
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