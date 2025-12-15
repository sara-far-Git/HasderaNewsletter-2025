// src/Services/slotsService.js
import { api, handleError } from "./api.js";

/**
 * מחיקת כל ה-Adplacements (פינוי כל המקומות) עבור גיליון מסוים
 * @param {number} issueId - מזהה הגיליון
 * @returns {Promise<void>}
 */
export async function clearAdplacementsForIssue(issueId) {
  try {
    // נניח שה-API הוא: DELETE /api/Issues/{issueId}/adplacements
    await api.delete(`/Issues/${issueId}/adplacements`);
  } catch (err) {
    handleError("DELETE Adplacements for Issue", err);
    throw err;
  }
}
