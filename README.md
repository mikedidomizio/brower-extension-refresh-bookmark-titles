# Chrome Refresh Bookmarks Extension

This Chrome extension updates bookmark titles by fetching page titles from bookmark URLs.

## Features

- Refreshes bookmarks with empty titles (default mode)
- Optional mode to refresh all bookmarks
- Fetches title from `<title>` with `og:title` fallback
- Shows update/failure counts after each run

## Installation

1. Build the extension:
   ```bash
   npm run build
   ```
2. Open `chrome://extensions/`
3. Enable Developer mode
4. Click **Load unpacked**
5. Select `dist` inside this project

## Usage

1. Click the extension icon
2. (Optional) Enable **Update all bookmarks**
3. Click **Refresh Now**
4. Review the result counts shown in the popup

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
2. Run `npm run build` (this also regenerates extension icons)
3. Reload the extension in Chrome (on `chrome://extensions/`)

## Release Packaging

Create a Chrome Web Store upload zip locally:

```bash
npm run release:zip
```

This command validates that `package.json` and `manifest.json` versions match, builds `dist/`, and writes a zip file to `release/`.

When you push a git tag (for example `v1.0.1`), GitHub Actions runs the same packaging command, validates the tag matches the extension version, and uploads the zip as a build artifact.

## Files

- `src/background.ts` - Bookmark scanning/fetch/update logic
- `src/popup.ts` - Popup interactions and request mode
- `popup.html` - Popup structure
- `popup.css` - Popup styles
- `icons/` - Generated extension icons (16, 32, 48, 128)
- `manifest.json` - Extension manifest
