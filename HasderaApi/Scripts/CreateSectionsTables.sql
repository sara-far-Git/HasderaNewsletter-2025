-- יצירת טבלאות לניהול קטגוריות ותוכן

-- טבלת קטגוריות (Sections)
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת תוכן בקטגוריות (Section Contents)
CREATE TABLE IF NOT EXISTS section_contents (
    id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    excerpt VARCHAR(500),
    content TEXT NOT NULL,
    image_url VARCHAR(1000),
    published BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    author_id INTEGER,
    author_name VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת תגובות (Comments)
CREATE TABLE IF NOT EXISTS content_comments (
    id SERIAL PRIMARY KEY,
    content_id INTEGER NOT NULL REFERENCES section_contents(id) ON DELETE CASCADE,
    user_id INTEGER,
    author_name VARCHAR(200) NOT NULL,
    text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת לייקים (Likes)
CREATE TABLE IF NOT EXISTS content_likes (
    id SERIAL PRIMARY KEY,
    content_id INTEGER NOT NULL REFERENCES section_contents(id) ON DELETE CASCADE,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id, user_id)
);

-- יצירת אינדקסים לשיפור ביצועים
CREATE INDEX IF NOT EXISTS idx_sections_is_active ON sections(is_active);
CREATE INDEX IF NOT EXISTS idx_sections_sort_order ON sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_section_contents_section_id ON section_contents(section_id);
CREATE INDEX IF NOT EXISTS idx_section_contents_published ON section_contents(published);
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_is_approved ON content_comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_content_likes_content_id ON content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user_id ON content_likes(user_id);

-- הוספת קטגוריות ראשוניות (דוגמה)
INSERT INTO sections (section_key, title, description, icon, color, sort_order) VALUES
('recipes', 'מתכונים', 'מתכונים טעימים וקלים להכנה', '🍳', '#10b981', 1),
('stories', 'סיפורים', 'סיפורים בהמשכים', '📖', '#8b5cf6', 2),
('challenges', 'אתגרים', 'אתגרי השדרה', '🎯', '#f59e0b', 3),
('buy-sell', 'קניה ומכירה', 'לוח מודעות לקניה ומכירה', '💰', '#3b82f6', 4)
ON CONFLICT (section_key) DO NOTHING;

