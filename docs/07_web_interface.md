# Web Interface

pbnj includes a web interface for creating and managing pastes directly from your browser.

## Authentication

The web interface uses the same `AUTH_KEY` as the CLI and API. Authentication state is stored in your browser's localStorage.

### Header Icons

The header displays different icons based on your login state:

| Icon | State | Action |
|------|-------|--------|
| Peanut | Logged out | Click to go to login page |
| Bread | Logged in | Click to create a new paste |
| Jelly | Logged in | Click to log out |

## Login

1. Click the peanut icon in the header (or navigate to `/login`)
2. Enter your `AUTH_KEY`
3. Press Enter or click the arrow button

After logging in, you'll be redirected back to the page you came from.

## Creating Pastes

When logged in, click the bread icon in the header to create a new paste.

### New Paste Page

The `/new` page provides a simple editor with these options:

- **Filename** - Optional name for your paste (defaults to "snippet")
- **Language** - Select language for syntax highlighting (or leave as "auto")
- **Private** - Toggle to make the paste unlisted (won't appear on homepage)
- **Save** - Click or press `Cmd/Ctrl + S` to save

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save paste |
| `Cmd/Ctrl + Enter` | Save paste |

## Deleting Pastes

When logged in, a trash icon appears on paste view pages. Click it to delete the paste immediately.

The delete button appears in:
- Desktop: Rightmost button in the action bar
- Mobile: At the bottom of the dropdown menu

## Logout

Click the jelly icon in the header to log out. This clears the auth key from your browser's localStorage.

---
Next: Back to 01_welcome.md
