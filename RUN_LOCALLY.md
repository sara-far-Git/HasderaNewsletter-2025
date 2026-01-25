# 🚀 הוראות להרצה מקומית

## דרישות מוקדמות

1. **Node.js** (גרסה 18 ומעלה)
   ```bash
   node --version
   ```

2. **.NET SDK** (גרסה 8.0)
   ```bash
   dotnet --version
   ```

3. **npm** (מגיע עם Node.js)
   ```bash
   npm --version
   ```

---

## 📦 התקנת תלויות

### Frontend (React)
```bash
cd hasdera-frontend
npm install
```

### Backend (.NET)
התלויות מותקנות אוטומטית בעת הרצה.

---

## 🎯 הרצה

### אופציה 1: הרצה של שניהם יחד (מומלץ)

```bash
cd hasdera-frontend
npm run start:all
```

זה יריץ:
- **API** על `http://localhost:5055`
- **Frontend** על `http://localhost:5173`

---

### אופציה 2: הרצה נפרדת

#### Terminal 1 - Backend (API)
```bash
cd HasderaApi
export PATH="$HOME/.dotnet:$PATH"  # אם dotnet לא ב-PATH
dotnet run
```

ה-API יעלה על: `http://localhost:5055`

#### Terminal 2 - Frontend (React)
```bash
cd hasdera-frontend
npm run dev
```

ה-Frontend יעלה על: `http://localhost:5173`

---

## 🌐 גישה לאפליקציה

פתחי בדפדפן:
- **Frontend (קוראים)**: http://localhost:5173
- **API Swagger**: http://localhost:5055/swagger

---

## 🔧 פתרון בעיות

### פורט 5055 תפוס
```bash
# מצאי את התהליך ותסגרי אותו
lsof -ti :5055 | xargs kill -9
```

### פורט 5173 תפוס
```bash
# מצאי את התהליך ותסגרי אותו
lsof -ti :5173 | xargs kill -9
```

### שגיאת dotnet לא נמצא
```bash
export PATH="$HOME/.dotnet:$PATH"
```

או הוסיפי לשורת הפקודה:
```bash
~/.dotnet/dotnet run
```

### שגיאת npm install
```bash
# נקי את ה-cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 הערות

- ה-API מתחבר לדאטאבייס PostgreSQL ב-AWS (מוגדר ב-`appsettings.json`)
- ה-Frontend מתחבר ל-API על `http://localhost:5055/api`
- כל השינויים בקוד יתעדכנו אוטומטית (Hot Reload)

---

## ✅ בדיקה שהכל עובד

1. פתחי http://localhost:5173
2. התחברי עם Google
3. נסי להיכנס לאזור הקוראים
4. נסי להיכנס לאזור הניהול (אם יש לך הרשאות Admin)

---

**בהצלחה! 🎉**

