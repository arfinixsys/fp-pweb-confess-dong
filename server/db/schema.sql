-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    sender_name VARCHAR(150),
    is_anonymous INTEGER DEFAULT 0,

    recipient_name VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    image_path TEXT,

    likes_count INTEGER DEFAULT 0,
    reports_count INTEGER DEFAULT 0,

    is_deleted INTEGER DEFAULT 0,
    is_approved INTEGER DEFAULT 1,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TRIGGER TO UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_timestamp
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- OPTIONAL: INDEX FOR FASTER SEARCHING
-- ============================================================
CREATE INDEX idx_messages_recipient ON messages(recipient_name);
CREATE INDEX idx_messages_user_id ON messages(user_id);
