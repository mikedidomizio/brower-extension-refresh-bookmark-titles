// Popup script for the Refresh Bookmarks extension

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('refreshButton') as HTMLButtonElement;
  const updateAllCheckbox = document.getElementById('updateAllCheckbox') as HTMLInputElement;
  const output = document.getElementById('output') as HTMLDivElement;
  const status = document.getElementById('status') as HTMLDivElement;
  const result = document.getElementById('result') as HTMLDivElement;

  button.addEventListener('click', async () => {
    button.disabled = true;
    output.classList.remove('hidden');
    status.textContent = 'Refreshing bookmarks...';
    status.className = 'status loading';
    result.textContent = '';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'refreshBookmarks',
        mode: updateAllCheckbox.checked ? 'empty' : 'all'
      });

      status.textContent = 'Complete!';
      status.className = 'status success';
      result.textContent = response.message;

      // Re-enable button after a short delay
      setTimeout(() => {
        button.disabled = false;
      }, 500);
    } catch (error) {
      status.textContent = 'Error!';
      status.className = 'status error';
      result.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
      button.disabled = false;
    }
  });
});
