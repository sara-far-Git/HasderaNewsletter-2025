import { api } from "./api.js";
import { getIssues } from "./issuesService.js";

// קבלת כל המודעות מגיליונות פורסמים
export async function getPublishedAds(page = 1, pageSize = 20) {
  try {
    // נטען את כל הגיליונות הפורסמים ונחלץ מהם את המודעות
    const issues = await getIssues(page, pageSize, true);
    
    // נאסוף את כל המודעות מכל הגיליונות
    const allAds = [];
    
    for (const issue of issues) {
      try {
        const res = await api.get(`/Issues/${issue.issue_id || issue.issueId}/ads`);
        const ads = Array.isArray(res.data) ? res.data : [];
        // נוסיף את מזהה הגיליון לכל מודעה
        ads.forEach(ad => {
          allAds.push({
            ...ad,
            issueId: issue.issue_id || issue.issueId,
            issueTitle: issue.title,
            issueDate: issue.issueDate,
          });
        });
      } catch (err) {
        // אם אין מודעות לגיליון זה, נמשיך
        if (err.response?.status !== 404) {
          console.warn(`⚠️ שגיאה בטעינת מודעות לגיליון ${issue.issue_id}:`, err);
        }
      }
    }
    
    return allAds;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Published Ads:", err);
    return [];
  }
}

// קבלת מודעות למדור ספציפי (אם יש קשר)
export async function getSectionAds(sectionId) {
  try {
    const res = await api.get(`/Sections/${sectionId}/ads`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ שגיאה ב-GET Section Ads:", err);
    if (err.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

// קבלת מודעות לגיליון ספציפי
export async function getIssueAds(issueId) {
  try {
    const res = await api.get(`/Issues/${issueId}/ads`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issue Ads:", err);
    if (err.response?.status === 404) {
      return [];
    }
    throw err;
  }
}
