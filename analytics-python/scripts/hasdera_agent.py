import os
import requests
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI

# =====================================================================
# 1. טעינת משתני סביבה
# =====================================================================
load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_KEY:
    raise ValueError("❌ חסר מפתח API של OpenAI (בקובץ .env)")

client = OpenAI(api_key=OPENAI_KEY)

# =====================================================================
# 2. שלב איסוף הנתונים מה-API של .NET
# =====================================================================

def collect_data(issue_id: int):
    url = f"https://localhost:7083/api/analytics?issue_id={issue_id}"

    print(f"📡 מושך נתונים מ־ {url}")

    response = requests.get(url, verify=False)

    try:
        response.raise_for_status()
    except Exception as e:
        print("❌ שגיאה בשליחת הבקשה לשרת:", e)
        return None

    data = response.json()

    df = pd.DataFrame(data)
    print(f"📋 התקבלו {len(df)} רשומות.")

    print("📋 עמודות שהתקבלו:", list(df.columns))
    print(df.head())

    return df

# =====================================================================
# 3. שלב עיבוד נתונים
# =====================================================================

def analyze(df: pd.DataFrame):
    print("📊 מנתח נתונים...")

    required_cols = ["adId", "clicksTotal", "uniqueReaders", "ctr"]

    if not all(col in df.columns for col in required_cols):
        raise KeyError(f"❌ חסרות עמודות נדרשות. קיבלנו: {list(df.columns)}")

    # מסנן שורות שיש להן adId אמיתי
    df_ads = df[df["adId"].notna()]

    if df_ads.empty:
        print("⚠ אין מודעות עם נתונים.")
        return pd.DataFrame()

    summary = df_ads.groupby("adId")[["clicksTotal", "uniqueReaders", "ctr"]].sum().reset_index()

    print("📊 זוהה מבנה נתונים של Analytics למודעות:")
    print(summary)

    return summary

# =====================================================================
# 4. יצירת תובנה מה-AI
# =====================================================================

def generate_insight(summary: pd.DataFrame, issue_id: int):
    print("🤖 יוצר תובנה מה-AI...")

    table_text = "\n".join([
        f"מודעה {int(row.adId)}: {row.clicksTotal} הקלקות, {row.uniqueReaders} ייחודיים, CTR {row.ctr}"
        for _, row in summary.iterrows()
    ])

    prompt = f"""
    את עוזרת אנליטיקה של מגזין השדרה.
    קיבלת נתוני ביצועים של מודעות בגיליון מספר {issue_id}.

    נתונים:
    {table_text}

    תני תובנה שיווקית קצרה וברורה:
    - מה בלט?
    - מה היה חלש?
    - מה אפשר לשפר?
    - איך להסביר ללקוח את התוצאות?
    """

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt
        )

        return response.output_text

    except Exception as e:
        print("❌ שגיאה ב-GPT:", e)
        print("⚠ מצב Offline — מחזיר תובנה בסיסית.")

        return "לא ניתן ליצור תובנה מה-AI כרגע. הנתונים מראים כי יש מודעות עם CTR גבוה ומודעות חלשות יותר."

# =====================================================================
# 5. פונקציה ראשית שמפעילה את כל ה-Agent
# =====================================================================

def run_agent(issue_id: int):
    print("🚀 מפעיל את Hasdera AI Agent...")

    df = collect_data(issue_id)
    if df is None:
        print("❌ לא ניתן להמשיך — אין נתונים.")
        return

    summary = analyze(df)
    if summary is None or summary.empty:
        print("⚠ אין נתונים מספיקים לניתוח.")
        return

    insight = generate_insight(summary, issue_id)

    print("\n===========================")
    print("📘 תובנה סופית של ה-Agent:")
    print("===========================\n")
    print(insight)
    print("\n===========================\n")

    return {
        "issueId": issue_id,
        "summary": summary.to_dict(orient="records"),
        "insight": insight
    }

# הפעלה לדוגמה:
if __name__ == "__main__":
    result = run_agent(issue_id=36)
    print(json.dumps(result, ensure_ascii=False))

