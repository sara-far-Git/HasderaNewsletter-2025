"""
hasdera_chat_agent.py

סקריפט Python שמקבל שאלות מהמשתמש, מחפש נתוני אנליטיקות (אם יש),
ומשתמש ב-AI של OpenAI כדי לענות על השאלות.

הסקריפט מקבל נתונים דרך stdin (קלט סטנדרטי) ומחזיר תשובה דרך stdout (פלט סטנדרטי).
"""

# ============================================================
# ייבוא ספריות חיצוניות
# ============================================================

import sys      # גישה ל-stdin, stdout, stderr
import json     # לעבודה עם JSON
import os       # לעבודה עם קבצים ותיקיות
import re       # לביטויים רגולריים (חיפוש טקסט)
import requests # לשליחת בקשות HTTP ל-API
import pandas as pd  # לעבודה עם נתונים בטבלאות
from dotenv import load_dotenv  # לטעינת משתני סביבה מקובץ .env
from openai import OpenAI  # לשליחת בקשות ל-AI של OpenAI

# ============================================================
# הגדרת encoding ל-UTF-8 עבור stdout (לתמיכה בעברית)
# ============================================================

if sys.stdout.encoding != 'utf-8':
    try:
        # מגדירים את stdout להשתמש ב-UTF-8
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        # עבור Python גרסאות ישנות יותר (פחות מ-3.7)
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# ============================================================
# טעינת מפתח API של OpenAI מקובץ .env
# ============================================================

# מוצאים את התיקייה שבה נמצא הסקריפט
script_dir = os.path.dirname(os.path.abspath(__file__))
# התיקייה הראשית של analytics-python (רמה אחת למעלה)
parent_dir = os.path.dirname(script_dir)

# מנסים לטעון את קובץ .env מהתיקייה הנוכחית (WorkingDirectory)
load_dotenv()
# מנסים לטעון את קובץ .env מהתיקייה הראשית של analytics-python
load_dotenv(os.path.join(parent_dir, '.env'))

# קוראים את מפתח ה-API של OpenAI מקובץ .env
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

# בודקים שהמפתח קיים - אם לא, מדפיסים שגיאה ויוצאים
if not OPENAI_KEY:
    print(json.dumps({"reply": "⚠️ שגיאה: חסר מפתח API של OpenAI. אנא ודא שקובץ .env קיים ומכיל OPENAI_API_KEY"}))
    sys.exit(1)

# ============================================================
# שלב 1: קריאת הקלט מהשרת (stdin)
# ============================================================

# משתנה גלובלי לאחסון התשובה הסופית
final_reply = None

try:
    # קוראים את כל הקלט מהשרת (ה-C# controller שולח JSON דרך stdin)
    raw = sys.stdin.read().strip()

    # בודקים שהתקבל משהו
    if not raw:
        final_reply = "⚠️ לא התקבל מידע מהשרת"
        raise ValueError("No input received")

    # ממירים את ה-JSON לאובייקט Python
    data = json.loads(raw)

    # מחלצים את השאלה (Query) מה-JSON
    query = data.get("Query", "")
    # מחלצים את היסטוריית השיחה (Session) מה-JSON
    session = data.get("Session", [])
    
except Exception as e:
    # אם יש שגיאה בקריאת הקלט, מדפיסים לוג ומחזירים תשובה
    try:
        print(f"DEBUG: Error reading input: {str(e)}", file=sys.stderr)
    except:
        pass
    if not final_reply:
        final_reply = "⚠️ שגיאה בקריאת הקלט מהשרת"

# ============================================================
# שלב 2: זיהוי ומשיכת נתוני אנליטיקות
# ============================================================

def extract_issue_id(text):
    """
    מנסה לזהות מספר גיליון מתוך הטקסט שהמשתמש שואל.
    
    Args:
        text (str): הטקסט של השאלה
        
    Returns:
        int או None: מספר הגיליון אם נמצא, אחרת None
    """
    # רשימת תבניות (patterns) לחיפוש מספר גיליון:
    patterns = [
        r'גיליון\s*(\d+)',        # "גיליון 123" או "גיליון123"
        r'issue\s*(\d+)',          # "issue 123" או "issue123"
        r'גיליון\s*מספר\s*(\d+)',  # "גיליון מספר 123"
        r'(\d+)',                   # כל מספר אחר בשאלה
    ]
    
    # עוברים על כל התבניות ומחפשים התאמה
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)  # חיפוש לא רגיש לאותיות גדולות/קטנות
        if match:
            try:
                # ממירים את המספר שנמצא למספר שלם (int)
                issue_id = int(match.group(1))
                return issue_id  # מחזירים את המספר שמצאנו
            except:
                # אם נכשל, ממשיכים לתבנית הבאה
                continue
    
    # אם לא נמצא כלום, מחזירים None
    return None


