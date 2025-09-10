namespace HasderaApi.Models
{
    /// <summary>
    /// טבלת אנליטיקות – נתוני שימוש וסטטיסטיקות
    /// </summary>
    public class Analytics
    {
        /// <summary>
        /// מזהה ייחודי לכל רשומה
        /// </summary>
        public int analytics_id { get; set; }

        /// <summary>
        /// שם הדף או המדור
        /// </summary>
        public string page_name { get; set; } = string.Empty;

        /// <summary>
        /// מספר הקלקות
        /// </summary>
        public int clicks { get; set; }

        /// <summary>
        /// מספר צפיות/חשיפות
        /// </summary>
        public int impressions { get; set; }

        /// <summary>
        /// תאריך יצירת הנתונים
        /// </summary>
        public DateTime created_at { get; set; }
    }
}
