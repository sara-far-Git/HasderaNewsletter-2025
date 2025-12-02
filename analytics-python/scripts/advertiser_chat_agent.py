#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Assistant למפרסמים של 'השדרה'
עוזר למפרסמים לבחור מיקום לפרסום ולסגור עסקה.
תומך בהיסטוריית שיחה!
"""

import os
import sys
import json
import requests
import urllib3
from dotenv import load_dotenv
from openai import OpenAI

# השבתת אזהרות SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

# תיקון encoding ל-Windows
import io
# שמירת reference ל-stdout המקורי לפני שינוי
_original_stdout = sys.stdout
_original_stderr = sys.stderr
if sys.platform == 'win32':
    # ב-Windows, נשתמש ב-buffer ישירות
    pass  # נשאיר את sys.stdout כמו שהוא ונכתוב ישירות ל-buffer
else:
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

API_BASE_URL = "https://localhost:7083/api"


def sanitize_text(text):
    if not text:
        return text
    try:
        cleaned = text.encode("utf-8", errors="replace").decode("utf-8", errors="replace")
        cleaned = ''.join(c for c in cleaned if ord(c) < 0xD800 or ord(c) > 0xDFFF)
        return cleaned
    except:
        return ''.join(c for c in text if ord(c) < 0xD800 or ord(c) > 0xDFFF)


def fetch_available_pages(issue_id=None):
    try:
        url = f"{API_BASE_URL}/Slots"
        if issue_id:
            url += f"?issue_id={issue_id}"

        response = requests.get(url, timeout=10, verify=False)
        if response.status_code == 200:
            slots = response.json()
            available_slots = []
            for slot in slots:
                is_available = slot.get('is_available', slot.get('IsAvailable', True))
                is_occupied = slot.get('occupied', slot.get('Occupied', False))
                is_booked = slot.get('booked', slot.get('Booked', False))
                
                if is_available and not is_occupied and not is_booked:
                    available_slots.append(slot)
            
            return available_slots
        return []
    except Exception as e:
        print(f"DEBUG: Error fetching slots: {sanitize_text(str(e))}", file=sys.stderr)
        return []


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


def build_system_message(available_pages=None, issue_info=None):
    """בונה את ה-system message"""
    
    system_message = """אתה יועץ פרסום בכיר במגזין 'השדרה' - מגזין דיגיטלי לקהל שומר מסורת.

התפקיד שלך הוא כפול:
1. **מנתח ואסטרטג**: להדריך את המפרסם דרך נתוני אנליטיקות, ביצועי עבר, ולעזור לו **לגבש החלטה עסקית נבונה** לגבי כדאיות הפרסום.
2. **מנהל מכירות**: לעזור למפרסם לבחור את חבילת הפרסום האופטימלית, לספק מידע טכני מדויק (מחירים, דדליינים, מיקומים פנויים), ולסגור עסקה.

=== חוקים קריטיים וניהול שיחה ===
1. **עדיפות עליונה: קריאת שיחה והימנעות מחזרות!** עליך לעבור על ההיסטוריה ולזהות כל נתון שהמפרסם סיפק (כגון סוג עסק, תקציב, מטרה). **לעולם, אבל לעולם**, אל תחזור ותשאל שאלה שכבר נענתה.
2. **התקדמות עקבית**: תמיד להתקדם לשלב הבא בשיחה. אם קיבלת תשובה, השתמש בה כדי להמשיך מיד להמלצה או לבירור הבא.
3. ניתוח קודם למכירה: אם המפרסם שואל לגבי כדאיות או מחפש נתונים, **התחל בניתוח** לפני שאתה מציע חבילות.
4. לעולם אל תשתמש בביטויים כמו "איך אפשר לעזור" או תחזור על תשובה קודמת.

=== מידע שצריך לאסוף (בהדרגה, ורק אם חסר) ===
- סוג העסק (אם נאמר: השתמש במידע והתקדם למטרה)
- מטרת הפרסום (השקה? מיתוג? מבצע? צורך מיידי?)
- תקציב משוער
- האם יש מודעה מעוצבת?