def fetch_issues():
    """
    מושך רשימת כל הגיליונות מה-API של השרת.
    
    Returns:
        list או None: רשימת גיליונות אם נמצאו, אחרת None
    """
    try:
        url = "https://localhost:7083/api/Issues"
        try:
            print(f"DEBUG: Fetching issues list from {url}", file=sys.stderr)
        except:
            pass
        
        r = requests.get(url, verify=False, timeout=10)
        
        try:
            print(f"DEBUG: Issues status code: {r.status_code}", file=sys.stderr)
        except:
            pass
        
        if r.status_code != 200:
            try:
                print(f"DEBUG: Error fetching issues - Status code {r.status_code}", file=sys.stderr)
            except:
                pass
            return None
        
        data = r.json()
        
        if not data or len(data) == 0:
            try:
                print(f"DEBUG: No issues found", file=sys.stderr)
            except:
                pass
            return None
        
        try:
            print(f"DEBUG: Received {len(data)} issues", file=sys.stderr)
        except:
            pass
        
        return data
    except Exception as e:
        try:
            print(f"DEBUG: Error in fetch_issues: {str(e)}", file=sys.stderr)
        except:
            pass
        return None


def fetch_analytics(issue_id):
    """
    מושך נתוני אנליטיקות מה-API של השרת לפי מספר גיליון.
    
    Args:
        issue_id (int): מספר הגיליון
        
    Returns:
        pandas.DataFrame או None: טבלת נתונים אם נמצאו, אחרת None
    """
    try:
        # בונים את ה-URL לבקשה - endpoint שמחזיר נתונים לפי issue_id
        url = f"https://localhost:7083/api/analytics/by-issue?issue_id={issue_id}"
        
        # לוג לדיבוג (נשלח ל-stderr כדי לא להפריע ל-JSON response)
        try:
            print(f"DEBUG: Fetching data from {url}", file=sys.stderr)
        except:
            pass
        
        # שולחים בקשה GET ל-API
        # verify=False אומר לא לבדוק תעודת SSL (כי זה localhost)
        # timeout=10 אומר לחכות עד 10 שניות לתשובה
        r = requests.get(url, verify=False, timeout=10)
        
        try:
            print(f"DEBUG: Status code: {r.status_code}", file=sys.stderr)
        except:
            pass
        
        # בודקים שהבקשה הצליחה (קוד 200 = הצלחה)
        if r.status_code != 200:
            try:
                print(f"DEBUG: Error - Status code {r.status_code}", file=sys.stderr)
            except:
                pass
            return None
        
        # ממירים את התשובה ל-JSON
        data = r.json()
        
        # בודקים שיש נתונים
        if not data or len(data) == 0:
            try:
                print(f"DEBUG: No data found for issue_id {issue_id}", file=sys.stderr)
            except:
                pass
            return None
        
        # יוצרים DataFrame (טבלה) מהנתונים
        df = pd.DataFrame(data)
        
        try:
            print(f"DEBUG: Received {len(df)} records", file=sys.stderr)
        except:
            pass
        
        return df
    except Exception as e:
        # אם קרתה שגיאה, מדפיסים לוג ומחזירים None
        try:
            print(f"DEBUG: Error in fetch_analytics: {str(e)}", file=sys.stderr)
        except:
            pass
        return None


# מנסים לזהות מספר גיליון בשאלה
issue_id = extract_issue_id(query)
analytics_df = None
issues_list = None

# בודקים אם השאלה היא על גיליונות באופן כללי (לא גיליון ספציפי)
is_general_question = any(word in query.lower() for word in ['כמה גליונות', 'כמה גיליונות', 'מספר גליונות', 'מספר גיליונות', 'רשימת גליונות', 'רשימת גיליונות'])

# אם השאלה היא כללית על גיליונות, מושכים את רשימת הגיליונות
if is_general_question and not issue_id:
    try:
        print(f"DEBUG: General question about issues detected", file=sys.stderr)
    except:
        pass
    issues_list = fetch_issues()

