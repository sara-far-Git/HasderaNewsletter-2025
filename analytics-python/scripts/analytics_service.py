#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
שירות אנליטיקות - רץ כל הזמן ומספק אנליטיקות לבקנד
מתחבר למסד הנתונים וקורא נתונים אמיתיים מטבלאות clicks ו-adevents
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import date, timedelta, datetime
import os
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# פרטי חיבור למסד הנתונים
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'hasdera-db.c7gocuawyvty.eu-north-1.rds.amazonaws.com'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'hasdera'),
    'user': os.getenv('DB_USER', 'Hasdera'),
    'password': os.getenv('DB_PASSWORD', 'Hasdera2025!'),
    'sslmode': 'require'
}

def get_db_connection():
    """יצירת חיבור למסד הנתונים"""
    return psycopg2.connect(**DB_CONFIG)

def get_ad_analytics_from_db(ad_placement_id, issue_id=None, days=30):
    """חישוב אנליטיקות למודעה ספציפית ממסד הנתונים - רק אחרי פרסום העיתון"""
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        analytics = []
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        # קבלת OrderId וה-IssueId מה-AdPlacement
        cur.execute("""
            SELECT order_id, slot_id, issue_id
            FROM adplacements
            WHERE adplacement_id = %s
        """, (ad_placement_id,))
        placement_result = cur.fetchone()
        
        if not placement_result:
            return []
        
        order_id = placement_result['order_id']
        placement_issue_id = placement_result.get('issue_id') or issue_id
        
        # בדיקה אם העיתון פורסם
        if placement_issue_id:
            cur.execute("""
                SELECT issue_date
                FROM issues
                WHERE issue_id = %s
            """, (placement_issue_id,))
            issue_result = cur.fetchone()
            
            if issue_result:
                issue_date = issue_result['issue_date']
                # אם העיתון עדיין לא פורסם, נחזיר רשימה ריקה
                if isinstance(issue_date, date) and issue_date > date.today():
                    return []
                # אם העיתון פורסם היום או בעבר, נתחיל לספור מהתאריך הזה
                if isinstance(issue_date, date):
                    start_date = max(start_date, issue_date)
        
        # חיפוש AdId דרך Order ו-Advertiser
        # נחפש את ה-AdId שקשור לאותו Order דרך Advertiser
        cur.execute("""
            SELECT DISTINCT a.ad_id
            FROM ads a
            JOIN adorders ao ON a.advertiser_id = ao.advertiser_id
            WHERE ao.order_id = %s
            LIMIT 1
        """, (order_id,))
        ad_result = cur.fetchone()
        ad_id = ad_result['ad_id'] if ad_result else None
        
        # קבלת קליקים לפי AdId (אם נמצא)
        if ad_id:
            cur.execute("""
                SELECT 
                    DATE(timestamp) as report_date,
                    COUNT(*) as clicks_total,
                    COUNT(DISTINCT reader_id) as unique_readers
                FROM clicks
                WHERE ad_id = %s
                    AND timestamp >= %s
                    AND timestamp <= %s
                GROUP BY DATE(timestamp)
                ORDER BY report_date DESC
            """, (ad_id, start_date, end_date))
        else:
            # אם לא נמצא AdId, נחזיר רשימה ריקה
            cur.execute("SELECT NULL WHERE FALSE")
        
        clicks_data = cur.fetchall()
        
        # קבלת אירועי מודעה (views)
        cur.execute("""
            SELECT 
                DATE(event_time) as report_date,
                COUNT(*) as views_count
            FROM adevents
            WHERE adplacement_id = %s
                AND event_type = 'view'
                AND event_time >= %s
                AND event_time <= %s
            GROUP BY DATE(event_time)
            ORDER BY report_date DESC
        """, (ad_placement_id, start_date, end_date))
        
        views_data = cur.fetchall()
        
        # מיזוג נתונים
        analytics_dict = {}
        
        # הוספת קליקים
        for row in clicks_data:
            report_date = row['report_date']
            analytics_dict[report_date] = {
                "adId": ad_placement_id,
                "issueId": issue_id,
                "clicksTotal": row['clicks_total'] or 0,
                "uniqueReaders": row['unique_readers'] or 0,
                "views": 0,
                "reportDate": report_date.isoformat() if isinstance(report_date, date) else str(report_date)
            }
        
        # הוספת צפיות
        for row in views_data:
            report_date = row['report_date']
            if report_date in analytics_dict:
                analytics_dict[report_date]["views"] = row['views_count'] or 0
            else:
                analytics_dict[report_date] = {
                    "adId": ad_placement_id,
                    "issueId": issue_id,
                    "clicksTotal": 0,
                    "uniqueReaders": 0,
                    "views": row['views_count'] or 0,
                    "reportDate": report_date.isoformat() if isinstance(report_date, date) else str(report_date)
                }
        
        # חישוב CTR
        for key, value in analytics_dict.items():
            views = value.get("views", 0) or value.get("uniqueReaders", 0)
            clicks = value.get("clicksTotal", 0)
            if views > 0:
                value["ctr"] = round((clicks / views) * 100, 2)
            else:
                value["ctr"] = 0.0
        
        analytics = list(analytics_dict.values())
        analytics.sort(key=lambda x: x['reportDate'], reverse=True)
        
        return analytics
        
    except Exception as e:
        print(f"❌ שגיאה בקבלת אנליטיקות: {e}")
        import traceback
        traceback.print_exc()
        return []
    finally:
        if conn:
            cur.close()
            conn.close()

