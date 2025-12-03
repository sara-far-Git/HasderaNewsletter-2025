-- עדכון המשתמש שרה להיות Admin
-- עדכן את האימייל כאן לפי האימייל האמיתי של המשתמש שרה
UPDATE users 
SET role = 'Admin' 
WHERE email = 's3296900@gmail.com' OR email LIKE '%שרה%' OR full_name LIKE '%שרה%';

-- בדיקה שהעדכון הצליח
SELECT id, full_name, email, role FROM users WHERE role = 'Admin';

