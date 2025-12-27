# Deploying to Vercel (Free Tier)

This project is fully compatible with Vercel's free tier using serverless functions and static file hosting. The configuration follows Vercel's documented schema with proper routing, caching, and function settings.

## Quick Start

Follow these steps to deploy:

## Prerequisites
- Vercel account (create at https://vercel.com)
- GitHub account with your repo connected

## Deployment Steps

### 1. Connect to Vercel
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Find and connect your repository

### 2. Configure Environment Variables
In the Vercel dashboard, go to **Settings > Environment Variables** and add:

**Required:**
- `GALLERY_PASSWORD` - Password for login (e.g., "demo123")
- `GITHUB_TOKEN` - Your GitHub personal access token (with `repo` scope)
- `GITHUB_REPO` - Repository in format `owner/repo` (e.g., "myuser/my-gallery")
- `SESSION_SECRET` - JWT signing secret (auto-generated if not set)

**All items are permanently stored in your GitHub repository and persist across deployments.**

### 3. Deploy
Vercel will automatically:
1. Build frontend with `npm run build` (configured in `vercel.json`)
2. Deploy serverless API routes from `/api` directory
3. Serve static frontend from `/dist/public`
4. Route `/api/*` requests to serverless functions
5. Handle SPA routing (all non-API routes serve `index.html`)

The `vercel.json` file includes:
- **buildCommand**: `npm run build` - Builds both frontend and API routes
- **outputDirectory**: `dist/public` - Where static files are served from
- **rewrites**: Route `/api/*` to functions and `/` to index.html for SPA routing
- **headers**: Cache control (static: 1 hour, API: no-cache)
- **functions**: API functions configured with 10s timeout and 1GB memory

## Configuration Details

### vercel.json Schema
The project uses Vercel's documented configuration schema with these properties:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": "vite",
  "rewrites": [...],
  "headers": [...],
  "functions": {...}
}
```

### Serverless API Routes
Express routes are converted to Vercel serverless functions:
- `api/auth/login.ts` → `POST /api/auth/login`
- `api/auth/status.ts` → `GET /api/auth/status`
- `api/items/index.ts` → `GET/POST /api/items`
- `api/items/[id].ts` → `DELETE /api/items/:id`
- `api/health.ts` → `GET /api/health`

**Function Configuration:**
- Max Duration: 10 seconds (free tier limit)
- Memory: 1024 MB
- Runtime: Node.js 20

### Frontend (SPA)
- **Framework**: React + Vite
- **Output**: Static files in `dist/public`
- **Routing**: Rewrites route all non-API requests to `/index.html` for SPA routing
- **Cache Headers**: 
  - Static files: 1 hour cache with must-revalidate
  - API routes: no-cache, no-store (fresh on every request)

## Features Supported on Free Tier

✅ Password-protected authentication (JWT)
✅ Gallery with add/delete items  
✅ Persistent GitHub storage (all items saved permanently)
✅ Static frontend assets with caching
✅ Serverless API routes with 10-second timeout
✅ Environment variable management

## Limitations

⚠️ WebSocket connections are NOT supported on Vercel free tier
⚠️ Database connections must be fast (< 10 seconds per request)
⚠️ No persistent server memory between requests

## Troubleshooting

**GitHub configuration is required:**
The app requires `GITHUB_TOKEN` and `GITHUB_REPO` to function. To set up:
1. Create a GitHub personal access token: https://github.com/settings/tokens
   - Requires `repo` scope for read/write access
2. Set environment variables:
   - `GITHUB_TOKEN`: Your personal access token
   - `GITHUB_REPO`: Repository in format `owner/repo` (e.g., `myuser/my-gallery`)
   - On Vercel: Add these in Project Settings > Environment Variables
   - On Replit: Add these in Secrets tab

**TypeScript errors during build:**
- Fixed: Added `@types/jsonwebtoken` to dependencies
- All API functions are now properly typed

**Slow deployments:**
- First deploy is slow as dependencies are installed
- Subsequent deployments are faster with caching

**Module not found errors:**
- Vercel doesn't support vite aliases in API routes
- API routes use relative imports (../../shared/schema)

## Local Testing

Test the Vercel configuration locally using:
```bash
npm install -g vercel
vercel dev
```

This simulates the Vercel environment locally on http://localhost:3000.

## Production vs Development

- **Replit**: Uses full Express server with all features
- **Vercel**: Uses serverless functions, ideal for scalability and cost efficiency
