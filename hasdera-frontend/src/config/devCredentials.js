// 🔧 משתנים קבועים לכניסה בפיתוח
// ⚠️ חשוב: קובץ זה מיועד לפיתוח בלבד! אל תשתמשי בו ב-production
// ⚠️ כל הברנץ' הזה מיועד למפרסמים בלבד

export const DEV_CREDENTIALS = {
  // כניסה מהירה למפרסמת (ברירת מחדל)
  advertiser: {
    email: 'advertiser@hasdera.com',
    password: 'advertiser123',
    role: 'Advertiser'
  }
};

// האם להציג כפתורי כניסה מהירה בפיתוח
export const ENABLE_DEV_LOGIN = import.meta.env.DEV; // true רק בפיתוח

