# Privacy Policy — Refresh Bookmarks

_Last updated: June 29, 2026_

## Overview

Refresh Bookmarks is a Chrome extension that fetches the current page title from each of your bookmarked URLs and updates the bookmark title to match. This policy explains what data the extension accesses and how it is used.

## Data accessed

The extension reads your Chrome bookmarks — specifically the URL and title of each bookmark — in order to perform its function. This data never leaves your device and is never sent to any server controlled by the extension developer.

## Network requests

When you click the refresh button, the extension sends standard HTTP GET requests to your bookmarked URLs in order to retrieve the HTML content of each page. It extracts only the page title (the `<title>` tag or `og:title` meta tag) from the response. No other content from these pages is read, stored, or transmitted.

These requests are equivalent to visiting the bookmarked pages yourself in a browser tab. The extension developer has no visibility into which pages are fetched or what titles are returned.

## Data collection and sharing

- The extension does **not** collect, store, or transmit any personal data.
- The extension does **not** use analytics, crash reporting, or any third-party services.
- No data is shared with the extension developer or any third party.

## Data storage

The extension does not maintain any persistent storage of its own. The only data written is the updated bookmark title, which is stored by Chrome in your local browser profile as a normal bookmark.

## Contact

If you have questions about this privacy policy, please contact: mikedidomizio+cws@gmail.com
