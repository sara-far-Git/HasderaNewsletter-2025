import { useEffect, useState } from "react";
import { getAllIssues, createIssue, updateIssue, deleteIssue } from "./apiService";

function IssuesManager() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // טופס לגיליון חדש/עריכה
  const [formData, setFormData] = useState({
    issueId: 0,
    title: "",
    issueDate: new Date().toISOString().split("T")[0],
    fileUrl: "",
    summary: ""
  });

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllIssues();
      setIssues(data);
    } catch (err) {
      setError("שגיאה בטעינת הגיליונות: " + err.message);
      console.error("❌ שגיאה בטעינת גיליונות:", err);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingIssue) {
        // עדכון גיליון קיים
        await updateIssue(editingIssue.issueId, formData);
        console.log("✅ גיליון עודכן בהצלחה");
      } else {
        // יצירת גיליון חדש
        await createIssue(formData);
        console.log("✅ גיליון חדש נוצר בהצלחה");
      }

      // איפוס הטופס וטעינה מחדש
      resetForm();
      loadIssues();
    } catch (err) {
      setError(editingIssue ? "שגיאה בעדכון הגיליון: " + err.message : "שגיאה ביצירת גיליון: " + err.message);
      console.error("❌ שגיאה:", err);
    }
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
    setFormData({
      issueId: issue.issueId,
      title: issue.title,
      issueDate: issue.issueDate,
      fileUrl: issue.fileUrl || "",
      summary: issue.summary || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הגיליון?")) {
      return;
    }

    setError(null);
    try {
      await deleteIssue(id);
      console.log("✅ גיליון נמחק בהצלחה");
      loadIssues();
    } catch (err) {
      setError("שגיאה במחיקת הגיליון: " + err.message);
      console.error("❌ שגיאה במחיקה:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      issueId: 0,
      title: "",
      issueDate: new Date().toISOString().split("T")[0],
      fileUrl: "",
      summary: ""
    });
    setEditingIssue(null);
    setShowForm(false);
  };

  if (loading) return <p>טוען גיליונות...</p>;

  return (
    <div style={{ direction: "rtl", padding: "20px", fontFamily: "Arial" }}>
      <h1>📰 ניהול גיליונות</h1>

      {error && (
        <div style={{
          background: "#ffebee",
          color: "#c62828",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "10px"
        }}>
          {error}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          backgroundColor: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {showForm ? "סגור טופס" : "➕ הוסף גיליון חדש"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "5px",
            marginBottom: "20px"
          }}
        >
          <h3>{editingIssue ? "✏️ ערוך גיליון" : "➕ גיליון חדש"}</h3>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>כותרת: *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>תאריך הגיליון: *</label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>קישור לקובץ:</label>
            <input
              type="url"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/file.pdf"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>תקציר:</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows="4"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              {editingIssue ? "💾 עדכן" : "➕ צור"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "10px 20px",
                backgroundColor: "#757575",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              ביטול
            </button>
          </div>
        </form>
      )}

      {issues.length === 0 ? (
        <p>אין גיליונות במערכת</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
              <th>ID</th>
              <th>כותרת</th>
              <th>תאריך</th>
              <th>תקציר</th>
              <th>קובץ</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.issueId}>
                <td>{issue.issueId}</td>
                <td>{issue.title}</td>
                <td>{issue.issueDate}</td>
                <td>{issue.summary ? issue.summary.substring(0, 50) + "..." : "-"}</td>
                <td>
                  {issue.fileUrl ? (
                    <a href={issue.fileUrl} target="_blank" rel="noopener noreferrer">
                      📄 קובץ
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(issue)}
                    style={{
                      padding: "5px 10px",
                      marginLeft: "5px",
                      backgroundColor: "#ff9800",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
                  >
                    ✏️ ערוך
                  </button>
                  <button
                    onClick={() => handleDelete(issue.issueId)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
                  >
                    🗑️ מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default IssuesManager;
