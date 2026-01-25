/**
 * readingHistoryService.js
 * ניהול היסטוריית קריאה ומועדפים
 */

const FAVORITES_KEY = 'hasdera_favorites';
const READING_HISTORY_KEY = 'hasdera_reading_history';
const READING_PROGRESS_KEY = 'hasdera_reading_progress';

// ============================================
// 🌟 מועדפים
// ============================================

/**
 * קבלת רשימת מועדפים
 */
export function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * בדיקה אם גיליון במועדפים
 */
export function isFavorite(issueId) {
  const favorites = getFavorites();
  return favorites.some(f => f.issueId === issueId);
}

/**
 * הוספה/הסרה ממועדפים
 */
export function toggleFavorite(issue) {
  const favorites = getFavorites();
  const issueId = issue.issue_id || issue.issueId;
  const index = favorites.findIndex(f => f.issueId === issueId);
  
  if (index === -1) {
    // הוספה למועדפים
    favorites.push({
      issueId,
      title: issue.title,
      issueDate: issue.issueDate || issue.issue_date,
      addedAt: new Date().toISOString()
    });
  } else {
    // הסרה ממועדפים
    favorites.splice(index, 1);
  }
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return index === -1; // מחזיר true אם נוסף, false אם הוסר
}

/**
 * הסרה ממועדפים
 */
export function removeFavorite(issueId) {
  const favorites = getFavorites();
  const filtered = favorites.filter(f => f.issueId !== issueId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

// ============================================
// 📖 היסטוריית קריאה
// ============================================

/**
 * קבלת היסטוריית קריאה
 */
export function getReadingHistory() {
  try {
    const stored = localStorage.getItem(READING_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * הוספה להיסטוריית קריאה
 */
export function addToReadingHistory(issue) {
  const history = getReadingHistory();
  const issueId = issue.issue_id || issue.issueId;
  
  // הסרה אם כבר קיים (כדי להעביר לראש הרשימה)
  const filtered = history.filter(h => h.issueId !== issueId);
  
  // הוספה לראש הרשימה
  filtered.unshift({
    issueId,
    title: issue.title,
    issueDate: issue.issueDate || issue.issue_date,
    viewedAt: new Date().toISOString()
  });
  
  // שמירת רק 20 האחרונים
  const trimmed = filtered.slice(0, 20);
  localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(trimmed));
}

/**
 * קבלת הגיליון האחרון שנקרא
 */
export function getLastReadIssue() {
  const history = getReadingHistory();
  return history.length > 0 ? history[0] : null;
}

/**
 * מחיקת היסטוריה
 */
export function clearReadingHistory() {
  localStorage.removeItem(READING_HISTORY_KEY);
}

// ============================================
// 📍 התקדמות קריאה
// ============================================

/**
 * שמירת התקדמות קריאה
 */
export function saveReadingProgress(issueId, page, totalPages) {
  try {
    const stored = localStorage.getItem(READING_PROGRESS_KEY);
    const progress = stored ? JSON.parse(stored) : {};
    
    progress[issueId] = {
      page,
      totalPages,
      percentage: Math.round((page / totalPages) * 100),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving reading progress:', e);
  }
}

/**
 * קבלת התקדמות קריאה
 */
export function getReadingProgress(issueId) {
  try {
    const stored = localStorage.getItem(READING_PROGRESS_KEY);
    if (!stored) return null;
    
    const progress = JSON.parse(stored);
    return progress[issueId] || null;
  } catch {
    return null;
  }
}

/**
 * קבלת כל ההתקדמויות
 */
export function getAllReadingProgress() {
  try {
    const stored = localStorage.getItem(READING_PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * קבלת גיליונות עם התקדמות לא גמורה
 */
export function getInProgressIssues() {
  const progress = getAllReadingProgress();
  const history = getReadingHistory();
  
  return history
    .filter(h => {
      const p = progress[h.issueId];
      return p && p.percentage < 100;
    })
    .map(h => ({
      ...h,
      progress: progress[h.issueId]
    }))
    .slice(0, 5);
}

