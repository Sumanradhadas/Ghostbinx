# GitHub Setup Instructions

## Problem
The app is reporting: **"Failed to save to GitHub: Not Found"**

This means one of the GitHub environment variables is incorrect or missing.

## Solution: Verify Your Environment Variables

### Step 1: Check Your Environment Variables in Replit
1. Go to **Secrets** (left sidebar)
2. Verify these THREE variables are set correctly:

```
GITHUB_TOKEN=ghp_... (starts with ghp_)
GITHUB_REPO=username/repository-name
GALLERY_PASSWORD=your_password
```

### Step 2: Verify GitHub Repository Exists
The repository must already exist on GitHub:
1. Go to https://github.com/username/repository-name
2. Replace `username` and `repository-name` with your actual values
3. Make sure it's a PRIVATE repository (for security)

### Step 3: Verify GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click on your PAT (should show in the list)
3. Verify it has these scopes:
   - ✅ `repo` (full control of private repositories)
4. If it doesn't have `repo` scope, regenerate the token with correct permissions

### Step 4: Verify Token Format
The GITHUB_REPO environment variable MUST be in format:
```
owner/repository-name
```

✅ **Correct**: `johndoe/my-gallery`
❌ **Wrong**: `my-gallery` (missing owner)
❌ **Wrong**: `https://github.com/johndoe/my-gallery` (should not include URL)

### Step 5: Test the Connection
After fixing the environment variables:
1. Click "Restart" on the workflow
2. Wait for the server to start
3. Check the server logs for: `✓ GitHub repository access verified`
4. If you see that message, your GitHub connection is working!

## Common Issues

### "GITHUB_TOKEN: NOT SET"
- The GITHUB_TOKEN secret is not defined
- Go to Secrets and add it
- Must start with `ghp_`

### "GITHUB_REPO: NOT SET"
- The GITHUB_REPO environment variable is not defined
- Go to Secrets and add it
- Format: `owner/repo` (no URL, no trailing slashes)

### "Repository: owner/repo"
- The GitHub API is being called correctly, but the repo doesn't exist or token doesn't have access
- Verify:
  1. Repository actually exists on GitHub
  2. Token has 'repo' scope permissions
  3. Token hasn't expired (regenerate if needed)

## After Fixing

1. The server should start with message: `✓ GitHub repository access verified: owner/repo`
2. You can then login and try adding items
3. Items will be saved to your GitHub repo in the `_gallery/` directory

## Still Having Issues?

Check the server logs in the workflow panel for specific error messages.
Common messages:
- "Repository not found" → repo doesn't exist or token can't access it
- "Bad credentials" → GITHUB_TOKEN is invalid or expired
- "Validation Failed" → GITHUB_REPO format is wrong
