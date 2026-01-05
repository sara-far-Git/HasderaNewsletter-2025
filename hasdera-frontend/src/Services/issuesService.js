import { api } from "./api.js";

// 📚 קבלת כל הגיליונות האחרונים
export async function getIssues(page = 1, pageSize = 100, publishedOnly = false) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    if (publishedOnly) {
      params.append('publishedOnly', 'true');
    }
    const res = await api.get(`/Issues?${params.toString()}`);
    console.log(`📋 getIssues - Response:`, res.data);
    // ה-API מחזיר PagedResult עם items
    if (res.data && res.data.items) {
      console.log(`✅ getIssues - Found ${res.data.items.length} issues (total: ${res.data.total})`);
      return res.data.items;
    }
    // אם אין items, נחזיר את הנתונים ישירות (תואם לאחור)
    const items = res.data || [];
    console.log(`✅ getIssues - Returning ${items.length} issues (legacy format)`);
    return items;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issues:", err);
    // במקרה של שגיאה, נחזיר מערך ריק במקום לזרוק שגיאה
    console.error("פרטי השגיאה:", err.response?.data || err.message);
    return [];
  }
}

// יצירת גיליון חדש
export async function createIssue(issue) {
  try {
    const res = await api.post("/issues", issue);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Issue:", err);
    throw err;
  }
}
// קבלת קובץ PDF לפי ID
export async function getIssuePdf(id) {
  try {
    const res = await api.get(`/issues/${id}/pdf`, {
      responseType: "blob", // חשוב! כדי שהקובץ יגיע כ-Binary ולא כטקסט
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    return url;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issue PDF:", err);
    throw err;
  }
}

// קבלת גיליון לפי ID
export async function getIssueById(id) {
  try {
    const res = await api.get(`/issues/${id}`);
    console.log('📥 getIssueById - Raw response:', res);
    console.log('📥 getIssueById - Response data:', res.data);
    console.log('📥 getIssueById - Summary field:', res.data?.Summary || res.data?.summary);
    console.log('📥 getIssueById - All keys:', Object.keys(res.data || {}));
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issue by ID:", err);
    throw err;
  }
}

// העלאת PDF לגיליון חדש
export async function uploadIssuePdf(file, title = null, issueNumber = null, issueDate = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (issueNumber) formData.append('issueNumber', issueNumber);
    if (issueDate) formData.append('issueDate', issueDate);

    const res = await api.post("/Issues/upload-pdf", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Issue PDF upload:", err);
    throw err;
  }
}

// עדכון גיליון עם קישורים ואנימציות
export async function updateIssueMetadata(issueId, data) {
  try {
    const res = await api.put(`/Issues/${issueId}/update`, data);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-PUT Issue metadata:", err);
    throw err;
  }
}

// פרסום גיליון
export async function publishIssue(issueId) {
  try {
    const res = await api.put(`/Issues/${issueId}/publish`);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-PUT Issue publish:", err);
    throw err;
  }
}

// מחיקת גיליון (רק טיוטות)
export async function deleteIssue(issueId) {
  try {
    const res = await api.delete(`/Issues/${issueId}`);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-DELETE Issue:", err);
    throw err;
  }
}

// קבלת מקומות פרסום לפי גיליון
export async function getIssueSlots(issueId) {
  try {
    const res = await api.get(`/Issues/${issueId}/slots`);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issue Slots:", err);
    throw err;
  }
}

// הזמנה טלפונית (מנהל) למקום פרסום בגיליון
export async function bookIssueSlot(issueId, slotId, payload) {
  try {
    const res = await api.post(`/Issues/${issueId}/slots/${slotId}/book`, payload);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Issue Slot booking:", err);
    throw err;
  }
}

// עריכת הזמנה קיימת (מנהל): שינוי מקום / סטטוס תשלום
export async function updateIssueSlotBooking(issueId, slotId, payload) {
  try {
    const res = await api.put(`/Issues/${issueId}/slots/${slotId}/booking`, payload);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-PUT Issue Slot booking edit:", err);
    throw err;
  }
}
  
