# Windows Deployment Script for MangaVerse Backend

# 1. Install Node.js (if not already installed)
# Download from: https://nodejs.org/

# 2. Install PostgreSQL (if not already installed)
# Download from: https://www.postgresql.org/download/windows/

# 3. Create database and user
# Open PostgreSQL command line (psql) as postgres user:
# psql -U postgres

# Run these commands in psql:
# CREATE DATABASE mangaverse;
# CREATE USER mangaverse_user WITH PASSWORD 'your_secure_password';
# GRANT ALL PRIVILEGES ON DATABASE mangaverse TO mangaverse_user;
# \q

# 4. Clone/Upload your backend code to your VPS
# Example path: C:\inetpub\manga-backend\

# 5. Install dependencies
cd C:\path\to\your\backend\folder
npm install

# 6. Set up environment variables
# Copy .env.production to .env and update with your actual values
copy .env.production .env
# Edit .env file with your actual database password and JWT secret

# 7. Run database migrations
npm run migrate

# 8. Install PM2 globally for process management
npm install -g pm2

# 9. Create logs directory
mkdir logs

# 10. Start the application with PM2
pm2 start ecosystem.config.json

# 11. Save PM2 configuration
pm2 save

# 12. Set up PM2 to start on system boot
pm2 startup

# 13. Install and configure Nginx (optional but recommended)
# Download from: http://nginx.org/en/download.html

# 14. Configure Windows Firewall
# Allow inbound connections on port 3001 (or your chosen port)
# netsh advfirewall firewall add rule name="Node.js API" dir=in action=allow protocol=TCP localport=3001

# 15. Test the API
# curl http://localhost:3001/api/health

# 16. For production with domain and SSL:
# - Point your domain to your VPS IP
# - Use Nginx as reverse proxy
# - Get SSL certificate (Let's Encrypt with win-acme or similar)

echo "Backend deployment completed!"
echo "API should be running on http://localhost:3001"
echo "Health check: http://localhost:3001/api/health"