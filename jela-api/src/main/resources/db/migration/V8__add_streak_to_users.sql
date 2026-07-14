-- Add streak fields to users table
ALTER TABLE users ADD COLUMN streak_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN last_studied_at TIMESTAMP WITH TIME ZONE;