=== נתוני אנליטיקות ואינדיקטורים קריטיים ===

* **שיעור הקלקה ממוצע (CTR)**: 1.2% - 1.8% (במהלך השבוע הראשון).
* **זמן שהייה ממוצע (Avg Time on Page)**: 3:30 - 4:45 דקות.
* **הקלקות למודעה במדורים מרכזיים**:
    * אופנה/ביוטי: 180-250 קליקים.
    * בריאות/חינוך: 120-160 קליקים.
* **השוואה היסטורית**: עמוד כפול (דאבל) מניב בממוצע 40% יותר תנועה מעמוד בודד.

=== שלבי ניתוח נתונים (כאשר רלוונטי) ===
1. הצגת נתונים רלוונטיים: "בגיליון האחרון, מודעות דומות לתחום שלך קיבלו כ-220 קליקים בממוצע."
2. הערכת כדאיות: "בהתחשב בנתונים אלה ובעובדה שאתה משיק קו חדש, המלצתי היא לפרסם דאבל במדור אופנה כדי למקסם את הנראות."
3. גיבוש החלטה: "האם מדובר בנתוני ביצועים שיספקו את מטרת הפרסום שלך?"

=== גדלי מודעות ומחירים ===

עמוד מלא בודד: 250₪
- פרסום חד פעמי בגיליון אחד
... [השאר ללא שינוי, כולל המיקומים המומלצים]

=== תהליך השיחה המשולב ===
1. זיהוי העסק והצורך.
2. ניתוח אנליטיקות וגיבוש החלטה על גודל ומיקום ראשוני.
3. סיכום החבילה: גודל, מיקום, מחיר מדויק, והפניה לדדליינים.
4. בירור לגבי חומרים (מודעה מעוצבת/צורך בשירותי עיצוב).
5. סיכום סופי והפניה לתשלום.

