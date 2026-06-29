async function fetchPageTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }

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

type RefreshMode = 'empty' | 'all';

type FailedBookmark = {
  title: string;
  url: string;
};

type RefreshResult = {
  processed: number;
  updated: number;
  unchanged: number;
  failed: number;
  failures: FailedBookmark[];
  message: string;
};

function collectBookmarks(
  node: chrome.bookmarks.BookmarkTreeNode,
  mode: RefreshMode,
  result: chrome.bookmarks.BookmarkTreeNode[] = []
): chrome.bookmarks.BookmarkTreeNode[] {
  if (node.url && isValidUrl(node.url) && (mode === 'all' || !node.title || node.title.trim() === '')) {
    result.push(node);
  }
  if (node.children) {
    for (const child of node.children) {
      collectBookmarks(child, mode, result);
    }
  }
  return result;
}

async function refreshBookmarks(
  mode: RefreshMode,
  onProgress: (current: number, total: number) => void
): Promise<RefreshResult> {
  const tree = await chrome.bookmarks.getTree();
  const targets: chrome.bookmarks.BookmarkTreeNode[] = [];
  for (const root of tree) {
    collectBookmarks(root, mode, targets);
  }

  const total = targets.length;
  let updated = 0;
  let unchanged = 0;
  let failed = 0;
  const failures: FailedBookmark[] = [];

  for (let i = 0; i < targets.length; i++) {
    const node = targets[i];
    onProgress(i + 1, total);

    const newTitle = await fetchPageTitle(node.url!);

    if (newTitle) {
      try {
        if (node.title !== newTitle) {
          await chrome.bookmarks.update(node.id, { title: newTitle });
          updated++;
        } else {
          unchanged++;
        }
      } catch (error) {
        console.error(`Failed to update bookmark ${node.id}:`, error);
        failed++;
        failures.push({ title: node.title || node.url!, url: node.url! });
      }
    } else {
      console.warn(`Could not fetch title for ${node.url}`);
      failed++;
      failures.push({ title: node.title || node.url!, url: node.url! });
    }
  }

  const modeLabel = mode === 'all' ? 'all bookmarks' : 'empty-title bookmarks';
  const message = `Refreshed ${modeLabel}: ${total} processed, ${updated} updated, ${unchanged} unchanged, ${failed} failed`;
  console.log(message);
  return { processed: total, updated, unchanged, failed, failures, message };
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'refresh') return;

  port.onMessage.addListener((request) => {
    if (request.action !== 'refreshBookmarks') return;

    const mode: RefreshMode = request.mode === 'all' ? 'all' : 'empty';

    refreshBookmarks(mode, (current, total) => {
      port.postMessage({ type: 'progress', current, total });
    }).then((result) => {
      port.postMessage({ type: 'complete', result });
    }).catch((error) => {
      console.error('Error refreshing bookmarks:', error);
      port.postMessage({
        type: 'complete',
        result: { processed: 0, updated: 0, unchanged: 0, failed: 0, failures: [], message: `Error: ${error.message}` }
      });
    });
  });
});
