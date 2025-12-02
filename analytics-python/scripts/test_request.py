import requests

print(" שולח בקשה לשרת...")

try:
    r = requests.get("https://localhost:7083/api/analytics?issue_id=36", verify=False)
    print("status:", r.status_code)
    print("response:")
    print(r.text)
except Exception as e:
    print("❌ שגיאה:")
    print(e)