# אם נמצא מספר גיליון, מנסים למשוך נתונים
if issue_id:
    # לוגים לדיבוג - נשלחים ל-stderr באנגלית כדי למנוע בעיות encoding
    try:
        print(f"DEBUG: Found issue_id: {issue_id}", file=sys.stderr)
    except:
        pass
    
    # מנסים למשוך נתוני אנליטיקות מה-API
    analytics_df = fetch_analytics(issue_id)
    
    if analytics_df is not None:
        # הצלחנו לטעון נתונים
        try:
            print(f"DEBUG: Loaded {len(analytics_df)} analytics records", file=sys.stderr)
        except:
            pass
    else:
        # לא הצלחנו לטעון נתונים
        try:
            print(f"DEBUG: Could not load analytics for issue_id {issue_id}", file=sys.stderr)
        except:
            pass
else:
    # לא נמצא מספר גיליון בשאלה
    try:
        print("DEBUG: No issue_id found in query", file=sys.stderr)
    except:
        pass

# ============================================================
# שלב 3: בניית פרומפט (prompt) עבור ה-AI
# ============================================================

def build_prompt(query, session, analytics_df, issues_list):
    """
    בונה את הפרומפט (ההוראות והנתונים) שנשלח ל-AI של OpenAI.
    
    Args:
        query (str): השאלה הנוכחית של המשתמש
        session (list): היסטוריית השיחה (כל ההודעות הקודמות)
        analytics_df (pandas.DataFrame או None): נתוני אנליטיקות אם יש
        issues_list (list או None): רשימת גיליונות אם יש
        
    Returns:
        list: רשימת הודעות לשליחה ל-AI
    """
    messages = []

    # הודעת מערכת - מגדירה את התפקיד של ה-AI
    messages.append({
        "role": "system",
        "content": (
            "את עוזרת אנליטיקות חכמה של מגזין השדרה. "
            "את יודעת להסביר נתונים, לזהות תובנות, ולהגיב בצורה ברורה וקצרה.\n\n"
            "מידע חשוב על המערכת:\n"
            "- מגזין השדרה הוא מגזין דיגיטלי שמפרסם גיליונות (issues) באופן קבוע\n"
            "- כל גיליון מכיל מודעות (ads) עם נתוני ביצועים (קליקים, קוראים ייחודיים, CTR וכו')\n"
            "- גיליון = issue = מהדורה אחת של המגזין\n"
            "- כשמשתמשים שואלים על 'גיליון' או 'גליונות', הם מתכוונים למהדורות של המגזין\n"
            "- אם משתמש שואל 'כמה גליונות יש?' או 'כמה גיליונות יש?', הם מתכוונים למספר המהדורות/גיליונות במערכת\n"
            "- אם משתמש שואל על גיליון ספציפי (למשל 'גיליון 5'), הם מתכוונים למהדורה מסוימת\n"
            "- את יכולה לענות על שאלות כלליות על המערכת גם בלי נתונים ספציפיים\n"
            "- אם אין נתונים ספציפיים, את יכולה להסביר מה זה גיליונות במגזין השדרה"
        )
    })

    # מוסיפים את היסטוריית השיחה (כל ההודעות הקודמות)
    for msg in session:
        messages.append({
            "role": "user" if msg["Role"] == "user" else "assistant",  # ממירים את התפקיד לפורמט של OpenAI
            "content": msg["Content"]  # התוכן של ההודעה
        })

    # אם יש רשימת גיליונות, מוסיפים אותה להודעת מערכת
    if issues_list is not None and len(issues_list) > 0:
        issues_info = []
        for issue in issues_list:
            issue_id_val = issue.get("issueId", issue.get("IssueId", "N/A"))
            title = issue.get("title", issue.get("Title", "ללא כותרת"))
            issue_date = issue.get("issueDate", issue.get("IssueDate", "ללא תאריך"))
            issues_info.append(f"גיליון {issue_id_val}: {title} (תאריך: {issue_date})")
        
        issues_text = "\n".join(issues_info)
        messages.append({
            "role": "system",
            "content": f"להלן רשימת כל הגיליונות במערכת (סה\"כ {len(issues_list)} גיליונות):\n{issues_text}"
        })

    # אם יש נתוני אנליטיקות, מוסיפים אותם להודעת מערכת
    if analytics_df is not None:
        # ממירים את הטבלה לטקסט
        stats_text = analytics_df.to_string(index=False)
        messages.append({
            "role": "system",
            "content": f"להלן נתוני האנליטיקות של גיליון {issue_id}:\n{stats_text}"
        })

    # מוסיפים את השאלה הנוכחית של המשתמש
    messages.append({"role": "user", "content": query})

    return messages

