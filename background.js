// ── Popup Window Management ──
let popupWindowId = null;
let isRefocusing = false;

// Handle extension icon click - open popup as new window (or focus existing)
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // If popup already open, just focus it
    if (popupWindowId != null) {
      try {
        const existing = await chrome.windows.get(popupWindowId);
        if (existing) {
          // Restore if minimized, then focus
          if (existing.state === 'minimized') {
            await chrome.windows.update(popupWindowId, { state: 'normal', focused: true });
          } else {
            await chrome.windows.update(popupWindowId, { focused: true });
          }
          return;
        }
      } catch (_) {
        // Window no longer exists, reset
        popupWindowId = null;
      }
    }

    // Create new popup window
    const win = await chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 800,
      height: 750,
      left: 100,
      top: 100,
      focused: true
    });
    popupWindowId = win.id;
  } catch (error) {
    console.error('Error opening popup:', error);
  }
});

// ── Always-on-top: refocus popup when other windows gain focus ──
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  // Skip if no popup, if popup itself got focus, or already refocusing
  if (popupWindowId == null || windowId === popupWindowId || isRefocusing) return;
  // chrome.windows.WINDOW_ID_NONE means all windows lost focus (e.g. alt-tab away from Chrome)
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  // Small debounce to avoid rapid focus loops
  isRefocusing = true;
  setTimeout(async () => {
    try {
      const popup = await chrome.windows.get(popupWindowId);
      // Don't refocus if minimized — user intentionally hid it
      if (popup.state !== 'minimized') {
        await chrome.windows.update(popupWindowId, { focused: true });
      }
    } catch (_) {
      // Popup was closed
      popupWindowId = null;
    }
    isRefocusing = false;
  }, 100);
});

// ── Cleanup when popup window is closed ──
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
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
