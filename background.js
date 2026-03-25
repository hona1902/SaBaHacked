// Handle extension icon click - open popup as new window
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Create new window with popup.html
    await chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 800,
      height: 600,
      left: 100,
      top: 100,
      focused: true
    });
  } catch (error) {
    console.error('Error opening popup:', error);
  }
});

// Handle capture requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURE_VISIBLE_TAB") {
    handleCaptureRequest(sender.tab, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.type === "CAPTURE_RESULT") {
    handleCaptureResult(message.dataUrl);
    return true;
  }
});

async function handleCaptureRequest(tab, sendResponse) {
  try {
    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 100
    });
    
    sendResponse({ ok: true, dataUrl });
  } catch (error) {
    console.error('Capture error:', error);
    sendResponse({ ok: false, error: error.message });
  }
}

async function handleCaptureResult(dataUrl) {
  try {
    // Store the captured image in storage for popup to retrieve
    await chrome.storage.local.set({ lastCapture: dataUrl });
    console.log('Capture result stored successfully');
  } catch (error) {
    console.error('Error storing capture result:', error);
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('SabaHacked extension installed/updated:', details.reason);

  // Auto-initialize settings from bundled config.json
  try {
    const resp = await fetch(chrome.runtime.getURL('config.json'));
    if (!resp.ok) return;
    const defaults = await resp.json();

    // Only set keys that are NOT already in storage (preserve user overrides)
    const existing = await chrome.storage.sync.get(null);
    const toSet = {};
    for (const [key, value] of Object.entries(defaults)) {
      if (!(key in existing)) {
        toSet[key] = value;
      }
    }
    if (Object.keys(toSet).length > 0) {
      await chrome.storage.sync.set(toSet);
      console.log('Auto-initialized settings from config.json:', Object.keys(toSet));
    }
  } catch (e) {
    console.error('Failed to auto-init settings:', e);
  }
});
