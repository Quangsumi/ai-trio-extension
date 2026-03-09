// AI Trio — background service worker
// Only responsibility: open/focus the split screen window.

async function openSplitScreen() {
  const url = chrome.runtime.getURL('splitscreen.html');
  const existing = await chrome.tabs.query({ url });
  if (existing.length > 0) {
    chrome.tabs.update(existing[0].id, { active: true });
    chrome.windows.update(existing[0].windowId, { focused: true });
    return;
  }
  chrome.windows.create({ url, state: 'maximized', type: 'normal' });
}

chrome.action.onClicked.addListener(openSplitScreen);
