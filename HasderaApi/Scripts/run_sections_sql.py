#!/usr/bin/env python3
"""
Script to run CreateSectionsTables.sql on PostgreSQL database
"""
import sys
import os

# Try to import psycopg2
try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("❌ psycopg2 לא מותקן. התקיני עם:")
    print("   pip install psycopg2-binary")
    sys.exit(1)

# Database connection details from appsettings.json
DB_CONFIG = {
    'host': 'hasdera-before-move-va.cglio20u6t3o.us-east-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'hasdera',
    'user': 'Hasdera',
    'password': 'Hasdera2025!',
    'sslmode': 'require'
}

def run_sql_file(file_path):
    """Run SQL file on database"""
    try:
        # Read SQL file
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Connect to database
        print("🔌 מתחבר לדאטאבייס...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✅ התחברות הצליחה!")
        print("📝 מריץ את ה-SQL...")
        
        # Execute SQL (split by semicolons for better error handling)
        # But first, let's try executing the whole file
        cursor.execute(sql_content)
        
        print("✅ ה-SQL הורץ בהצלחה!")
        print("\n📊 הטבלאות נוצרו:")
        print("   - sections")
        print("   - section_contents")
        print("   - content_comments")
        print("   - content_likes")
        print("\n🎉 המדורים הראשוניים נוספו!")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ שגיאה בדאטאבייס: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"❌ הקובץ {file_path} לא נמצא!")
        sys.exit(1)
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        sys.exit(1)

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sql_file = os.path.join(script_dir, "CreateSectionsTables.sql")
    
    if not os.path.exists(sql_file):
        print(f"❌ הקובץ {sql_file} לא נמצא!")
        sys.exit(1)
    
    run_sql_file(sql_file)

