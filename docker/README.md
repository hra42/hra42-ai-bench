# Docker Setup Guide

## Quick Start

### 1. Using Pre-built Image from GitHub Container Registry (Recommended)

```bash
# Pull the latest image
docker pull ghcr.io/hra42/hra42-ai-bench:latest

# Copy environment variables
cp .env.example .env

# Edit .env and add your OpenRouter API key
nano .env

# Start the application using docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:3000`

### 2. Run with Docker (using pre-built image)

```bash
# Pull the latest image
docker pull ghcr.io/hra42/hra42-ai-bench:latest

# Run the container
docker run -d \
  --name hra42-ai-bench \
  -p 3000:3000 \
  -e OPENROUTER_API_KEY=your-api-key \
  -v hra42_data:/app/data \
  -v hra42_uploads:/app/uploads \
  ghcr.io/hra42/hra42-ai-bench:latest

# View logs
docker logs -f hra42-ai-bench

# Stop the container
docker stop hra42-ai-bench
docker rm hra42-ai-bench
```

### 3. Build Locally (for development or customization)

```bash
# Build the image locally
docker build -t hra42-ai-bench:local .

# Run the locally built container
docker run -d \
  --name hra42-ai-bench \
  -p 3000:3000 \
  -e OPENROUTER_API_KEY=your-api-key \
  -v hra42_data:/app/data \
  -v hra42_uploads:/app/uploads \
  hra42-ai-bench:local
```

## Development Setup

For development with hot reload:

```bash
# Use the development compose file
docker-compose -f docker-compose.dev.yml up

# The application will be available at http://localhost:5173
```

## Environment Variables

Required:

- `OPENROUTER_API_KEY`: Your OpenRouter API key

Optional:

- `OPENROUTER_BASE_URL`: API base URL (default: https://openrouter.ai/api/v1)
- `DATABASE_PATH`: Database file path (default: /app/data/hra42.duckdb)
- `PUBLIC_APP_NAME`: Application name (default: HRA42 AI Bench)
- `PUBLIC_MAX_FILE_SIZE`: Max upload size in bytes (default: 20971520)

## Data Persistence

The following directories are persisted as Docker volumes:

- `/app/data`: DuckDB database files
- `/app/uploads`: Uploaded files for benchmarks

## Health Check

The container includes a health check that pings `/api/health` every 30 seconds. You can check the health status with:

```bash
docker inspect hra42-ai-bench --format='{{.State.Health.Status}}'
```

## Troubleshooting

### Container won't start

- Check logs: `docker-compose logs app`
- Verify environment variables are set correctly
- Ensure port 3000 is not already in use

### Database errors

- The database is automatically created on first run
- To reset the database, remove the volume: `docker volume rm hra42-ai-bench_duckdb_data`

### Permission issues

- The container runs as non-root user (nodejs:1001)
- Ensure volumes have correct permissions

## Production Deployment

For production deployment:

1. Use a reverse proxy (nginx, Caddy, Traefik) for SSL termination
2. Set up proper backup strategy for the database volume
3. Configure monitoring and logging
4. Use environment-specific `.env` files
5. Consider using Docker Swarm or Kubernetes for orchestration

## Available Image Tags

Pre-built images are available on GitHub Container Registry:

- `ghcr.io/hra42/hra42-ai-bench:latest` - Latest stable release
- `ghcr.io/hra42/hra42-ai-bench:v1.0.0` - Specific version tags
- `ghcr.io/hra42/hra42-ai-bench:1.0` - Major.minor version tags
- `ghcr.io/hra42/hra42-ai-bench:1` - Major version tags

## Building for Different Architectures (Local Development)

```bash
# Build for ARM64 (Apple Silicon, AWS Graviton)
docker buildx build --platform linux/arm64 -t hra42-ai-bench:arm64 .

# Build for AMD64 (Intel/AMD)
docker buildx build --platform linux/amd64 -t hra42-ai-bench:amd64 .

# Build multi-platform image
docker buildx build --platform linux/amd64,linux/arm64 -t hra42-ai-bench:latest .
```
