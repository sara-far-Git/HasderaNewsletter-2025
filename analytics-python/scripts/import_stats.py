import pandas as pd
from sqlalchemy import create_engine

print("🔍 טעינת קובץ...")
# קריאת הקובץ מהתיקייה data
df = pd.read_csv("data/Statistics_on_Books.csv", skiprows=1)

# ניקוי טאבים (\t) ורווחים מיותרים מכל הערכים
df = df.applymap(lambda x: str(x).strip() if isinstance(x, str) else x)

print("✅ טעינה ראשונית:")
print(df.head())

# טבלה Publications
print("🔍 יוצרים טבלה Publications...")
publications = df[["Book Title", "Created Date", "Total Views"]].copy()
print(publications.head())

# טבלה DailyStats
print("🔍 יוצרים טבלה DailyStats...")
daily_stats = df.melt(
    id_vars=["Book Title"],
    value_vars=df.columns[3:],  # כל העמודות מהתאריכים והלאה
    var_name="Date",
    value_name="Views"
)

# ניקוי עמודת התאריכים גם כאן
daily_stats["Date"] = daily_stats["Date"].str.strip()

print(daily_stats.head())

# חיבור ל-Postgres (עדכני לפי ההגדרות שלך)
engine = create_engine(
    "postgresql://Hasdera:Hasdera2025!@hasdera-db.c7gocuawyvty.eu-north-1.rds.amazonaws.com:5432/hasdera?sslmode=require"
)

# הכנסת נתונים ל-DB
print("⬆️ מעלה נתונים לטבלאות...")
publications.to_sql("Publications", engine, if_exists="append", index=False)
daily_stats.to_sql("DailyStats", engine, if_exists="append", index=False)

print("✅ הנתונים נטענו בהצלחה ל-DB")
