document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('refreshButton') as HTMLButtonElement;
  const updateAllCheckbox = document.getElementById('updateAllCheckbox') as HTMLInputElement;
  const output = document.getElementById('output') as HTMLDivElement;
  const status = document.getElementById('status') as HTMLDivElement;
  const result = document.getElementById('result') as HTMLDivElement;
  const failures = document.getElementById('failures') as HTMLUListElement;

  button.addEventListener('click', async () => {
    button.disabled = true;
    output.classList.remove('hidden');
    status.textContent = 'Starting...';
    status.className = 'status loading';
    result.textContent = '';
    result.classList.add('hidden');
    failures.innerHTML = '';
    failures.classList.add('hidden');

    const port = chrome.runtime.connect({ name: 'refresh' });

    port.onMessage.addListener((message) => {
      if (message.type === 'progress') {
        status.textContent = `Processing ${message.current} of ${message.total}...`;
      } else if (message.type === 'complete') {
        status.textContent = 'Complete!';
        status.className = 'status success';
        result.textContent = message.result.message;
        result.classList.remove('hidden');

        const failureList: Array<{ title: string; url: string }> = message.result.failures ?? [];
        if (failureList.length > 0) {
          failures.innerHTML = '';
          for (const f of failureList) {
            const li = document.createElement('li');
            li.className = 'failure-item';
            const titleSpan = document.createElement('span');
            titleSpan.className = 'failure-title';
            titleSpan.textContent = f.title;
            const urlA = document.createElement('a');
            urlA.className = 'failure-url';
            urlA.href = f.url;
            urlA.target = '_blank';
            urlA.textContent = f.url;
            li.appendChild(titleSpan);
            li.appendChild(urlA);
            failures.appendChild(li);
          }
          failures.classList.remove('hidden');
        }

        port.disconnect();
        setTimeout(() => { button.disabled = false; }, 500);
      }
    });

    port.onDisconnect.addListener(() => {
      if (button.disabled) {
        status.textContent = 'Error!';
        status.className = 'status error';
        result.textContent = chrome.runtime.lastError?.message ?? 'Unexpected disconnect.';
        result.classList.remove('hidden');
        button.disabled = false;
      }
    });

    port.postMessage({
      action: 'refreshBookmarks',
      mode: updateAllCheckbox.checked ? 'empty' : 'all'
    });
  });
});
