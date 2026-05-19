let currentDomain = null;
let startTime = Date.now();

function getDomain(url) {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname) return null;
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

async function updateTime() {
  if (currentDomain && !currentDomain.startsWith('chrome://')) {
    const duration = Date.now() - startTime;
    const today = new Date().toLocaleDateString();

    const data = await chrome.storage.local.get(['usageData']);
    let usageData = data.usageData || {};

    if (!usageData[today]) {
      usageData[today] = {};
    }

    if (!usageData[today][currentDomain]) {
      usageData[today][currentDomain] = 0;
    }

    usageData[today][currentDomain] += duration;

    await chrome.storage.local.set({ usageData });
  }
  startTime = Date.now();
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateTime();
  const tab = await chrome.tabs.get(activeInfo.tabId);
  currentDomain = getDomain(tab.url);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    await updateTime();
    currentDomain = getDomain(changeInfo.url);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  await updateTime();
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    currentDomain = null;
  } else {
    const tabs = await chrome.tabs.query({ active: true, windowId });
    if (tabs.length > 0) {
      currentDomain = getDomain(tabs[0].url);
    }
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs.length > 0) {
    currentDomain = getDomain(tabs[0].url);
    startTime = Date.now();
  }
});

setInterval(async () => {
  if (currentDomain) {
    await updateTime();
  }
}, 10000);
