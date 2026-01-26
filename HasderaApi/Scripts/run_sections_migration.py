#!/usr/bin/env python3
"""
Script to run sections migration SQL
"""
import os
import sys
import json

try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
except ImportError:
    print("❌ psycopg2 not installed. Installing...")
    os.system("pip install psycopg2-binary")
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Read connection string from appsettings.json
def get_connection_string():
    appsettings_path = os.path.join(os.path.dirname(__file__), '..', 'appsettings.json')
    
    if not os.path.exists(appsettings_path):
        print(f"❌ appsettings.json not found at {appsettings_path}")
        print("Please provide connection string manually:")
        return input("Connection string: ").strip()
    
    with open(appsettings_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
        conn_str = config.get('ConnectionStrings', {}).get('DefaultConnection')
        
        if not conn_str:
            print("❌ DefaultConnection not found in appsettings.json")
            print("Please provide connection string manually:")
            return input("Connection string: ").strip()
        
        return conn_str

def run_migration():
    conn_str = get_connection_string()
    
    print("🔌 Connecting to database...")
    try:
        conn = psycopg2.connect(conn_str)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        print("✅ Connected successfully")
        
        # Read SQL file
        sql_file = os.path.join(os.path.dirname(__file__), 'CreateSectionsTables.sql')
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        print("📝 Executing migration...")
        cur.execute(sql)
        
        print("✅ Migration completed successfully!")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_migration()

