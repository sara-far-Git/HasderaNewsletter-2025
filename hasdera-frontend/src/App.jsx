import { useEffect, useState } from "react";
import { getAnalytics, createDemoAnalytics } from "./apiService";
import IssuesManager from "./IssuesManager";

function App() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" או "issues"

  useEffect(() => {
    if (activeTab === "analytics") {
      console.log("🚀 מריץ useEffect → טוען נתוני Analytics");
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("❌ שגיאה בטעינת נתונים:", err);
    }
    setLoading(false);
  };

  const handleAddDemo = async () => {
    console.log("➕ מוסיף רשומת דמו...");
    try {
      await createDemoAnalytics();
      console.log("🔄 טוען מחדש נתונים אחרי הוספת דמו");
      loadData();
    } catch (err) {
      console.error("❌ שגיאה בהוספת רשומת דמו:", err);
    }
  };

  return (
    <div style={{ direction: "rtl", padding: "20px", fontFamily: "Arial" }}>
      <h1>🏢 מערכת ניהול חדשות הסדרה</h1>

      {/* תפריט טאבים */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #ddd" }}>
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            padding: "10px 20px",
            marginLeft: "5px",
            backgroundColor: activeTab === "analytics" ? "#1976d2" : "#f5f5f5",
            color: activeTab === "analytics" ? "white" : "black",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "analytics" ? "bold" : "normal"
          }}
        >
          📊 Analytics
        </button>
        <button
          onClick={() => setActiveTab("issues")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "issues" ? "#1976d2" : "#f5f5f5",
            color: activeTab === "issues" ? "white" : "black",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "issues" ? "bold" : "normal"
          }}
        >
          📰 ניהול גיליונות
        </button>
      </div>

      {/* תוכן לפי טאב */}
      {activeTab === "analytics" && (
        <div>
          <h2>📊 נתוני Analytics</h2>
          {loading ? (
            <p>טוען נתונים...</p>
          ) : analytics.length === 0 ? (
            <div>
              <p>אין נתונים עדיין במסד</p>
              <button onClick={handleAddDemo}>➕ הוסף רשומת דמו</button>
            </div>
          ) : (
            <div>
              <button onClick={handleAddDemo}>➕ הוסף רשומת דמו</button>
              <table border="1" cellPadding="5" style={{ marginTop: "10px", width: "100%" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                    <th>ID</th>
                    <th>Clicks</th>
                    <th>Unique Readers</th>
                    <th>CTR</th>
                    <th>Report Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((a) => (
                    <tr key={a.analyticsId}>
                      <td>{a.analyticsId}</td>
                      <td>{a.clicksTotal}</td>
                      <td>{a.uniqueReaders}</td>
                      <td>{a.ctr}</td>
                      <td>{a.reportDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "issues" && <IssuesManager />}
    </div>
  );
}

export default App;
