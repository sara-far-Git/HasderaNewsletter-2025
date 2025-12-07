#!/usr/bin/env python3
"""
סקריפט ליצירת משתמש Admin
"""
import requests
import json

def create_admin_user():
    url = "http://localhost:5055/api/User/create-admin"
    
    try:
        response = requests.post(url, headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            data = response.json()
            print("✅ משתמש Admin נוצר/עודכן בהצלחה!")
            print(f"📧 מייל: {data.get('user', {}).get('email', 'N/A')}")
            print(f"👤 שם: {data.get('user', {}).get('fullName', 'N/A')}")
            print(f"🔑 תפקיד: {data.get('user', {}).get('role', 'N/A')}")
            print(f"\n💡 הודעה: {data.get('message', 'N/A')}")
        else:
            print(f"❌ שגיאה: {response.status_code}")
            print(f"תגובה: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ שגיאה: לא ניתן להתחבר לשרת. ודאי שהשרת רץ על http://localhost:5055")
    except Exception as e:
        print(f"❌ שגיאה: {e}")

if __name__ == "__main__":
    print("🚀 יוצר משתמש Admin...")
    print("📧 מייל: 8496444@gmail.com")
    print("🔑 סיסמה: 039300165")
    print("👤 שם: רבקי פרקש")
    print("-" * 50)
    create_admin_user()

