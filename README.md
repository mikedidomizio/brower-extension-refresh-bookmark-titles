# Chrome Refresh Bookmarks Extension

This Chrome extension automatically updates bookmarks that have empty titles by fetching the page title from the URL.

## Features

- 🔍 Scans all your bookmarks for empty titles
- 🌐 Fetches the page title from each bookmark URL
- ✅ Automatically updates bookmarks with the fetched titles
- 📊 Shows you how many bookmarks were updated

## Installation

1. **Build the extension:**
   ```bash
   npm run build
   ```

2. **Load in Chrome:**
   - Open Chrome and navigate to: `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right)
   - Click **Load unpacked**
   - Select the `chrome-refresh-bookmarks` directory
   - The extension is now installed!

3. **Use the extension:**
   - Click the extension icon in your Chrome toolbar
   - Click the "Refresh Now" button
   - Wait for the process to complete
   - See the results showing how many bookmarks were updated

## How it Works

1. Scans through your entire bookmark tree
2. Finds bookmarks with empty or whitespace-only titles
3. Fetches the HTML of each bookmark URL
4. Extracts the title from the `<title>` tag or `og:title` meta tag
5. Updates the bookmark with the fetched title
6. Shows a summary of updated/failed bookmarks

## Requirements

- Chrome (supports Manifest V3)
- Bookmarks to update

## Permissions

The extension requests:
- **bookmarks**: To read and update your bookmarks
- **activeTab**: For content script interaction
- **<all_urls>**: To fetch titles from any website

## Development

To make changes:

1. Edit the TypeScript files in `src/`
2. Run `npm run build`
3. Reload the extension in Chrome (on `chrome://extensions/`)

## Files

- `src/background.ts` - Service worker that handles the bookmark refresh logic
- `src/popup.ts` - Popup script that handles UI interactions
- `popup.html` - Popup interface
- `popup.css` - Popup styling
- `manifest.json` - Chrome extension manifest

