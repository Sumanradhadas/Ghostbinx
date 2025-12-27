# Personal Gallery - Quick Start

## What's Built

✅ **Mandatory Login** - Password-protected gallery (set via `GALLERY_PASSWORD`)
✅ **GitHub Storage** - All items stored in your private GitHub repo
✅ **Text & Images** - Support for both content types
✅ **Responsive Grid** - Auto-adapts to desktop, tablet, mobile
✅ **Dark Mode** - Toggle in header, persists to localStorage
✅ **Actions** - Copy text, download images, delete items
✅ **Optimistic UI** - Items appear instantly before server sync

## Architecture

```
Login Page (password)
    ↓
Authenticated Dashboard
    ├── GET /api/items          (fetch all gallery items)
    ├── POST /api/items         (create text/image)
    └── DELETE /api/items/:id   (remove item)
         ↓
    GitHub Repository (_gallery/ directory)
```

## Current Status

**Environment Variables Set:**
- ✅ GITHUB_TOKEN (your GitHub PAT)
- ✅ GITHUB_REPO (owner/repo format)
- ✅ GALLERY_PASSWORD (login password)

**App Running:** http://localhost:5000

**To Test:**
1. Visit the site
2. Enter your `GALLERY_PASSWORD`
3. Try adding text or image content
4. Click items to view/copy/download
5. Check your GitHub repo - items appear in `_gallery/` directory

## File Structure

```
server/
  ├── github.ts         (GitHub API client - Octokit)
  ├── routes.ts         (API endpoints with JWT auth)
  └── storage.ts        (GitHubStorage implementation)

client/src/
  ├── pages/
  │   ├── login.tsx     (password entry)
  │   └── dashboard.tsx (gallery grid + modals)
  └── components/
      └── theme-toggle.tsx (dark mode)

shared/
  ├── schema.ts         (TypeScript types)
  └── routes.ts         (API contract with Zod)
```

## Deployment Checklist

- [ ] Verify env vars are set (GITHUB_TOKEN, GITHUB_REPO, GALLERY_PASSWORD)
- [ ] Test login locally (password should work)
- [ ] Test adding/deleting items (should appear in GitHub repo)
- [ ] Test dark mode toggle
- [ ] Deploy to Vercel with same env vars
- [ ] Test on production URL
- [ ] Share your gallery URL with friends/family

## Key Features

### Login
- Simple password entry
- JWT token stored in localStorage
- 30-day expiration
- Auto-redirect if token expires

### Gallery
- Items sorted by newest first
- Click any item to expand
- Text: preview visible, full content in modal
- Images: thumbnail visible, full-size in modal

### Add Content
- Type selector (Text/Image)
- Title + content required
- Image upload converts to base64 data URI
- Or paste image URL directly

### Delete
- Delete button available in item detail modal
- Removes from GitHub immediately
- Gallery updates optimistically

## API Endpoints

All `/api/items` routes require `Authorization: Bearer {token}` header.

```
POST /api/auth/login
  Request: { password: string }
  Response: { success: bool, token: string }

GET /api/items
  Response: Item[]

POST /api/items
  Request: { type: "text"|"image", title: string, content: string }
  Response: Item

DELETE /api/items/:id
  Response: 204 No Content
```

## Known Limitations

- ⚠️ Very large images (>5MB) may fail due to GitHub size limits
- ⚠️ GitHub API rate limit: 5000 requests/hour per token
- ⚠️ Base64-encoded images increase file size by ~33%
- ⚠️ Token expires after 30 days (must login again)

## Troubleshooting

**"Invalid password" on login**
→ Check GALLERY_PASSWORD env var is correct

**Items not saving**
→ Check GITHUB_TOKEN and GITHUB_REPO are correct in env vars

**GitHub API errors**
→ Verify token has `repo` scope: https://github.com/settings/tokens

**Items not visible after refresh**
→ Check if item saved in GitHub `_gallery/` directory
→ Verify GitHub token has read access

---

**Ready to deploy? Follow DEPLOYMENT.md for Vercel setup.**
