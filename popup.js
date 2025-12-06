document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('removeBtn');
  const status = document.getElementById('status');

  btn.addEventListener('click', () => {
    status.textContent = 'Status: removing...';
    chrome.runtime.sendMessage({ action: 'remove_vcc' }, (resp) => {
      if (resp && resp.status === 'requested') {
        status.textContent = 'Status: removal requested';
      } else {
        status.textContent = 'Status: request sent';
      }
      // Optionally, query cookies to confirm removal (best-effort)
      try {
        chrome.cookies.getAll({ name: '7zap_vcc' }, (cookies) => {
          if (!cookies || cookies.length === 0) {
            status.textContent = 'Status: cookie not found';
          } else {
            status.textContent = `Status: ${cookies.length} cookie(s) remain`;
          }
        });
      } catch (e) {
        // If cookies permission/context not available, ignore
      }
    });
  });
});
