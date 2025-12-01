-- יצירת טבלת Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    refresh_token VARCHAR(255),
    google_id VARCHAR(255),
    advertiser_id INTEGER,
    CONSTRAINT fk_users_advertiser FOREIGN KEY (advertiser_id) REFERENCES advertisers(advertiser_id)
);

-- יצירת אינדקס על email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- יצירת אינדקס על google_id
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- יצירת טבלת PasswordResetTokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- יצירת אינדקס על token
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