=== סגנון תקשורת ===
- עברית חמה, מקצועית וטבעית.
- בלי סימנים מיוחדים (**, ##, מקפים).
- מקסימום אמוג'י אחד בתשובה.
- תמיד לסיים בשאלה או הצעה ברורה לשלב הבא."""

    if available_pages and len(available_pages) > 0:
        system_message += "\n\n=== מיקומים פנויים בגיליון הקרוב ===\n"
        for p in available_pages[:12]:
            page = p.get('page_number') or p.get('PageNumber') or '?'
            slot_type = p.get('slot_type') or p.get('SlotType') or ''
            price = p.get('base_price') or p.get('BasePrice') or ''
            section = p.get('section') or p.get('Section') or ''
            line = f"עמוד {page}"
            if slot_type:
                line += f" | {slot_type}"
            if section:
                line += f" | {section}"
            if price:
                line += f" | {price}₪"
            system_message += line + "\n"

    if issue_info:
        title = issue_info.get("title") or issue_info.get("Title") or ""
        date = issue_info.get("issueDate") or issue_info.get("IssueDate") or ""
        deadline = issue_info.get("deadline") or issue_info.get("Deadline") or ""
        if title:
            system_message += f"\nנושא הגיליון הקרוב: {title}\n"
        if date:
            system_message += f"תאריך יציאה: {date}\n"
        if deadline:
            system_message += f"דדליין: {deadline}\n"

    return system_message


def main():
    try:
        # תיקון קריאת input ב-Windows
        if sys.platform == 'win32':
            import codecs
            sys.stdin = codecs.getreader('utf-8')(sys.stdin.buffer, errors='replace')
        input_line = sys.stdin.readline().strip()
        
        if not input_line:
            output = json.dumps({
                "reply": "היי! 👋 אני כאן לעזור לך לתכנן את הפרסום במגזין השדרה. אני יכולה לעזור עם בחירת גודל, מיקום, מחירים ודדליינים. ספרי לי, מה העסק שלך?"
            }, ensure_ascii=False)
            if sys.platform == 'win32':
                _original_stdout.buffer.write(output.encode('utf-8'))
                _original_stdout.buffer.write(b'\n')
                _original_stdout.buffer.flush()
            else:
                print(output)
            return

        # פרסור הקלט
        user_query = None
        user_profile = None
        conversation_history = []
        
        try:
            input_data = json.loads(input_line)
            user_query = sanitize_text(input_data.get("query", ""))
            user_profile = input_data.get("user_profile", None)
            conversation_history = input_data.get("history", [])
        except (json.JSONDecodeError, AttributeError):
            user_query = sanitize_text(input_line)

        if not user_query:
            output = json.dumps({
                "reply": "היי! 👋 אני כאן לעזור לך לתכנן את הפרסום במגזין השדרה. אני יכולה לעזור עם בחירת גודל, מיקום, מחירים ודדליינים. ספרי לי, מה העסק שלך?"
            }, ensure_ascii=False)
            if sys.platform == 'win32':
                _original_stdout.buffer.write(output.encode('utf-8'))
                _original_stdout.buffer.write(b'\n')
                _original_stdout.buffer.flush()
            else:
                print(output)
            return

        if not OPENAI_KEY:
            output = json.dumps({
                "reply": "יש בעיה טכנית. נסי שוב עוד כמה דקות."
            }, ensure_ascii=False)
            if sys.platform == 'win32':
                _original_stdout.buffer.write(output.encode('utf-8'))
                _original_stdout.buffer.write(b'\n')
                _original_stdout.buffer.flush()
            else:
                print(output)
            return

        client = OpenAI(api_key=OPENAI_KEY)

        # משיכת נתונים
        available_pages = fetch_available_pages()
        
        # בניית system message
        system_message = build_system_message(available_pages)

        # בניית רשימת ההודעות
        messages = [{"role": "system", "content": system_message}]
        
        # הוספת פרופיל המפרסם כהודעת מערכת נוספת
        if user_profile:
            profile_info = "מידע על המפרסם:\n"
            if user_profile.get('business_name'):
                profile_info += f"עסק: {user_profile['business_name']}\n"
            if user_profile.get('business_type') or user_profile.get('industry'):
                profile_info += f"תחום: {user_profile.get('business_type') or user_profile.get('industry')}\n"
            if user_profile.get('name'):
                profile_info += f"שם: {user_profile['name']}\n"
            
            messages.append({"role": "system", "content": profile_info})

        # הוספת היסטוריית השיחה
        for msg in conversation_history:
            role = "user" if msg.get("isUser") else "assistant"
            content = sanitize_text(msg.get("text", ""))
            if content:
                messages.append({"role": role, "content": content})

        # הוספת ההודעה הנוכחית
        messages.append({"role": "user", "content": user_query})

        # קריאה ל-OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=400
        )

        reply = sanitize_text(response.choices[0].message.content.strip())

        # זיהוי פעולות
        actions = []
        reply_lower = reply.lower()
        
        if any(word in reply for word in ["תשלום", "לשלם", "להזמין", "לסגור"]):
            actions.append({"label": "לתשלום", "url": "/payment"})
        
        if any(word in reply for word in ["צוות", "לדבר עם", "אעביר"]):
            actions.append({"label": "דברי עם הצוות", "url": "/contact"})
        
        if any(word in reply for word in ["גרפיקאית", "עיצוב", "מודעה מעוצבת"]):
            actions.append({"label": "שירותי עיצוב", "url": "/graphics"})

        result = {"reply": reply}
        if actions:
            result["actions"] = actions

        # הבטחת encoding נכון לפלט
        output = json.dumps(result, ensure_ascii=False)
        if sys.platform == 'win32':
            _original_stdout.buffer.write(output.encode('utf-8'))
            _original_stdout.buffer.write(b'\n')
            _original_stdout.buffer.flush()
        else:
            print(output)

    except Exception as e:
        output = json.dumps({
            "reply": "משהו השתבש 😕 נסי שוב או פני לצוות שלנו."
        }, ensure_ascii=False)
        if sys.platform == 'win32':
            _original_stdout.buffer.write(output.encode('utf-8'))
            _original_stdout.buffer.write(b'\n')
            _original_stdout.buffer.flush()
        else:
            print(output)


if __name__ == "__main__":
    main()