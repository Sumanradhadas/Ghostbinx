# Personal Gallery - Deployment Guide

## Overview
A private, minimalist gallery application with mandatory login and GitHub-based storage. All content (text notes and images) is stored directly in a private GitHub repository.

## Architecture

### Frontend
- **Login Page** (`/login`) - Password-protected access
- **Dashboard** (`/`) - Responsive grid gallery with mixed text/image content
- **Features**: 
  - Add text notes or images (via URL or file upload)
  - View items in expanded modals
  - Copy text to clipboard
  - Download images
  - Delete items
  - Dark mode toggle
  - Authentication token stored in localStorage

### Backend
- **Authentication**: JWT-based with password validation
- **Storage**: GitHub API integration (Octokit)
- **Routes**:
  - `POST /api/auth/login` - Login with password
  - `GET /api/auth/status` - Check authentication
  - `GET /api/items` - List all gallery items
  - `POST /api/items` - Create new item
  - `DELETE /api/items/:id` - Delete item

### Storage Format
Items are stored in GitHub as JSON files in the `_gallery/` directory:
```
_gallery/
  ├── 1706840123456.json   (text note)
  ├── 1706840456789.json   (image with base64 or URL)
  └── ...
```

## Environment Variables

Required environment variables (set in Replit secrets):

```bash
# GitHub Personal Access Token (repo scope)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# GitHub repository (owner/repo format)
GITHUB_REPO=yourusername/my-gallery

# Single password for login
GALLERY_PASSWORD=your_secure_password

# Session/JWT secret (auto-generated from SESSION_SECRET)
SESSION_SECRET=your_session_secret
```

## Deployment Steps

### 1. Prepare GitHub Repository
- Create a private repository on GitHub
- No special setup needed - the app creates the `_gallery/` directory automatically

### 2. Create GitHub Personal Access Token
- Go to https://github.com/settings/tokens/new
- Select scopes: `repo` (full control of private repositories)
- Copy the token and save securely

### 3. Set Environment Variables
In Replit:
1. Go to Secrets panel (left sidebar)
2. Add three secrets:
   - `GITHUB_TOKEN` → your PAT from step 2
   - `GITHUB_REPO` → `username/repository-name`
   - `GALLERY_PASSWORD` → your chosen login password

3. Ensure `SESSION_SECRET` is already set (auto-generated)

### 4. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
```

Or connect your GitHub repo to Vercel for auto-deployments.

### 5. Configure Vercel Environment Variables
In Vercel project settings, add the same three environment variables:
- `GITHUB_TOKEN`
- `GITHUB_REPO`
- `GALLERY_PASSWORD`

## Usage

1. **Login**: Visit the site and enter the password set in `GALLERY_PASSWORD`
2. **View Gallery**: See all text notes and images in a responsive grid
3. **Add Content**: 
   - Click "Add Content" button
   - Choose Text or Image
   - For images: paste URL or upload file (converts to base64)
   - Click Save
4. **View Details**: Click any card to open full view
5. **Copy/Download**: 
   - Text items: Copy to clipboard
   - Images: Download to device
6. **Delete**: Remove items from gallery and GitHub
7. **Dark Mode**: Toggle theme (persists to localStorage)

## Technical Stack

- **Frontend**: React, TanStack Query, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Express.js, Node.js
- **Storage**: GitHub API (Octokit)
- **Auth**: JWT with Node.js crypto
- **Styling**: Tailwind CSS with dark mode support

## API Response Examples

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{ "password": "your_password" }

# Response (200)
{ "success": true, "token": "eyJhbGc..." }
```

### List Items
```bash
GET /api/items
Authorization: Bearer eyJhbGc...

# Response (200)
[
  {
    "id": "1706840123456",
    "type": "text",
    "title": "My Note",
    "content": "This is a text note",
    "createdAt": "2024-02-01T12:34:56.000Z"
  },
  {
    "id": "1706840456789",
    "type": "image",
    "title": "My Photo",
    "content": "data:image/jpeg;base64,...",
    "createdAt": "2024-02-01T13:45:00.000Z"
  }
]
```

### Create Item
```bash
POST /api/items
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "type": "text",
  "title": "New Note",
  "content": "Note content here"
}

# Response (201)
{
  "id": "1706841234567",
  "type": "text",
  "title": "New Note",
  "content": "Note content here",
  "createdAt": "2024-02-01T14:56:00.000Z"
}
```

## Security Notes

- **No Database**: All data stored in GitHub (no backend database compromise)
- **Private Repository**: Ensure GitHub repo is set to private
- **Token Scope**: PAT uses minimal `repo` scope
- **Password**: Change `GALLERY_PASSWORD` if compromised
- **HTTPS Only**: Deploy on HTTPS (Vercel provides this automatically)
- **No External Analytics**: Zero third-party tracking

## Limitations & Notes

- **Ephemeral State**: No session persistence if server restarts (login again)
- **Rate Limiting**: GitHub API has rate limits (60 req/min unauthenticated, 5000 authenticated)
- **Image Size**: Very large images (>5MB) may fail; base64 encoding increases data size by ~33%
- **Repository Size**: Git repositories have size limits; very large image libraries may hit limits

## Troubleshooting

### "GITHUB_TOKEN not found"
- Ensure `GITHUB_TOKEN` is set in environment variables
- Verify token hasn't expired (regenerate if needed)

### "Repository not found"
- Check `GITHUB_REPO` format: must be `owner/repo`
- Ensure repo is accessible with the token

### Images not displaying
- Check if image URL is still valid (external URLs may break)
- For data URIs: verify file wasn't corrupted during upload

### 401 Unauthorized errors
- Login again (token may have expired or been cleared)
- Check browser localStorage for `authToken`

## Future Enhancements

- [ ] Token refresh mechanism
- [ ] Batch operations (delete multiple items)
- [ ] Search/filter functionality
- [ ] Image optimization (resize, format conversion)
- [ ] Collaborative mode (multiple editors)
- [ ] Markdown support for text notes
- [ ] Export gallery as ZIP
