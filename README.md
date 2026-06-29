# Refresh Bookmark Titles

A browser extension that updates bookmark titles by fetching live page titles from bookmark URLs. Currently supports Chrome.

## Features

- Refreshes all bookmarks by default
- Optional mode to restrict updates to bookmarks with empty titles only
- Fetches title from `<title>` tag with `og:title` fallback
- Live progress counter while running ("Processing 3 of 47...")
- Summary of processed / updated / unchanged / failed counts after each run
- Failed bookmarks listed by name and URL so you can manually fix them

## Installation

1. Build the extension:
   ```bash
   npm run build
   ```

**Chrome**
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click **Load unpacked**
4. Select the `dist` folder inside this project

## Usage

1. Click the extension icon
2. (Optional) Check **Only refresh empty titles** to skip bookmarks that already have a title
3. Click **Refresh Now**
4. Watch the live progress counter as bookmarks are processed
5. Review the result summary — any bookmarks that could not be updated are listed by title and URL so you can open them and fix them manually

## How it Works

1. Scans the entire bookmark tree and collects all bookmarks that match the selected mode (all, or empty-title only)
2. Fetches the HTML of each bookmark URL one at a time
3. Extracts the page title from the `<title>` tag, falling back to the `og:title` meta tag
4. Updates the bookmark title if the fetched title differs from the current one
5. Streams progress back to the popup after each bookmark so the counter stays current
6. On completion, shows a summary and lists any bookmarks that failed (unreachable URLs, fetch errors, or update errors) with a clickable link for each

## Requirements

- A Manifest V3 compatible browser (currently Chrome)

## Permissions

- **bookmarks** — read and update your bookmarks
- **activeTab** — content script interaction
- **\<all_urls\>** — fetch titles from any website

## Development

1. Edit TypeScript source files in `src/`
2. Run `npm run build` (compiles TypeScript, copies assets, regenerates icons)
3. Reload the unpacked extension in your browser's extension manager

## Release Packaging

Create a Chrome Web Store upload zip locally:

```bash
npm run release:zip
```

This validates that `package.json` and `manifest.json` versions match, builds `dist/`, and writes a zip to `release/`.

When you push a git tag (e.g. `v1.0.1`), GitHub Actions runs the same packaging command, validates the tag matches the extension version, and uploads the zip as a build artifact.

## Files

| File | Purpose |
|------|---------|
| `src/background.ts` | Bookmark scanning, fetch, update logic, progress messaging |
| `src/popup.ts` | Popup UI interactions and live progress rendering |
| `popup.html` | Popup structure |
| `popup.css` | Popup styles |
| `icons/` | Generated extension icons (16, 32, 48, 128px) |
| `manifest.json` | Extension manifest |
