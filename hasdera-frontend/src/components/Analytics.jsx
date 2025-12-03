import { useState, useEffect } from "react";
import { getAnalytics, createDemoAnalytics } from "../Services/analyticsService";


export default function Analytics() {   
const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚀 מריץ useEffect → טוען נתוני Analytics");
    loadData();
  }, []);

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

  if (loading) return <p>טוען נתונים...</p>;

  return (
    <div style={{ direction: "rtl", padding: "20px", fontFamily: "Arial" }}>
      <h1>📊 נתוני Analytics</h1>

      {analytics.length === 0 ? (
        <div>
          <p>אין נתונים עדיין במסד</p>
          <button onClick={handleAddDemo}>➕ הוסף רשומת דמו</button>
        </div>
      ) : (
        <div>
          <button onClick={handleAddDemo}>➕ הוסף רשומת דמו</button>
          <table border="1" cellPadding="5" style={{ marginTop: "10px" }}>
            <thead>
              <tr>
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
  );
}