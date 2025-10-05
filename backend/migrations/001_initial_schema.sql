-- Create database and user
CREATE DATABASE mangaverse;
CREATE USER mangaverse_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE mangaverse TO mangaverse_user;

-- Connect to mangaverse database and run the following:

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manga table
CREATE TABLE manga (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(255),
    genre VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus', 'cancelled')),
    cover_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chapters table
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    pages JSONB, -- Store page URLs as JSON array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manga_id, chapter_number)
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comment likes table
CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

-- Ratings table (optional)
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manga_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_manga_title ON manga(title);
CREATE INDEX idx_manga_genre ON manga(genre);
CREATE INDEX idx_chapters_manga_id ON chapters(manga_id);
CREATE INDEX idx_comments_manga_id ON comments(manga_id);
CREATE INDEX idx_comments_chapter_id ON comments(chapter_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);

-- Insert sample data
INSERT INTO manga (title, description, author, genre, status, cover_image) VALUES
('My Life Turned Around After Being Cheated on and Falsely Accused', 'A story of redemption and growth after betrayal', 'Unknown Author', 'Drama, Romance', 'ongoing', '/images/front/1.webp'),
('Sample Manga 2', 'Another great manga story', 'Author 2', 'Action, Adventure', 'ongoing', '/images/front/2.webp');

-- Insert sample chapters for the first manga
INSERT INTO chapters (manga_id, chapter_number, title, pages) VALUES
(1, 1, 'Chapter 1: The Beginning', '["ch1/1.webp", "ch1/02.webp", "ch1/03.webp", "ch1/04.webp", "ch1/05.webp"]'),
(1, 2, 'Chapter 2: Moving Forward', '["ch2/01.webp", "ch2/02.webp", "ch2/03.webp", "ch2/04.webp", "ch2/05.webp"]'),
(1, 3, 'Chapter 3: New Horizons', '["ch3/01.webp", "ch3/02.webp", "ch3/03.webp", "ch3/04.webp", "ch3/05.webp"]');