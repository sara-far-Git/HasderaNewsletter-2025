#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
סקריפט ליצירת אנליטיקות למשתמש שרה
יוצר אנליטיקות למודעות קיימות - המודעות נוצרות דרך הפרונט
"""

import requests
import urllib3
import json
import sys
from datetime import date, datetime, timedelta
import random

# השבתת אזהרות SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# כתובת ה-API
API_BASE_URL = "http://localhost:5055/api"

# פרטי התחברות למשתמש שרה
USER_EMAIL = "sara@hasdera.com"
USER_PASSWORD = "1234"

def login():
    """התחברות למשתמש שרה"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/User/login",
            json={"email": USER_EMAIL, "password": USER_PASSWORD},
            headers={"Content-Type": "application/json"},
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('token')
        else:
            print(f"❌ שגיאה בהתחברות: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ שגיאה בהתחברות: {e}")
        return None

def get_user_info(token):
    """קבלת פרטי המשתמש"""
    try:
        response = requests.get(
            f"{API_BASE_URL}/User/me",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ שגיאה בקבלת פרטי משתמש: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        return None

def get_dashboard_data(token):
    """קבלת נתוני הדשבורד"""
    try:
        response = requests.get(
            f"{API_BASE_URL}/User/advertiser/dashboard",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ שגיאה בקבלת נתוני דשבורד: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        return None

def get_available_slots(token, issue_id=None):
    """קבלת רשימת slots זמינים"""
    try:
        url = f"{API_BASE_URL}/Slots"
        if issue_id:
            url += f"?issue_id={issue_id}"
        
        response = requests.get(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️  לא ניתן לקבל slots: {response.status_code}")
            return []
    except Exception as e:
        print(f"⚠️  שגיאה בקבלת slots: {e}")
        return []

def get_available_issues(token):
    """קבלת רשימת גיליונות זמינים"""
    try:
        response = requests.get(
            f"{API_BASE_URL}/Issues",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️  לא ניתן לקבל גיליונות: {response.status_code}")
            return []
    except Exception as e:
        print(f"⚠️  שגיאה בקבלת גיליונות: {e}")
        return []

def create_analytics(ad_id, issue_id, clicks, unique_readers, report_date):
    """יצירת אנליטיקה"""
    try:
        # חישוב CTR
        ctr = (clicks / unique_readers * 100) if unique_readers > 0 else 0
        
        analytics_data = {
            "adId": ad_id,
            "issueId": issue_id,
            "clicksTotal": clicks,
            "uniqueReaders": unique_readers,
            "ctr": round(ctr, 2),
            "reportDate": report_date.isoformat() if isinstance(report_date, date) else report_date
        }
        
        response = requests.post(
            f"{API_BASE_URL}/Analytics",
            json=analytics_data,
            headers={"Content-Type": "application/json"},
            verify=False,
            timeout=30
        )
        
        if response.status_code == 201 or response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️  שגיאה ביצירת אנליטיקה: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"⚠️  שגיאה: {e}")
        return None

def create_demo_analytics():
    """יצירת אנליטיקות למודעות קיימות - המודעות נוצרות דרך הפרונט"""
    print("🚀 מתחיל יצירת אנליטיקות דמו...")
    print("="*60)
    
    # התחברות
    print("\n1️⃣ מתחבר למשתמש שרה...")
    token = login()
    if not token:
        print("❌ לא הצלחתי להתחבר!")
        print("💡 ודא שהשרת רץ על http://localhost:5055")
        return False
    
    print("✅ התחברות הצליחה!")
    
    # קבלת נתוני דשבורד
    print("\n2️⃣ מקבל נתוני דשבורד...")
    dashboard_data = get_dashboard_data(token)
    if not dashboard_data:
        print("❌ לא הצלחתי לקבל נתוני דשבורד!")
        return False
    
    ads = dashboard_data.get('Ads', [])
    print(f"✅ נמצאו {len(ads)} מודעות קיימות")
    
    if len(ads) == 0:
        print("\n⚠️  אין מודעות קיימות!")
        print("💡 העלי מודעות דרך הפרונט תחילה, ואז הרץ את הסקריפט שוב")
        return False
    
    # קבלת גיליונות זמינים
    print("\n3️⃣ מקבל רשימת גיליונות...")
    issues = get_available_issues(token)
    if not issues:
        print("⚠️  לא נמצאו גיליונות זמינים")
        issue_id = None
    else:
        issue_id = issues[0].get('issueId') if issues else None
        print(f"✅ נמצאו {len(issues)} גיליונות, משתמש בגיליון {issue_id}")
    
    # יצירת אנליטיקות למודעות קיימות
    print("\n4️⃣ יוצר אנליטיקות למודעות קיימות...")
    analytics_created = 0
    
    for ad in ads:
        ad_placement_id = ad.get('adplacementId') or ad.get('orderId')
        if not ad_placement_id:
            continue
        
        slot_name = ad.get('slot', {}).get('name', 'לא ידוע') if isinstance(ad.get('slot'), dict) else 'לא ידוע'
        print(f"\n   📢 מודעה: {slot_name} (ID: {ad_placement_id})")
        
        # יצירת מספר אנליטיקות לכל מודעה (לשבוע האחרון)
        for i in range(7):
            report_date = date.today() - timedelta(days=i)
            clicks = random.randint(10, 100)
            unique_readers = random.randint(50, 500)
            
            analytics = create_analytics(
                ad_id=ad_placement_id,
                issue_id=issue_id,
                clicks=clicks,
                unique_readers=unique_readers,
                report_date=report_date
            )
            
            if analytics:
                analytics_created += 1
                print(f"      ✅ {report_date}: {clicks} קליקים, {unique_readers} קוראים")
    
    print(f"\n✅ נוצרו {analytics_created} אנליטיקות")
    
    print("\n" + "="*60)
    print("✨ הסתיים בהצלחה!")
    print("="*60)
    print(f"📊 סה\"כ מודעות: {len(ads)}")
    print(f"📈 סה\"כ אנליטיקות שנוצרו: {analytics_created}")
    print("\n💡 עכשיו תוכלי להתחבר ולבדוק את האנליטיקות באזור האישי!")
    
    return True

if __name__ == "__main__":
    try:
        success = create_demo_analytics()
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  בוטל על ידי המשתמש")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ שגיאה כללית: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

