-- יצירת טבלת הודעות חגיגיות/מבצעים
CREATE TABLE IF NOT EXISTS announcements (
    announcement_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    type VARCHAR(50) DEFAULT 'news',  -- promotion, holiday, news, update
    icon VARCHAR(50),
    background_color VARCHAR(100),
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority DESC);

-- הודעה לדוגמה
INSERT INTO announcements (title, content, type, icon, background_color, action_text, priority, is_active)
VALUES (
    'ברוכים הבאים לאתר החדש!',
    'אנחנו שמחים להציג את האתר המחודש של מגזין השדרה. גלו את כל הגיליונות במקום אחד!',
    'news',
    '🎉',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'לגיליון האחרון',
    10,
    true
);

COMMENT ON TABLE announcements IS 'הודעות חגיגיות, מבצעים ועדכונים לקוראים';
COMMENT ON COLUMN announcements.type IS 'סוג ההודעה: promotion, holiday, news, update';
COMMENT ON COLUMN announcements.priority IS 'עדיפות - מספר גבוה יותר מוצג ראשון';

