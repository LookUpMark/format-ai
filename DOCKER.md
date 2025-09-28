# Docker Deployment Guide

This guide explains how to deploy FormatAI using Docker and Docker Compose.

## 🐳 Quick Start

### Prerequisites
- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)
- API keys for your preferred AI provider(s)

### Basic Deployment

1. **Clone and navigate to the repository**
   ```bash
   git clone https://github.com/your-username/format-ai.git
   cd format-ai
   ```

2. **Set up environment variables**
   ```bash
   # Create environment file for Docker
   cp .env.example .env

   # Edit the .env file with your API keys
   nano .env
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build -d
   ```

4. **Access the application**
   Open your browser and navigate to [http://localhost:5175](http://localhost:5175)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Keys (required for the application to work)
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Node environment (defaults to production)
NODE_ENV=production
```

### API Key Setup

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key to the `GEMINI_API_KEY` variable

#### OpenRouter
1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Sign up or log in
3. Add funds to your account (free tier available)
4. Create an API key
5. Copy your API key to the `OPENROUTER_API_KEY` variable

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Option 2: Docker Direct

```bash
# Build the image
docker build -t formatai:latest .

# Run the container
docker run -d \
  --name formatai-app \
  -p 5175:5175 \
  --env GEMINI_API_KEY=your_gemini_api_key \
  --env OPENROUTER_API_KEY=your_openrouter_api_key \
  --restart unless-stopped \
  formatai:latest
```

### Option 3: Docker with Environment File

```bash
# Create .env file
echo "GEMINI_API_KEY=your_key" > .env
echo "OPENROUTER_API_KEY=your_key" >> .env

# Run with env file
docker run -d \
  --name formatai-app \
  -p 5175:5175 \
  --env-file .env \
  --restart unless-stopped \
  formatai:latest
```

## 📊 Monitoring and Maintenance

### Health Checks

The container includes health checks:

```bash
# Check container health
docker ps
docker inspect formatai-app | grep -A 10 "Health"

# View health status specifically
docker exec formatai-app curl -f http://localhost:5175/health
```

### Viewing Logs

```bash
# View all logs
docker logs formatai-app

# Follow logs in real-time
docker logs -f formatai-app

# View nginx access logs
docker exec formatai-app tail -f /var/log/nginx/access.log

# View nginx error logs
docker exec formatai-app tail -f /var/log/nginx/error.log
```

### Container Management

```bash
# Enter container shell (for debugging)
docker exec -it formatai-app /bin/sh

# Restart container
docker restart formatai-app

# Remove container
docker stop formatai-app && docker rm formatai-app

# Clean up unused images
docker image prune -f
```

## 🔒 Security Features

The Docker configuration includes several security best practices:

- **Non-root user**: Application runs as `formatai` user (UID 1001)
- **Read-only filesystem**: Container filesystem is read-only except for specific directories
- **Capability dropping**: Unnecessary capabilities are dropped
- **Security options**: `no-new-privileges` enabled
- **Temporary filesystems**: `/tmp`, `/var/run`, and cache directories use tmpfs
- **Health checks**: Automated health monitoring

## 🌐 Production Deployment

### Environment Variables for Production

```bash
# Required
GEMINI_API_KEY=your_production_gemini_key
OPENROUTER_API_KEY=your_production_openrouter_key
NODE_ENV=production

# Optional (for docker-compose override)
COMPOSE_PROJECT_NAME=formatai-prod
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  formatai:
    image: formatai:latest
    container_name: formatai-prod
    restart: unless-stopped
    ports:
      - "5175:5175"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    networks:
      - formatai-network
    volumes:
      - nginx-logs:/var/log/nginx

volumes:
  nginx-logs:

networks:
  formatai-network:
    driver: bridge
```

### Reverse Proxy Setup

For production use with a domain name:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5175;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Container fails to start
```bash
# Check logs
docker logs formatai-app

# Check for port conflicts
netstat -tulpn | grep :5175
```

#### API keys not working
```bash
# Verify environment variables in container
docker exec formatai-app env | grep API_KEY

# Check container logs for errors
docker logs formatai-app | grep -i error
```

#### Build fails
```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose build --no-cache
```

#### Health check failing
```bash
# Test health endpoint manually
curl -f http://localhost:5175/health

# Check nginx status inside container
docker exec formatai-app nginx -t
```

### Performance Tuning

```yaml
# Add to docker-compose.yml for better performance
environment:
  - NODE_OPTIONS=--max-old-space-size=512
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

## 🔄 Updates

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Clean up old images
docker image prune -f
```

### Rolling Updates (Production)

```bash
# Build new version
docker build -t formatai:v2 .

# Run new version alongside old one
docker run -d \
  --name formatai-v2 \
  -p 5176:5175 \
  --env-file .env \
  formatai:v2

# Test new version, then switch ports
docker stop formatai-app
docker run -d \
  --name formatai-app \
  -p 5175:5175 \
  --env-file .env \
  formatai:v2
```

## 📋 Architecture

```
FormatAI Docker Architecture:
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               Nginx Container                         │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │                FormatAI App                        │ │ │
│  │  │  • React + TypeScript Frontend                   │ │ │
│  │  │  • Nginx Web Server                               │ │ │
│  │  │  • Port 5175                                      │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Network: formatai-network (172.20.0.0/16)                 │
│  Volume: nginx-logs (persistent)                            │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [React Production Build](https://react.dev/learn/start-a-new-react-project)

---

For support and issues, please check the [GitHub Issues](https://github.com/your-username/format-ai/issues) page.