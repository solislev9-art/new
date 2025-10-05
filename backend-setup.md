# MangaVerse Backend Setup Guide

## Prerequisites
- Windows VPS with admin access
- Domain name pointed to your VPS IP
- Node.js 18+ installed
- PostgreSQL 15+ installed

## 1. PostgreSQL Setup

### Install PostgreSQL on Windows VPS:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the postgres user password
4. Add PostgreSQL bin to PATH

### Create Database:
```sql
-- Connect as postgres user
CREATE DATABASE mangaverse;
CREATE USER mangaverse_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mangaverse TO mangaverse_user;
```

## 2. Backend API Structure

### Project Structure:
```
manga-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── mangaController.js
│   │   └── commentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Manga.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── manga.js
│   │   └── comments.js
│   ├── config/
│   │   └── database.js
│   └── app.js
├── migrations/
├── package.json
└── server.js
```

## 3. Environment Variables (.env)
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mangaverse
DB_USER=mangaverse_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=https://yourdomain.com
```

## 4. Database Schema

### Users Table:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Manga Table:
```sql
CREATE TABLE manga (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(255),
    genre VARCHAR(255),
    status VARCHAR(50),
    cover_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chapters Table:
```sql
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    pages JSONB, -- Store page URLs as JSON array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manga_id, chapter_number)
);
```

### Comments Table:
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Comment Likes Table:
```sql
CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);
```

## 5. Deployment on Windows VPS

### Using PM2 (Process Manager):
```bash
npm install -g pm2
pm2 start server.js --name "manga-api"
pm2 startup
pm2 save
```

### Using IIS (Alternative):
1. Install IIS with URL Rewrite module
2. Install iisnode
3. Configure web.config for Node.js app

### Nginx Reverse Proxy (Recommended):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 6. SSL Certificate
```bash
# Using Certbot for Let's Encrypt
certbot --nginx -d api.yourdomain.com
```

## 7. API Endpoints

### Authentication:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### Manga:
- GET /api/manga
- GET /api/manga/:id
- GET /api/manga/:id/chapters
- GET /api/manga/:id/chapters/:chapterId

### Comments:
- GET /api/comments/:mangaId/:chapterId
- POST /api/comments
- PUT /api/comments/:id
- DELETE /api/comments/:id
- POST /api/comments/:id/like

## 8. Frontend Integration

Update your frontend to use the new API:
```javascript
const API_BASE_URL = 'https://api.yourdomain.com/api';
```