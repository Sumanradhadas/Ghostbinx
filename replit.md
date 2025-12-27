# My Gallery

## Overview
A personal gallery application that stores items (text and images) in a GitHub repository. It features password-protected access with JWT authentication.

## Architecture
- **Frontend**: React 18 with Vite, TailwindCSS, Radix UI components
- **Backend**: Express.js server
- **Storage**: GitHub repository (items stored as JSON files in `_gallery` directory)
- **Authentication**: JWT-based password authentication

## Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components (Radix-based)
│   │   ├── pages/       # Page components (dashboard, login)
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Server entry point (port 5000)
│   ├── routes.ts        # API routes
│   ├── github.ts        # GitHub storage integration
│   └── storage.ts       # Storage interface
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Zod schemas
│   └── routes.ts        # API route definitions
└── package.json
```

## Environment Variables
Required:
- `GALLERY_PASSWORD`: Password for login access
- `SESSION_SECRET`: JWT signing secret (auto-generated if not set)

Optional (for GitHub storage):
- `GITHUB_TOKEN`: GitHub personal access token with repo scope
- `GITHUB_REPO`: Target repository in format `owner/repo`

## Development
```bash
npm run dev     # Start development server on port 5000
npm run build   # Build for production
npm run start   # Run production server
```

## API Endpoints
- `POST /api/auth/login` - Authenticate with password
- `GET /api/auth/status` - Check authentication status
- `GET /api/items` - List all gallery items
- `POST /api/items` - Create a new item
- `DELETE /api/items/:id` - Delete an item

## Deployment

This project is configured for both **Replit** and **Vercel** deployment:

### Replit Deployment
- **Server**: Traditional Node.js Express server on port 5000
- **Features**: Full server capabilities, persistent runtime, WebSocket support
- **Environment**: Development or production ready
- **Start**: `npm run dev` (with hot reload)

### Vercel Deployment  
- **Framework**: Vite + React (SPA)
- **API**: Serverless functions in `/api` directory
- **Frontend**: Static files from `dist/public`
- **Config**: `vercel.json` with proper schema (buildCommand, outputDirectory, rewrites, headers, functions)
- **Routing**: SPA routing with rewrite fallback to `/index.html`
- **Caching**: Smart cache headers for static files and API routes
- **Environment Variables**: Configure in Vercel dashboard
  - Required: `GALLERY_PASSWORD`
  - Optional: `GITHUB_TOKEN`, `GITHUB_REPO`, `SESSION_SECRET`

See **`VERCEL_DEPLOYMENT.md`** for detailed deployment instructions.

## Configuration Files

- **`vercel.json`**: Vercel project configuration with build, routing, and function settings
- **`vite.config.ts`**: Frontend build configuration
- **`package.json`**: Build commands and dependencies

## Storage

**GitHub Storage (Required)**
- All gallery items are stored permanently in your GitHub repository
- Items persist across server restarts, deployments, and time
- Login anytime from any device to see your saved items

**Required Configuration:**
Set these environment variables:
- `GITHUB_TOKEN` - GitHub personal access token with `repo` scope
- `GITHUB_REPO` - Your repository in format `owner/repo`

On Replit: Add to Secrets tab  
On Vercel: Add in Project Settings > Environment Variables

## Recent Changes
- 2024-12-27: Imported project to Replit environment
- 2024-12-27: Added Vercel free tier compatibility (serverless API routes)
- 2024-12-27: Fixed TypeScript errors in API routes (@types/jsonwebtoken)
- 2024-12-27: Added fallback in-memory storage (works without GitHub)
- 2024-12-27: App automatically detects and uses optimal storage based on config
