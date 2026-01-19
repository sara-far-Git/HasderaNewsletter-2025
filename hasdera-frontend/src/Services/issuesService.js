import { api } from "./api.js";
import { getCreativesByOrder } from "./creativesService.js";

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
    const res = await api.get(`/Issues?${params.toString()}`, {
      timeout: 30000,
    });
    
    // בדיקה אם התשובה היא HTML במקום JSON (שגיאה)
    if (typeof res.data === 'string') {
      if (res.data.includes('<!doctype') || res.data.includes('<html') || res.data.trim().startsWith('<!')) {
        console.error('❌ getIssues - Received HTML instead of JSON');
        return [];
      }
      // אם זה string אבל לא HTML, ננסה לפרסר כ-JSON
      try {
        const parsed = JSON.parse(res.data);
        if (parsed && parsed.items && Array.isArray(parsed.items)) {
          return parsed.items;
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        console.error('❌ getIssues - Received string that is not JSON or HTML');
        return [];
      }
    }
    
    // ה-API מחזיר PagedResult עם items
    if (res.data && res.data.items && Array.isArray(res.data.items)) {
      return res.data.items;
    }
    // אם אין items, נחזיר את הנתונים ישירות (תואם לאחור)
    return Array.isArray(res.data) ? res.data : [];
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

    const res = await api.post("/Issues/upload-pdf", formData);
    
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

// קבלת כל המודעות לגיליון (מנהל)
export async function getIssueCreatives(issueId) {
  try {
    const res = await api.get(`/Issues/${issueId}/creatives`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) {
      try {
        const slotsPayload = await getIssueSlots(issueId);
        const slots = Array.isArray(slotsPayload?.slots)
          ? slotsPayload.slots
          : Array.isArray(slotsPayload?.Slots)
            ? slotsPayload.Slots
            : [];
        const orderIds = Array.from(new Set(
          slots
            .flatMap(slot => Array.isArray(slot?.OccupiedBy)
              ? slot.OccupiedBy
              : Array.isArray(slot?.occupiedBy)
                ? slot.occupiedBy
                : [])
            .map(entry => entry?.OrderId ?? entry?.orderId ?? entry?.orderID)
            .filter(id => Number.isFinite(Number(id)))
            .map(id => Number(id))
        ));

        if (!orderIds.length) return [];

        const creativesLists = await Promise.all(orderIds.map(id => getCreativesByOrder(id)));
        const merged = creativesLists.flat().filter(Boolean);
        const byId = new Map();
        for (const creative of merged) {
          const key = creative?.CreativeId ?? creative?.creativeId ?? creative?.id;
          if (key != null && !byId.has(key)) {
            byId.set(key, creative);
          }
        }
        return Array.from(byId.values());
      } catch (fallbackError) {
        console.error("❌ שגיאה ב-fallback ל-GET Issue creatives:", fallbackError);
        throw err;
      }
    }
    console.error("❌ שגיאה ב-GET Issue creatives:", err);
    throw err;
  }
}

// קבלת כל המודעות לגיליון הטיוטה האחרון (מנהל)
export async function getLatestDraftCreatives() {
  try {
    const res = await api.get(`/Issues/latest-draft/creatives`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ שגיאה ב-GET latest draft creatives:", err);
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

// קבלת מקומות פרסום (slots) לפי גיליון
export async function getIssueSlots(issueId) {
  try {
    if (!issueId) {
      throw new Error("Issue ID is required");
    }
    const res = await api.get(`/Issues/${issueId}/slots`);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issue Slots:", err);
    // אם זה 400 או 404, נחזיר אובייקט ריק במקום לזרוק שגיאה
    if (err.response?.status === 400 || err.response?.status === 404) {
      console.warn(`⚠️ Issue ${issueId} slots not found, returning empty data`);
      return { slots: [] };
    }
    throw err;
  }
}

// הזמנת מקום פרסום (slot) בגיליון
export async function bookIssueSlot(issueId, slotId, payload) {
  try {
    const res = await api.post(`/Issues/${issueId}/slots/${slotId}/book`, payload);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Book Issue Slot:", err);
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

// עדכון חלוקת מיקום (מנהל)
export async function updateIssueSlotPlacement(issueId, slotId, payload) {
  try {
    const res = await api.put(`/Issues/${issueId}/slots/${slotId}/placement`, payload);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-PUT Issue Slot placement:", err);
    throw err;
  }
}