# אם יש תשובה סופית מהשגיאה הקודמת, מדפיסים אותה ויוצאים
if final_reply:
    # מגדירים את הפונקציה output_result לפני השימוש
    def output_result(result_text):
        """פונקציה שמדפיסה את התשובה ל-stdout"""
        try:
            result_json = json.dumps({"reply": result_text}, ensure_ascii=False)
            try:
                sys.stdout.buffer.write(result_json.encode('utf-8'))
                sys.stdout.buffer.write(b'\n')
                sys.stdout.buffer.flush()
            except:
                print(result_json)
                sys.stdout.flush()
        except:
            try:
                print(json.dumps({"reply": result_text}, ensure_ascii=False))
                sys.stdout.flush()
            except:
                print('{"reply": "Error writing output"}')
                sys.stdout.flush()
    output_result(final_reply)
    sys.exit(0)

# בונים את הפרומפט עם כל המידע
try:
    messages = build_prompt(query, session, analytics_df, issues_list)
except Exception as e:
    # אם יש שגיאה בבניית הפרומפט, מדפיסים לוג וממשיכים עם פרומפט בסיסי
    try:
        print(f"DEBUG: Error building prompt: {str(e)}", file=sys.stderr)
    except:
        pass
    messages = [{"role": "user", "content": query}]

# ============================================================
# שלב 4: שליחת בקשה ל-AI של OpenAI
# ============================================================

# משתנה לאחסון התשובה
reply = ""

try:
    # יוצרים client של OpenAI עם מפתח ה-API
    client = OpenAI(api_key=OPENAI_KEY)
    
    # שולחים בקשה ל-AI
    completion = client.chat.completions.create(
        model="gpt-4o-mini",      # המודל של OpenAI שאנחנו משתמשים בו
        messages=messages,         # הפרומפט שבנינו
        max_tokens=500            # מקסימום 500 תווים בתשובה
    )

    # מחלצים את התשובה מה-AI
    reply = completion.choices[0].message.content

except Exception as e:
    # אם קרתה שגיאה, מחזירים הודעת שגיאה
    reply = f"⚠️ שגיאה בעת יצירת תשובה מה-AI: {str(e)}"
    # מדפיסים את השגיאה ל-stderr לדיבוג
    try:
        print(f"DEBUG: Error in AI call: {str(e)}", file=sys.stderr)
    except:
        pass

# ============================================================
# שלב 5: החזרת התשובה לשרת (stdout)
# ============================================================

# בודקים שיש תשובה
if not reply:
    reply = "⚠️ לא התקבלה תשובה מה-AI"

# אם יש תשובה סופית מהשגיאה הקודמת, משתמשים בה
if final_reply:
    reply = final_reply

# מוודאים שהתשובה תמיד תודפס - גם אם יש שגיאה
def output_result(result_text):
    """פונקציה שמדפיסה את התשובה ל-stdout"""
    try:
        # יוצרים JSON עם התשובה
        result_json = json.dumps({
            "reply": result_text
        }, ensure_ascii=False)  # ensure_ascii=False מאפשר תווים בעברית

        # כותבים את ה-JSON ל-stdout (הפלט הסטנדרטי)
        # משתמשים ב-buffer כדי לשלוט על ה-encoding
        try:
            sys.stdout.buffer.write(result_json.encode('utf-8'))
            sys.stdout.buffer.write(b'\n')  # שורה חדשה בסוף
            sys.stdout.buffer.flush()  # מוודאים שהכל נשלח
        except:
            # אם יש בעיה עם buffer, מנסים להדפיס דרך print רגיל
            print(result_json)
            sys.stdout.flush()
    except Exception as e:
        # אם יש בעיה בהדפסה, מנסים להדפיס דרך print רגיל
        try:
            print(json.dumps({"reply": result_text}, ensure_ascii=False))
            sys.stdout.flush()
        except Exception as e2:
            # אם גם זה נכשל, מדפיסים שגיאה ל-stderr
            try:
                print(f"DEBUG: Error writing output: {str(e)}, {str(e2)}", file=sys.stderr)
            except:
                pass
            # מנסים להדפיס תשובה בסיסית
            try:
                print('{"reply": "Error writing output"}')
                sys.stdout.flush()
            except:
                # אם גם זה נכשל, אין מה לעשות
                pass

# מדפיסים את התשובה - מוודאים שזה תמיד קורה
try:
    output_result(reply)
except Exception as e:
    # אם יש בעיה בהדפסה, מנסים להדפיס תשובה בסיסית
    try:
        print(f'{{"reply": "{reply}"}}')
        sys.stdout.flush()
    except:
        try:
            print('{"reply": "Error in output"}')
            sys.stdout.flush()
        except:
            pass
