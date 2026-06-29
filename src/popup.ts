document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('refreshButton') as HTMLButtonElement;
  const updateAllCheckbox = document.getElementById('updateAllCheckbox') as HTMLInputElement;
  const output = document.getElementById('output') as HTMLDivElement;
  const status = document.getElementById('status') as HTMLDivElement;
  const result = document.getElementById('result') as HTMLDivElement;

  button.addEventListener('click', async () => {
    button.disabled = true;
    output.classList.remove('hidden');
    status.textContent = 'Starting...';
    status.className = 'status loading';
    result.textContent = '';

    const port = chrome.runtime.connect({ name: 'refresh' });

    port.onMessage.addListener((message) => {
      if (message.type === 'progress') {
        status.textContent = `Processing ${message.current} of ${message.total}...`;
      } else if (message.type === 'complete') {
        status.textContent = 'Complete!';
        status.className = 'status success';
        result.textContent = message.result.message;
        port.disconnect();
        setTimeout(() => { button.disabled = false; }, 500);
      }
    });

    port.onDisconnect.addListener(() => {
      if (button.disabled) {
        status.textContent = 'Error!';
        status.className = 'status error';
        result.textContent = chrome.runtime.lastError?.message ?? 'Unexpected disconnect.';
        button.disabled = false;
      }
    });

    port.postMessage({
      action: 'refreshBookmarks',
      mode: updateAllCheckbox.checked ? 'empty' : 'all'
    });
  });
});
