-- כל הגיליונות
SELECT * 
FROM "Publications"
ORDER BY "Created Date" DESC;

-- צפיות יומיות
SELECT * 
FROM "DailyStats"
ORDER BY "Date" DESC;

-- הכי הרבה צפיות לפי גיליון
SELECT "Book Title", SUM("Views") AS total_views
FROM "DailyStats"
GROUP BY "Book Title"
ORDER BY total_views DESC;

-- סך צפיות לפי ימים
SELECT "Date", SUM("Views") AS total_views
FROM "DailyStats"
GROUP BY "Date"
ORDER BY "Date";
