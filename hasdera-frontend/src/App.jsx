import AnalyticsTable from "./Components/AnalyticsTable";
import AdvertisersList from "./Components/AdvertisersList";
import IssuesList from "./Components/IssuesList";
import FlipIssue from "./Components/FlipIssue";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 1. לייבא את הרכיב החדש (יש לוודא שהנתיב נכון)
import AdvertiserNav from "./Components/AdvertiserNav"; 
import PlacementBook from "./Components/PlacementBook";

// רכיבים זמניים עבור הקישורים החדשים (אופציונלי, מומלץ)
const PaymentPage = () => <div style={{padding: 40, textAlign: 'center'}}>עמוד תשלום (בקרוב)</div>;


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 2. זה עכשיו עמוד הבית */}
        <Route path="/" element={<AdvertiserNav />} />

        {/* 3. עמוד "כל הגליונות" עבר לנתיב הזה */}
        <Route path="/issues" element={<IssuesList />} />

        {/* --- שאר הנתיבים הקיימים --- */}
        <Route path="/issues/:id" element={<FlipIssue />} />
        <Route path="/analytics" element={<AnalyticsTable />} />
        <Route path="/advertisers" element={<AdvertisersList />} />
        
        {/* 4. נתיבים חדשים עבור הכפתורים בעמוד הניווט */}
        <Route path="/advertiser/placement" element={<PlacementBook />} />
        <Route path="/advertiser/payment" element={<PaymentPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;