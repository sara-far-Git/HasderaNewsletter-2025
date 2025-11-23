import { useEffect, useState } from "react";
import { getAnalytics, createDemoAnalytics } from "../Services/analyticsService.js";

const AnalyticsTable = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("❌ שגיאה בטעינת נתונים:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDemo = async () => {
    try {
      await createDemoAnalytics();
      loadData(); // טוען מחדש אחרי יצירה
    } catch (err) {
      console.error("❌ שגיאה בהוספת רשומת דמו:", err);
    }
  };

  if (loading) return <p>טוען נתונים...</p>;

  return (
    <div style={{ direction: "rtl", padding: "20px", fontFamily: "Arial" }}>
      <h2>📊 נתוני Analytics</h2>

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
};

export default AnalyticsTable;
