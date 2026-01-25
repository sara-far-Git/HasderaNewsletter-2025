-- יצירת טבלאות מדורים (Sections)
-- טבלת מדורים ראשית
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    icon VARCHAR(10),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת תוכן מדורים
CREATE TABLE IF NOT EXISTS section_contents (
    id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    excerpt VARCHAR(500),
    content TEXT,
    image_url VARCHAR(500),
    published BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(100) DEFAULT 'מערכת השדרה',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת תגובות לתוכן
CREATE TABLE IF NOT EXISTS content_comments (
    id SERIAL PRIMARY KEY,
    content_id INTEGER NOT NULL REFERENCES section_contents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(100) NOT NULL,
    text VARCHAR(1000) NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת לייקים לתוכן
CREATE TABLE IF NOT EXISTS content_likes (
    id SERIAL PRIMARY KEY,
    content_id INTEGER NOT NULL REFERENCES section_contents(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id, user_id)
);

-- אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_sections_active ON sections(is_active);
CREATE INDEX IF NOT EXISTS idx_sections_key ON sections(section_key);
CREATE INDEX IF NOT EXISTS idx_section_contents_section ON section_contents(section_id);
CREATE INDEX IF NOT EXISTS idx_section_contents_published ON section_contents(published);
CREATE INDEX IF NOT EXISTS idx_section_contents_created ON section_contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_comments_content ON content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_approved ON content_comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_content_likes_content ON content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user ON content_likes(user_id);

-- הוספת המדורים הראשוניים
INSERT INTO sections (section_key, title, description, icon, color, sort_order, is_active) VALUES
    ('recipes', 'מתכונים', 'מתכונים טעימים, טיפים קולינריים וסודות המטבח שלנו', '🍳', '#f59e0b', 1, TRUE),
    ('stories', 'סיפורים בהמשכים', 'סיפורים מרגשים שילוו אותך לאורך כל השבוע', '📚', '#8b5cf6', 2, TRUE),
    ('challenges', 'חידות ואתגרים', 'סודוקו, חידות חשיבה ואתגרים שבועיים מאתגרים', '🧩', '#ec4899', 3, TRUE),
    ('giveaways', 'הגרלות ופרסים', 'השתתפי בהגרלות שבועיות ותזכי בפרסים מדהימים', '🎁', '#10b981', 4, TRUE),
    ('articles', 'כתבות וטורים', 'טורים אישיים, כתבות מעמיקות ושיחות מהלב', '☕', '#92400e', 5, TRUE),
    ('market', 'לוח קהילתי', 'קניה, מכירה, שירותים - הכל בתוך הקהילה שלנו', '🛍️', '#059669', 6, TRUE)
ON CONFLICT (section_key) DO NOTHING;

-- הערות לטבלאות
COMMENT ON TABLE sections IS 'מדורי תוכן באזור הקוראים';
COMMENT ON TABLE section_contents IS 'תכנים בתוך מדורים';
COMMENT ON TABLE content_comments IS 'תגובות של קוראות על תכנים';
COMMENT ON TABLE content_likes IS 'לייקים של קוראות על תכנים';

