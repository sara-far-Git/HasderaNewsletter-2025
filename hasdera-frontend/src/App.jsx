import AnalyticsTable from "./Components/AnalyticsTable";
import AdvertisersList from "./Components/AdvertisersList";
import IssuesList from "./Components/IssuesList";
import FlipIssue from "./Components/FlipIssue";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IssuesList />} />
        <Route path="/issues/:id" element={<FlipIssue />} />
        <Route path="/analytics" element={<AnalyticsTable />} />
        <Route path="/advertisers" element={<AdvertisersList />} />
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;
