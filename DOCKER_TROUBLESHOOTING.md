# Docker Build Troubleshooting - RateMyMelon

## Issue Fixed: Frontend Build Failure

### Problem:
Docker build was failing with error:
```
npm error command failed
npm error command sh -c npm run server:install
```

### Root Cause:
The frontend `package.json` has a `postinstall` script that tries to install server dependencies, but during the Docker frontend build stage, the server directory doesn't exist yet.

### Solution Applied:
Modified [`Dockerfile`](Dockerfile:11) to skip scripts during frontend dependency installation:
```dockerfile
# Install frontend dependencies (skip postinstall to avoid server dependency issues)
RUN npm ci --only=production --ignore-scripts
```

## Deployment Recommendations

### For Render (Recommended):
- Use **native Node.js deployment** instead of Docker
- Simpler setup and better performance
- Follow the [`RENDER_DEPLOYMENT_GUIDE.md`](RENDER_DEPLOYMENT_GUIDE.md)

### For Docker (Advanced Users):
- Docker build now works correctly
- Use `docker-compose up` for local development
- Use `docker build .` for containerized deployment

## Build Commands Summary

### Render Deployment:
```bash
# Build Command:
npm install && cd server && npm install && cd .. && npm run build

# Start Command:
cd server && npm start
```

### Docker Deployment:
```bash
# Build:
docker build -t ratemymelon .

# Run:
docker run -p 3001:3001 --env-file server/.env ratemymelon
```

### Local Development:
```bash
# Frontend:
npm run dev

# Backend:
npm run server:dev
```

## Files Updated:
- ✅ [`Dockerfile`](Dockerfile) - Fixed frontend build issue
- ✅ [`RENDER_DEPLOYMENT_GUIDE.md`](RENDER_DEPLOYMENT_GUIDE.md) - Updated build commands
- ✅ [`render.yaml`](render.yaml) - Already had correct configuration

The deployment is now ready for both Render and Docker platforms!