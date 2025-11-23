#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Assistant למפרסמים של 'השדרה'
עוזר למפרסמים לבחור מיקום לפרסום, גודל מודעה, רעיונות למודעה,
ומשתמש גם בפרופיל אישי של המפרסם כדי לתת המלצות מותאמות.
"""

import os
import sys
import json
import requests
import urllib3
from dotenv import load_dotenv
from openai import OpenAI

# השבתת אזהרות SSL (לפיתוח)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# טעינת משתני סביבה
load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

# קביעת encoding
try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

API_BASE_URL = "https://localhost:7083/api"


# ------------------------------------------------------------
# 1. ניקוי טקסטים
# ------------------------------------------------------------
def sanitize_text(text):
    if not text:
        return text
    try:
        cleaned = text.encode("utf-8", errors="replace").decode("utf-8", errors="replace")
        cleaned = ''.join(c for c in cleaned if ord(c) < 0xD800 or ord(c) > 0xDFFF)
        return cleaned
    except:
        return ''.join(c for c in text if ord(c) < 0xD800 or ord(c) > 0xDFFF)


# ------------------------------------------------------------
# 2. הבאת עמודים פנויים מה-API
# ------------------------------------------------------------
def fetch_available_pages(issue_id=None):
    """
    מביא רשימת Slots פנויים מה-API
    מחזיר רק slots שפנויים (is_available=True או שלא מסומנים כלא פנויים)
    """
    try:
        url = f"{API_BASE_URL}/Slots"
        if issue_id:
            url += f"?issue_id={issue_id}"

        response = requests.get(url, timeout=10, verify=False)
        if response.status_code == 200:
            slots = response.json()
            # סינון רק slots פנויים
            # אם יש שדה is_available, נשתמש בו
            # אם אין, נניח שכולם פנויים (או נבדוק לפי שדות אחרים)
            available_slots = []
            for slot in slots:
                # בדיקה אם יש שדה is_available
                is_available = slot.get('is_available', slot.get('IsAvailable', True))
                # אם יש שדה occupied או booked, נבדוק גם אותם
                is_occupied = slot.get('occupied', slot.get('Occupied', False))
                is_booked = slot.get('booked', slot.get('Booked', False))
                
                # Slot פנוי אם: is_available=True ולא occupied ולא booked
                if is_available and not is_occupied and not is_booked:
                    available_slots.append(slot)
            
            return available_slots
        return []
    except Exception as e:
        error_msg = sanitize_text(str(e))
        print(f"DEBUG: Error fetching slots: {error_msg}", file=sys.stderr)
        return []


# ------------------------------------------------------------
# 3. הבאת מידע על גיליון
# ------------------------------------------------------------
def fetch_issue_info(issue_id):
    try:
        url = f"{API_BASE_URL}/Issues/{issue_id}"
        response = requests.get(url, timeout=10, verify=False)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        print("DEBUG: issue error:", sanitize_text(str(e)), file=sys.stderr)
        return None


# ------------------------------------------------------------
# 4. בניית פרומפט מלא
# ------------------------------------------------------------
def build_prompt(
    user_query,
    available_pages=None,
    issue_info=None,
    user_profile=None,
    payment_link=None,
    manager_contact_link=None,
    graphics_link=None
):
    """
    בונה את ה-system_message ואת ה-user_message
    עבור ה-AI Assistant שמלווה מפרסמים במגזין 'השדרה'.
    """

    # ---------------------------
    #  SYSTEM MESSAGE (קבוע)
    # ---------------------------
    system_message = """
אתה Assistant מקצועי למפרסמים במגזין 'השדרה'.

המטרה שלך:
ללוות את המפרסם מההתעניינות הראשונית ועד קבלת החלטה:
תשלום, יצירת קשר עם הניהול, או יציאה.

סגנון:
שירותי, קצר, ענייני, מקצועי. ללא Markdown וללא כוכביות.

שלבי העבודה:

1. להבין את סוג העסק והמטרה.
2. להציע חבילת התחלה + חבילה בולטת יותר.
   (רק גודל + יתרון — בלי רעיונות עיצוביים!)
3. אם צריך — לבדוק מיקומים.
   להשתמש רק בעמודים הפנויים שמוזרמים ב-user message.
4. אם אין למפרסם מודעה מעוצבת — להפנות לגרפיקאית.
5. שלב סיום:
   תמיד להציע שלוש אפשרויות:
   - מעבר לתשלום
   - יצירת קשר עם הניהול
   - יציאה

חוקים:
- אסור להציע מיקומים שלא קשורים לסוג העסק.
- אסור לשאול שוב על סוג העסק אם נאמר.
- אסור לחזור על דברי המשתמש.
- אסור לדחוף להצעה נוספת אחרי שהמשתמש ביקש לצאת.

