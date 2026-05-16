// Background service worker for the Refresh Bookmarks extension

async function fetchPageTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract title from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }

    // Fallback: try og:title meta tag
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      return ogTitleMatch[1].trim();
    }

    return null;
  } catch (error) {
    console.error(`Error fetching title from ${url}:`, error);
    return null;
  }
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

async function refreshBookmarks(): Promise<{ updated: number; failed: number; message: string }> {
  const bookmarks = await chrome.bookmarks.getTree();
  let updated = 0;
  let failed = 0;

  async function processNode(node: chrome.bookmarks.BookmarkTreeNode): Promise<void> {
    // If it's a bookmark (has url) and has empty or missing title
    if (node.url && (!node.title || node.title.trim() === '')) {
      if (isValidUrl(node.url)) {
        console.log(`Processing bookmark with empty title: ${node.url}`);

        const newTitle = await fetchPageTitle(node.url);

        if (newTitle) {
          try {
            await chrome.bookmarks.update(node.id, { title: newTitle });
            console.log(`Updated bookmark ${node.id}: "${newTitle}"`);
            updated++;
          } catch (error) {
            console.error(`Failed to update bookmark ${node.id}:`, error);
            failed++;
          }
        } else {
          console.warn(`Could not fetch title for ${node.url}`);
          failed++;
        }
      } else {
        console.warn(`Skipping non-http(s) URL: ${node.url}`);
        failed++;
      }
    }

    // Recursively process child nodes
    if (node.children) {
      for (const child of node.children) {
        await processNode(child);
      }
    }
  }

  for (const root of bookmarks) {
    await processNode(root);
  }

  const message = `Refreshed bookmarks: ${updated} updated, ${failed} failed`;
  console.log(message);
  return { updated, failed, message };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'refreshBookmarks') {
    refreshBookmarks().then((result) => {
      sendResponse(result);
    }).catch((error) => {
      console.error('Error refreshing bookmarks:', error);
      sendResponse({ updated: 0, failed: 0, message: `Error: ${error.message}` });
    });

    // Return true to indicate we'll send the response asynchronously
    return true;
  }
});
