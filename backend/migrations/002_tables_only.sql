-- Create tables only (no database creation)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manga table
CREATE TABLE IF NOT EXISTS manga (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(100),
    genre VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ongoing',
    cover_image VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_chapters INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    pages JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manga_id, chapter_number)
);

-- User library table
CREATE TABLE IF NOT EXISTS user_library (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'reading',
    current_chapter INTEGER DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, manga_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    page_number INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, manga_id, chapter_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manga_title ON manga(title);
CREATE INDEX IF NOT EXISTS idx_manga_genre ON manga(genre);
CREATE INDEX IF NOT EXISTS idx_chapters_manga_id ON chapters(manga_id);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_manga_id ON comments(manga_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_manga ON reading_progress(user_id, manga_id);

-- Insert sample data
INSERT INTO manga (title, description, author, genre, status, cover_image, rating, total_chapters) VALUES
('My Life Turned Around After Being Cheated on and Falsely Accused', 'A story of redemption and second chances', 'Unknown Author', 'Drama, Romance', 'ongoing', '/images/front/1.webp', 4.5, 3)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (manga_id, chapter_number, title, pages) VALUES
(1, 1, 'Chapter 1: The Beginning', '[]'),
(1, 2, 'Chapter 2: New Hope', '[]'),
(1, 3, 'Chapter 3: Moving Forward', '[]')
ON CONFLICT DO NOTHING;