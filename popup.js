function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `< 1m`;
}

async function updatePopup() {
  const today = new Date().toLocaleDateString();
  const data = await chrome.storage.local.get(['usageData']);
  const usageData = data.usageData || {};
  const todayData = usageData[today] || {};
  
  const siteList = document.getElementById('site-list');
  const totalTimeEl = document.getElementById('total-time');
  
  siteList.innerHTML = '';
  
  let totalMs = 0;
  const entries = Object.entries(todayData).sort((a, b) => b[1] - a[1]);
  
  if (entries.length === 0) {
    siteList.innerHTML = '<div class="no-data">No data recorded yet today.<br>Start browsing to track time.</div>';
    return;
  }
  
  for (const [domain, duration] of entries) {
    if (!domain || domain === 'null') continue;
    totalMs += duration;
    
    const item = document.createElement('div');
    item.className = 'site-item';
    
    const domainSpan = document.createElement('span');
    domainSpan.className = 'domain';
    domainSpan.textContent = domain;
    
    const durationSpan = document.createElement('span');
    durationSpan.className = 'duration';
    durationSpan.textContent = formatTime(duration);
    
    item.appendChild(domainSpan);
    item.appendChild(durationSpan);
    siteList.appendChild(item);
  }
  
  totalTimeEl.textContent = formatTime(totalMs);
}

document.addEventListener('DOMContentLoaded', () => {
  updatePopup();
  
  // Refresh UI data every second
  setInterval(updatePopup, 1000);
});
