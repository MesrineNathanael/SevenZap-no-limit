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
      // After requesting removal, ask the background for an authoritative list of matching cookies
      setTimeout(() => {
        chrome.runtime.sendMessage({ action: 'list_7zap_cookies' }, (result) => {
          if (!result || !result.cookies) {
            status.textContent = 'Status: unable to list cookies';
            return;
          }
          const cookies = result.cookies;
          if (cookies.length === 0) status.textContent = 'Status: no 7zap_ cookies found';
          else if (cookies.length === 1) status.textContent = `Status: 1 cookie remain: ${cookies[0].name} @ ${cookies[0].domain}`;
          else status.textContent = `Status: ${cookies.length} cookies remain`;
        });
      }, 300);
    });
  });
});

// Also populate the popup with current matching cookies on open
document.addEventListener('DOMContentLoaded', () => {
  const status = document.getElementById('status');
  chrome.runtime.sendMessage({ action: 'list_7zap_cookies' }, (result) => {
    if (!result || !result.cookies) {
      status.textContent = 'Status: unable to list cookies';

    }
    const cookies = result.cookies;
    if (cookies.length === 0) status.textContent = 'Status: no 7zap_ cookies found';
    else if (cookies.length === 1) status.textContent = `Status: 1 cookie: ${cookies[0].name} @ ${cookies[0].domain}`;
    else status.textContent = `Status: ${cookies.length} cookies`;
  });
});
