-- יצירת משתמש מנהל עם המייל והסיסמה שצוינו
-- המייל: 8496444@gmail.com
-- הסיסמה: 039300165
-- שם: רבקי פרקש

-- הערה: עדיף להשתמש ב-endpoint POST /api/User/create-admin שיוצר את המשתמש עם hash נכון של הסיסמה
-- אבל אם צריך לעדכן ישירות במסד הנתונים, אפשר להשתמש בזה:

-- עדכון משתמש קיים להיות Admin
UPDATE users 
SET role = 'Admin', 
    full_name = 'רבקי פרקש'
WHERE email = '8496444@gmail.com';

-- אם המשתמש לא קיים, צריך ליצור אותו דרך ה-endpoint POST /api/User/create-admin
-- או להשתמש ב-register endpoint עם Role = 'Admin'

-- בדיקה שהמשתמש קיים ויש לו תפקיד Admin
SELECT id, full_name, email, role FROM users WHERE email = '8496444@gmail.com';