טריגרים בהתנהגות:
- אם המשתמש מבקש לשלם → תשיב "מעבירה אותך לעמוד התשלום."
- אם מבקש לדבר עם הניהול → "מעבירה אותך לניהול."
- אם אומר שאין מודעה → להפנות לגרפיקאית.
- אם אומר שהוא רוצה לצאת → לסיים בצורה מכובדת.

סיום כל תשובה:
תמיד לסיים בכך שאתה מציג בפניו את שלוש האפשרויות:
תשלום / יצירת קשר / יציאה.
"""

    # ---------------------------
    #  USER MESSAGE (דינמי)
    # ---------------------------

    user_message = f"""
שאלה מהמשתמש:
{user_query}

קישורים חשובים:
- עמוד תשלום: {payment_link or "לא סופק קישור"}
- יצירת קשר עם הניהול: {manager_contact_link or "לא סופק קישור"}
- קישור לגרפיקאית: {graphics_link or "לא סופק קישור"}

הנחיות נוספות:
- אם המשתמש רוצה לשלם → עליך להפנות לקישור התשלום.
- אם המשתמש מבקש ניהול → להפנות לקישור יצירת קשר.
- אם אין לו מודעה → להפנות לגרפיקאית.
- אם המשתמש מבקש לצאת → לסיים בנימוס.

"""

    # פרופיל משתמש
    if user_profile:
        user_message += f"""
פרופיל מפרסם אישי:
{json.dumps(user_profile, ensure_ascii=False, indent=2)}

"""

    # עמודים פנויים
    if available_pages and len(available_pages) > 0:
        user_message += "עמודים פנויים:\n"
        for p in available_pages[:20]:
            page = p.get('page_number') or p.get('PageNumber') or p.get('name') or 'N/A'
            slot = p.get('slot_type') or p.get('SlotType') or p.get('code') or 'N/A'
            price = p.get('base_price') or p.get('BasePrice') or ''
            user_message += f"עמוד {page} | סוג: {slot} | מחיר: {price}\n"
    else:
        user_message += "אין מידע על עמודים פנויים כרגע.\n"

    # מידע על הגיליון
    if issue_info:
        title = issue_info.get("title") or issue_info.get("Title")
        date = issue_info.get("issueDate") or issue_info.get("IssueDate")
        user_message += f"""
מידע על הגיליון:
כותרת: {title}
תאריך: {date}
"""

    return system_message, user_message

# ------------------------------------------------------------
# 5. MAIN – ריצה בפועל
# ------------------------------------------------------------
def main():
    try:
        # קריאת קלט מ-stdin - יכול להיות JSON או טקסט פשוט
        input_line = sys.stdin.readline().strip()
        
        if not input_line:
            print(json.dumps({"reply": "שלום! אני כאן כדי לעזור לך לחשוב על פרסום במגזין 'השדרה' ולהציע לך חבילת פרסום שמתאימה לעסק שלך. איך אוכל לעזור לך?"}, ensure_ascii=False))
            return

        # ניסיון לפרסר כ-JSON (אם יש user_profile)
        user_query = None
        user_profile = None
        
        try:
            # ניסיון לפרסר כ-JSON
            input_data = json.loads(input_line)
            user_query = sanitize_text(input_data.get("query", ""))
            user_profile = input_data.get("user_profile", None)
        except (json.JSONDecodeError, AttributeError):
            # אם זה לא JSON, זה כנראה רק query פשוט
            user_query = sanitize_text(input_line)
            user_profile = None

        if not user_query:
            print(json.dumps({"reply": "שלום! אני כאן כדי לעזור לך לחשוב על פרסום במגזין 'השדרה' ולהציע לך חבילת פרסום שמתאימה לעסק שלך. איך אוכל לעזור לך?"}, ensure_ascii=False))
            return

        if not OPENAI_KEY:
            print(json.dumps({"reply": "שגיאה: חסר API key"}, ensure_ascii=False))
            return

        client = OpenAI(api_key=OPENAI_KEY)

        # משיכת עמודים פנויים מה-API (רק פנויים)
        available_pages = fetch_available_pages()
        
        # אם אין עמודים פנויים, available_pages יהיה רשימה ריקה
        # זה בסדר - ה-AI יתן המלצות כלליות

        # בניית prompt עם הפרופיל (אם קיים)
        system_message, user_message = build_prompt(
            user_query,
            available_pages,
            issue_info=None,
            user_profile=user_profile
        )

        # קריאה ל-OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=450
        )

        reply = sanitize_text(response.choices[0].message.content.strip())

        # הדפסה בפורמט JSON
        print(json.dumps({"reply": reply}, ensure_ascii=False, indent=2))

    except Exception as e:
        print(json.dumps({"reply": f"שגיאה: {sanitize_text(str(e))}"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