@app.route('/analytics/advertiser/<int:advertiser_id>', methods=['GET'])
def get_advertiser_analytics(advertiser_id):
    """קבלת אנליטיקות למפרסם ספציפי ממסד הנתונים"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # קבלת מודעות של המפרסם
        cur.execute("""
            SELECT 
                ap.adplacement_id,
                ap.order_id,
                ap.slot_id,
                ap.start_date,
                ap.end_date,
                ap.issue_id,
                s.name as slot_name,
                o.advertiser_id,
                o.status as order_status,
                i.issue_date,
                i.title as issue_title
            FROM adplacements ap
            JOIN adorders o ON ap.order_id = o.order_id
            LEFT JOIN slots s ON ap.slot_id = s.slot_id
            LEFT JOIN issues i ON ap.issue_id = i.issue_id
            WHERE o.advertiser_id = %s
            ORDER BY ap.start_date DESC NULLS LAST
            LIMIT 50
        """, (advertiser_id,))
        
        ads_data = cur.fetchall()
        
        # המרה לרשימה של dictionaries - AdPlacements
        ads = []
        for row in ads_data:
            ads.append({
                "adplacementId": row['adplacement_id'],
                "orderId": row['order_id'],
                "slotId": row['slot_id'],
                "startDate": row['start_date'].isoformat() if row['start_date'] else None,
                "endDate": row['end_date'].isoformat() if row['end_date'] else None,
                "issueId": row['issue_id'],
                "slot": {
                    "name": row['slot_name'] or "לא זמין"
                },
                "order": {
                    "status": row['order_status'] or "לא זמין",
                    "orderDate": row['order_date'].isoformat() if row['order_date'] else None
                },
                "issue": {
                    "issueId": row['issue_id'],
                    "issueDate": row['issue_date'].isoformat() if row['issue_date'] else None,
                    "title": row['issue_title']
                },
                "hasPlacement": True
            })
        
        # הוספת Orders עם Creatives שאין להם AdPlacement
        for row in orders_without_placement:
            ads.append({
                "creativeId": row['creative_id'],
                "orderId": row['order_id'],
                "order": {
                    "orderId": row['order_id'],
                    "status": row['order_status'] or "pending",
                    "orderDate": row['order_date'].isoformat() if row['order_date'] else None
                },
                "creative": {
                    "creativeId": row['creative_id'],
                    "fileUrl": row['file_url'],
                    "createdAt": row['created_at'].isoformat() if row['created_at'] else None
                },
                "hasPlacement": False,
                "status": "pending_placement"
            })
        
        # קבלת אנליטיקות לכל מודעה (רק למודעות עם placement)
        all_analytics = []
        days = int(request.args.get('days', 30))
        
        for ad in ads:
            if ad.get('hasPlacement') and ad.get('adplacementId'):
                ad_placement_id = ad['adplacementId']
                issue_id = ad.get('issueId')
                
                ad_analytics = get_ad_analytics_from_db(ad_placement_id, issue_id, days)
                all_analytics.extend(ad_analytics)
        
        cur.close()
        conn.close()
        
        return jsonify({
            "analytics": all_analytics,
            "ads": ads
        })
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/ad/<int:ad_id>', methods=['GET'])
def get_ad_analytics_endpoint(ad_id):
    """קבלת אנליטיקות למודעה ספציפית ממסד הנתונים"""
    try:
        days = int(request.args.get('days', 30))
        issue_id = request.args.get('issue_id', None)
        
        analytics = get_ad_analytics_from_db(ad_id, issue_id, days)
        
        return jsonify({
            "analytics": analytics
        })
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """בדיקת תקינות השירות"""
    return jsonify({"status": "ok", "service": "analytics"})

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5001))
    print(f"🚀 שירות אנליטיקות מתחיל על פורט {port}")
    app.run(host='0.0.0.0', port=port, debug=True)

